package io.mosip.registrationprocessor.externalstage.stage;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.mosip.kernel.core.exception.ExceptionUtils;
import io.mosip.kernel.core.logger.spi.Logger;
import io.mosip.registration.processor.core.abstractverticle.MessageBusAddress;
import io.mosip.registration.processor.core.abstractverticle.MessageDTO;
import io.mosip.registration.processor.core.abstractverticle.MosipEventBus;
import io.mosip.registration.processor.core.abstractverticle.MosipRouter;
import io.mosip.registration.processor.core.abstractverticle.MosipVerticleAPIManager;
import io.mosip.registration.processor.core.eventbus.MosipEventBusFactory;
import io.mosip.registration.processor.core.code.ApiName;
import io.mosip.registration.processor.core.code.EventId;
import io.mosip.registration.processor.core.code.EventName;
import io.mosip.registration.processor.core.code.EventType;
import io.mosip.registration.processor.core.code.ModuleName;
import io.mosip.registration.processor.core.code.RegistrationExceptionTypeCode;
import io.mosip.registration.processor.core.code.RegistrationTransactionStatusCode;
import io.mosip.registration.processor.core.code.RegistrationTransactionTypeCode;
import io.mosip.registration.processor.core.constant.LoggerFileConstant;
import io.mosip.registration.processor.core.exception.ApisResourceAccessException;
import io.mosip.registration.processor.core.exception.util.PlatformErrorMessages;
import io.mosip.registration.processor.core.exception.util.PlatformSuccessMessages;
import io.mosip.registration.processor.core.logger.LogDescription;
import io.mosip.registration.processor.core.logger.RegProcessorLogger;
import io.mosip.registration.processor.core.spi.restclient.RegistrationProcessorRestClientService;
import io.mosip.registration.processor.core.status.util.StatusUtil;
import io.mosip.registration.processor.core.status.util.TrimExceptionMessage;
import io.mosip.registration.processor.core.util.RegistrationExceptionMapperUtil;
import io.mosip.registration.processor.rest.client.audit.builder.AuditLogRequestBuilder;
import io.mosip.registration.processor.status.code.RegistrationStatusCode;
import io.mosip.registration.processor.status.dto.InternalRegistrationStatusDto;
import io.mosip.registration.processor.status.dto.RegistrationStatusDto;
import io.mosip.registration.processor.status.service.RegistrationStatusService;
import io.mosip.registrationprocessor.externalstage.entity.MessageRequestDTO;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

/**
 * Vert.x external stage: consumes {@code EXTERNAL_STAGE_BUS_IN}, POSTs registration
 * ids to EIS ({@link ApiName#EISERVICE}), updates registration status, then emits
 * {@code EXTERNAL_STAGE_BUS_OUT}.
 *
 * @see ExternalStageApplication
 */
@Service
public class ExternalStage extends MosipVerticleAPIManager {
	/** The reg proc logger. */
	private static Logger regProcLogger = RegProcessorLogger.getLogger(ExternalStage.class);
	
	private static final String STAGE_PROPERTY_PREFIX = "mosip.regproc.external.";

	private static final String LOCAL = "local";
	
	/** request id */
	private static final String ID = "io.mosip.registrationprocessor";
	/** request version */
	private static final String VERSION = "1.0";
	/** MOSIP event bus used by {@link #deployVerticle()}. */
	private MosipEventBus mosipEventBus;
	/** vertx Cluster Manager Url. */
	@Value("${vertx.cluster.configuration}")
	private String clusterManagerUrl;

	/** server port number. */
	@Value("${server.port}")
	private String port;

	/** HTTP path used by run-local smoke ({@code .../actuator/health}). */
	@Value("${server.servlet.path:/registrationprocessor/v1/external}")
	private String servletPath;

	/** worker pool size. */
	@Value("${worker.pool.size}")
	private Integer workerPoolSize;

	/** After this time intervel, message should be considered as expired (In seconds). */
	@Value("${mosip.regproc.external.message.expiry-time-limit}")
	private Long messageExpiryTimeLimit;

	@Autowired
	private AuditLogRequestBuilder auditLogRequestBuilder;

	/** The registration status service. */
	@Autowired
	private RegistrationStatusService<String, InternalRegistrationStatusDto, RegistrationStatusDto> registrationStatusService;

	/** rest client to send requests. */
	@Autowired
	private RegistrationProcessorRestClientService<Object> registrationProcessorRestService;

	/** Mosip router for APIs */
	@Autowired
	MosipRouter router;

	/** The description. */
	@Autowired
	LogDescription description;

	/** The Constant USER. */
	private static final String USER = "MOSIP_SYSTEM";

	/** Maps exception types to registration transaction status codes. */
	@Autowired
	RegistrationExceptionMapperUtil registrationStatusMapperUtil;

	@Autowired
	private MosipEventBusFactory mosipEventBusFactory;

	/**
	 * Deploys this verticle, then consumes {@code EXTERNAL_STAGE_BUS_IN} and sends
	 * {@code EXTERNAL_STAGE_BUS_OUT}.
	 */
	public void deployVerticle() {
		if (LOCAL.equals(System.getProperty("spring.profiles.active", ""))) {
			deployLocalVerticle();
			return;
		}
		this.mosipEventBus = this.getEventBus(this, clusterManagerUrl, workerPoolSize);
		this.consumeAndSend(mosipEventBus, MessageBusAddress.EXTERNAL_STAGE_BUS_IN,
				MessageBusAddress.EXTERNAL_STAGE_BUS_OUT, messageExpiryTimeLimit);
	}

	/**
	 * Profile {@code local} skips MOSIP {@code getEventBus} (Hazelcast cluster
	 * manager from {@code vertx-hazelcast} needs {@code MembershipListener} in
	 * {@code com.hazelcast.core}, which current Hazelcast no longer has). In-process
	 * Vert.x still binds {@link #start()} on {@code server.port}.
	 */
	void deployLocalVerticle() {
		int workers = workerPoolSize != null ? workerPoolSize : 10;
		Vertx vertx = Vertx.vertx(new VertxOptions().setWorkerPoolSize(workers));
		CompletableFuture<String> deployed = new CompletableFuture<>();
		vertx.deployVerticle(this, ar -> {
			if (ar.succeeded()) {
				deployed.complete(ar.result());
			} else {
				deployed.completeExceptionally(ar.cause());
			}
		});
		try {
			deployed.get();
			this.mosipEventBus = mosipEventBusFactory.getEventBus(vertx, "vertx", this.getClass().getSimpleName());
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException("Local Vert.x deploy interrupted", e);
		} catch (Exception e) {
			throw new IllegalStateException("Local Vert.x deploy failed", e);
		}
		this.consumeAndSend(this.mosipEventBus, MessageBusAddress.EXTERNAL_STAGE_BUS_IN,
				MessageBusAddress.EXTERNAL_STAGE_BUS_OUT, messageExpiryTimeLimit);
	}

	/**
	 * Registers HTTP routes for the stage and starts the Vert.x HTTP server.
	 */
	@Override
	public void start() {
		if (LOCAL.equals(System.getProperty("spring.profiles.active", ""))) {
			startLocalHttp();
			return;
		}
		router.setRoute(
				this.postUrl(getVertx(), MessageBusAddress.EXTERNAL_STAGE_BUS_IN, MessageBusAddress.EXTERNAL_STAGE_BUS_OUT));
		this.createServer(router.getRouter(), Integer.parseInt(port));
	}

	/**
	 * Profile {@code local} skips {@code postUrl}. MOSIP {@code VertxWebTracingLocal}
	 * needs Brave 5 {@code brave.http.HttpServerAdapter}; Boot 4 ships Brave 6,
	 * which dropped that class. Binds the same port and a JSON health GET for
	 * run-local smoke.
	 */
	void startLocalHttp() {
		Router localRouter = Router.router(getVertx());
		localRouter.route().handler(BodyHandler.create());
		String path = servletPath == null || servletPath.isBlank() ? "/registrationprocessor/v1/external" : servletPath;
		localRouter.get(path + "/actuator/health").handler(ctx -> ctx.response()
				.putHeader("content-type", "application/json")
				.end("{\"status\":\"UP\"}"));
		if (router != null) {
			router.setRoute(localRouter);
		}
		this.createServer(localRouter, Integer.parseInt(port));
	}

	/**
	 * POSTs the registration id to EIS, updates status, and sets {@code isValid}.
	 *
	 * @param object packet message from the SEDA bus
	 * @return the same message with validity / internal-error flags
	 */
	@Override
	public MessageDTO process(MessageDTO object) {

		TrimExceptionMessage trimExceptionMsg = new TrimExceptionMessage();

		boolean isTransactionSuccessful = false;
		String registrationId = object.getRid();
		object.setMessageBusAddress(MessageBusAddress.EXTERNAL_STAGE_BUS_IN);
		regProcLogger.debug(LoggerFileConstant.SESSIONID.toString(), LoggerFileConstant.REGISTRATIONID.toString(),
				registrationId, "ExternalStage::process()::entry");
		InternalRegistrationStatusDto registrationStatusDto = registrationStatusService
				.getRegistrationStatus(registrationId, object.getReg_type(), object.getIteration(), object.getWorkflowInstanceId());
		MessageRequestDTO requestdto = new MessageRequestDTO();
		requestdto.setId(ID);
		List<String> list = new ArrayList<String>();
		list.add(object.getRid());
		requestdto.setRequest(list);
		requestdto.setRequesttime(LocalDateTime.now().toString());
		requestdto.setVersion(VERSION);
		isTransactionSuccessful = false;
		try {
			registrationStatusDto
					.setLatestTransactionTypeCode(RegistrationTransactionTypeCode.EXTERNAL_INTEGRATION.toString());
			registrationStatusDto.setRegistrationStageName(this.getClass().getSimpleName());

			Boolean temp = (Boolean) registrationProcessorRestService.postApi(ApiName.EISERVICE, "", "", requestdto,
					Boolean.class);

			regProcLogger.debug(LoggerFileConstant.SESSIONID.toString(), LoggerFileConstant.REGISTRATIONID.toString(),
					"",
					"ExternalStage::process():: EIS service Api call  ended with response data : " + temp.toString());
			if (temp) {
				registrationStatusDto
						.setLatestTransactionStatusCode(RegistrationTransactionStatusCode.SUCCESS.toString());
				registrationStatusDto.setStatusComment(StatusUtil.EXTERNAL_STAGE_SUCCESS.getMessage());
				registrationStatusDto.setSubStatusCode(StatusUtil.EXTERNAL_STAGE_SUCCESS.getCode());
				registrationStatusDto.setStatusCode(RegistrationStatusCode.PROCESSING.toString());
				object.setIsValid(true);
				object.setInternalError(false);
				isTransactionSuccessful = true;
				description.setMessage(
						PlatformSuccessMessages.RPR_EXTERNAL_STAGE_SUCCESS.getMessage() + " -- " + registrationId);
				description.setCode(PlatformSuccessMessages.RPR_EXTERNAL_STAGE_SUCCESS.getCode());

			} else {
				registrationStatusDto.setLatestTransactionStatusCode(registrationStatusMapperUtil
						.getStatusCode(RegistrationExceptionTypeCode.EXTERNAL_INTEGRATION_FAILED));
				registrationStatusDto.setStatusComment(StatusUtil.EXTERNAL_STAGE_FAILED.getMessage());
				registrationStatusDto.setSubStatusCode(StatusUtil.EXTERNAL_STAGE_FAILED.getCode());
				registrationStatusDto.setStatusCode(RegistrationStatusCode.FAILED.toString());
				object.setIsValid(false);
				object.setInternalError(false);

				description
						.setMessage(PlatformErrorMessages.EXTERNAL_STAGE_FAILED.getMessage() + " -- " + registrationId);
				description.setCode(PlatformErrorMessages.EXTERNAL_STAGE_FAILED.getCode());
			}
			regProcLogger.info(LoggerFileConstant.SESSIONID.toString(), LoggerFileConstant.REGISTRATIONID.toString(),
					registrationId, description.getMessage());
		} catch (ApisResourceAccessException e) {
			registrationStatusDto.setStatusComment(
					trimExceptionMsg.trimExceptionMessage(StatusUtil.API_RESOUCE_ACCESS_FAILED + e.getMessage()));
			registrationStatusDto.setSubStatusCode(StatusUtil.API_RESOUCE_ACCESS_FAILED.getCode());
			registrationStatusDto.setStatusCode(RegistrationStatusCode.PROCESSING.toString());
			registrationStatusDto.setLatestTransactionStatusCode(registrationStatusMapperUtil
					.getStatusCode(RegistrationExceptionTypeCode.APIS_RESOURCE_ACCESS_EXCEPTION));
			description.setCode(PlatformErrorMessages.RPR_SYS_API_RESOURCE_EXCEPTION.getCode());
			description.setMessage(PlatformErrorMessages.RPR_SYS_API_RESOURCE_EXCEPTION.getMessage());
			regProcLogger.error(LoggerFileConstant.SESSIONID.toString(), description.getCode(), registrationId,
					description.getMessage() + e.getMessage() + ExceptionUtils.getStackTrace(e));
			object.setInternalError(true);
			object.setIsValid(false);
		} finally {

			if (object.getInternalError()) {
				registrationStatusDto.setUpdatedBy(USER);
				int retryCount = registrationStatusDto.getRetryCount() != null
						? registrationStatusDto.getRetryCount() + 1
						: 1;

				registrationStatusDto.setRetryCount(retryCount);
			}
			/** Module-Id can be Both Succes/Error code */
			String moduleId = isTransactionSuccessful ? PlatformSuccessMessages.RPR_EXTERNAL_STAGE_SUCCESS.getCode()
					: description.getCode();
			String moduleName = ModuleName.EXTERNAL.toString();
			registrationStatusService.updateRegistrationStatus(registrationStatusDto, moduleId, moduleName);
			if (isTransactionSuccessful) {
				description.setMessage(PlatformSuccessMessages.RPR_PKR_PACKET_VALIDATE.getMessage());
				description.setCode(PlatformSuccessMessages.RPR_PKR_PACKET_VALIDATE.getCode());
			}
			String eventId = isTransactionSuccessful ? EventId.RPR_402.toString() : EventId.RPR_405.toString();
			String eventName = isTransactionSuccessful ? EventName.UPDATE.toString() : EventName.EXCEPTION.toString();
			String eventType = isTransactionSuccessful ? EventType.BUSINESS.toString() : EventType.SYSTEM.toString();

			auditLogRequestBuilder.createAuditRequestBuilder(description.getMessage(), eventId, eventName, eventType,
					moduleId, moduleName, registrationId);
		}

		return object;
	}

	/**
	 * Vert.x property prefix {@code mosip.regproc.external.}.
	 *
	 * @return stage property prefix
	 */
	@Override
	protected String getPropertyPrefix() {
		return STAGE_PROPERTY_PREFIX;
	}

}
