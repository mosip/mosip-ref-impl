package io.mosip.biosdk.client.impl.spec_1_0;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import io.mosip.biosdk.client.config.LoggerConfig;
import io.mosip.biosdk.client.dto.*;
import io.mosip.biosdk.client.utils.Util;
import io.mosip.kernel.biometrics.constant.BiometricType;
import io.mosip.kernel.biometrics.entities.BiometricRecord;
import io.mosip.kernel.biometrics.model.MatchDecision;
import io.mosip.kernel.biometrics.model.QualityCheck;
import io.mosip.kernel.biometrics.model.Response;
import io.mosip.kernel.biometrics.model.SDKInfo;
import io.mosip.kernel.biometrics.spi.IBioApi;
import io.mosip.kernel.core.logger.spi.Logger;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.*;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

import static io.mosip.biosdk.client.constant.AppConstants.LOGGER_IDTYPE;
import static io.mosip.biosdk.client.constant.AppConstants.LOGGER_SESSIONID;

/**
 * The Class BioApiImpl.
 * 
 * @author Sanjay Murali
 * @author Manoj SP
 * 
 */
public class Client_V_1_0 implements IBioApi {

	private static Logger logger = LoggerConfig.logConfig(Client_V_1_0.class);

	private static final String VERSION = "1.0";
	private static final String BIOSDK_SPEC_VERSION = "0.9";
	private static final boolean rest = true;

	/* "http://localhost:9099/biosdk-service" */
	private static final String host = System.getenv("mosip_biosdk_service");
	private Gson gson = new GsonBuilder().serializeNulls().create();

	Type errorDtoListType = new TypeToken<List<ErrorDto>>(){}.getType();

	@Override
	public SDKInfo init(Map<String, String> initParams) {
		SDKInfo sdkInfo = null;
		try {
			InitRequestDto initRequestDto = new InitRequestDto();
			initRequestDto.setInitParams(initParams);

			RequestDto requestDto = generateNewRequestDto(initRequestDto);
			logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP url: ", host+"/init");
			ResponseEntity<?> responseEntity = Util.restRequest(host+"/init", HttpMethod.POST, MediaType.APPLICATION_JSON, requestDto, null, String.class);
			if(!responseEntity.getStatusCode().is2xxSuccessful()){
				logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP status: ", responseEntity.getStatusCode().toString());
				throw new RuntimeException("HTTP status: "+responseEntity.getStatusCode().toString());
			}
			String responseBody = responseEntity.getBody().toString();
            JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);

            /* Error handler */
            errorHandler(js.get("errors") != null ? gson.fromJson(js.get("errors").toString(), errorDtoListType) : null);

			sdkInfo = gson.fromJson(js.get("response").toString(), SDKInfo.class);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		return sdkInfo;
	}

	@Override
	public Response<QualityCheck> checkQuality(BiometricRecord sample, List<BiometricType> modalitiesToCheck, Map<String, String> flags) {
		Response<QualityCheck> response = new Response<>();
		response.setStatusCode(200);
		QualityCheck qualityCheck = null;
		try {
			CheckQualityRequestDto checkQualityRequestDto = new CheckQualityRequestDto();
			checkQualityRequestDto.setSample(sample);
			checkQualityRequestDto.setModalitiesToCheck(modalitiesToCheck);
			checkQualityRequestDto.setFlags(flags);
			RequestDto requestDto = generateNewRequestDto(checkQualityRequestDto);
			logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP url: ", host+"/check-quality");
			ResponseEntity<?> responseEntity = Util.restRequest(host+"/check-quality", HttpMethod.POST, MediaType.APPLICATION_JSON, requestDto, null, String.class);
			if(!responseEntity.getStatusCode().is2xxSuccessful()){
				logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP status: ", responseEntity.getStatusCode().toString());
				throw new RuntimeException("HTTP status: "+responseEntity.getStatusCode().toString());
			}
			String responseBody = responseEntity.getBody().toString();
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);

			/* Error handler */
			errorHandler(js.get("errors") != null ? gson.fromJson(js.get("errors").toString(), errorDtoListType) : null);

			qualityCheck = gson.fromJson(js.get("response").toString(), QualityCheck.class);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		response.setResponse(qualityCheck);
		return response;
	}

	@Override
	public Response<MatchDecision[]> match(BiometricRecord sample, BiometricRecord[] gallery,
										   List<BiometricType> modalitiesToMatch, Map<String, String> flags) {
		Response<MatchDecision[]> response = new Response<>();
		try {
			MatchRequestDto matchRequestDto = new MatchRequestDto();
			matchRequestDto.setSample(sample);
			matchRequestDto.setGallery(gallery);
			matchRequestDto.setModalitiesToMatch(modalitiesToMatch);
			matchRequestDto.setFlags(flags);

			RequestDto requestDto = generateNewRequestDto(matchRequestDto);
			logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP url: ", host+"/match");
			ResponseEntity<?> responseEntity = Util.restRequest(host+"/match", HttpMethod.POST, MediaType.APPLICATION_JSON, requestDto, null, String.class);
			if(!responseEntity.getStatusCode().is2xxSuccessful()){
				logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP status: ", responseEntity.getStatusCode().toString());
				throw new RuntimeException("HTTP status: "+responseEntity.getStatusCode().toString());
			}
			String responseBody = responseEntity.getBody().toString();
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);

			/* Error handler */
			errorHandler(js.get("errors") != null ? gson.fromJson(js.get("errors").toString(), errorDtoListType) : null);

			JSONObject jsonResponse = (JSONObject) parser.parse(js.get("response").toString());
			response.setStatusCode(
				jsonResponse.get("statusCode") != null ? ((Long)jsonResponse.get("statusCode")).intValue() : null
			);
			response.setStatusMessage(
				jsonResponse.get("statusMessage") != null ? jsonResponse.get("statusMessage").toString() : ""
			);
			response.setResponse(
				gson.fromJson(jsonResponse.get("response") != null ? jsonResponse.get("response").toString() : null, MatchDecision[].class)
			);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		return response;
	}

	@Override
	public Response<BiometricRecord> extractTemplate(BiometricRecord sample, List<BiometricType> modalitiesToExtract, Map<String, String> flags) {
		Response<BiometricRecord> response = new Response<>();
		try {
			ExtractTemplateRequestDto extractTemplateRequestDto = new ExtractTemplateRequestDto();
			extractTemplateRequestDto.setSample(sample);
			extractTemplateRequestDto.setModalitiesToExtract(modalitiesToExtract);
			extractTemplateRequestDto.setFlags(flags);

			RequestDto requestDto = generateNewRequestDto(extractTemplateRequestDto);
			logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP url: ", host+"/extract-template");
			ResponseEntity<?> responseEntity = Util.restRequest(host+"/extract-template", HttpMethod.POST, MediaType.APPLICATION_JSON, requestDto, null, String.class);
			if(!responseEntity.getStatusCode().is2xxSuccessful()){
				logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP status: ", responseEntity.getStatusCode().toString());
				throw new RuntimeException("HTTP status: "+responseEntity.getStatusCode().toString());
			}
			String responseBody = responseEntity.getBody().toString();
			BiometricRecord resBiometricRecord = null;
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);

			/* Error handler */
			errorHandler(js.get("errors") != null ? gson.fromJson(js.get("errors").toString(), errorDtoListType) : null);

			JSONObject jsonResponse = (JSONObject) parser.parse(js.get("response").toString());
			response.setStatusCode(
					jsonResponse.get("statusCode") != null ? ((Long)jsonResponse.get("statusCode")).intValue() : null
			);
			response.setStatusMessage(
					jsonResponse.get("statusMessage") != null ? jsonResponse.get("statusMessage").toString() : ""
			);
			response.setResponse(
					gson.fromJson(jsonResponse.get("response") != null ? jsonResponse.get("response").toString() : null, BiometricRecord.class)
			);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		return response;
	}

	@Override
	public Response<BiometricRecord> segment(BiometricRecord biometricRecord, List<BiometricType> modalitiesToSegment, Map<String, String> flags) {
		Response<BiometricRecord> response = new Response<>();
		try {
			SegmentRequestDto segmentRequestDto = new SegmentRequestDto();
			segmentRequestDto.setSample(biometricRecord);
			segmentRequestDto.setModalitiesToSegment(modalitiesToSegment);
			segmentRequestDto.setFlags(flags);

			RequestDto requestDto = generateNewRequestDto(segmentRequestDto);
			logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP url: ", host+"/segment");
			ResponseEntity<?> responseEntity = Util.restRequest(host+"/segment", HttpMethod.POST, MediaType.APPLICATION_JSON, requestDto, null, String.class);
			if(!responseEntity.getStatusCode().is2xxSuccessful()){
				logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP status: ", responseEntity.getStatusCode().toString());
				throw new RuntimeException("HTTP status: "+responseEntity.getStatusCode().toString());
			}
			String responseBody = responseEntity.getBody().toString();
			BiometricRecord resBiometricRecord = null;
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);

			/* Error handler */
			errorHandler(js.get("errors") != null ? gson.fromJson(js.get("errors").toString(), errorDtoListType) : null);

			JSONObject jsonResponse = (JSONObject) parser.parse(js.get("response").toString());
			response.setStatusCode(
					jsonResponse.get("statusCode") != null ? ((Long)jsonResponse.get("statusCode")).intValue() : null
			);
			response.setStatusMessage(
					jsonResponse.get("statusMessage") != null ? jsonResponse.get("statusMessage").toString() : ""
			);
			response.setResponse(
					gson.fromJson(jsonResponse.get("response") != null ? jsonResponse.get("response").toString() : null, BiometricRecord.class)
			);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		return response;
	}

	@Override
	public BiometricRecord convertFormat(BiometricRecord sample, String sourceFormat, String targetFormat,
			Map<String, String> sourceParams, Map<String, String> targetParams, List<BiometricType> modalitiesToConvert) {
		BiometricRecord resBiometricRecord = null;
		try {
			ConvertFormatRequestDto convertFormatRequestDto = new ConvertFormatRequestDto();
			convertFormatRequestDto.setSample(sample);
			convertFormatRequestDto.setSourceFormat(sourceFormat);
			convertFormatRequestDto.setTargetFormat(targetFormat);
			convertFormatRequestDto.setSourceParams(sourceParams);
			convertFormatRequestDto.setTargetParams(targetParams);
			convertFormatRequestDto.setModalitiesToConvert(modalitiesToConvert);

			RequestDto requestDto = generateNewRequestDto(convertFormatRequestDto);
			logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP url: ", host+"/convert-format");
			ResponseEntity<?> responseEntity = Util.restRequest(host+"/convert-format", HttpMethod.POST, MediaType.APPLICATION_JSON, requestDto, null, String.class);
			if(!responseEntity.getStatusCode().is2xxSuccessful()){
				logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "HTTP status: ", responseEntity.getStatusCode().toString());
				throw new RuntimeException("HTTP status: "+responseEntity.getStatusCode().toString());
			}
			String responseBody = responseEntity.getBody().toString();
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);
			Gson gson = new Gson();

			/* Error handler */
			errorHandler(js.get("errors") != null ? gson.fromJson(js.get("errors").toString(), errorDtoListType) : null);

			resBiometricRecord = gson.fromJson(js.get("response").toString(), BiometricRecord.class);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		return resBiometricRecord;
	}

	private RequestDto generateNewRequestDto(Object body){
		Gson gson = new Gson();
		RequestDto requestDto = new RequestDto();
		requestDto.setVersion(VERSION);
		requestDto.setRequest(Util.base64Encode(gson.toJson(body)));
		return requestDto;
	}

	private void errorHandler(List<ErrorDto> errors){
	    if(errors != null){
	        for (ErrorDto errorDto: errors){
                throw new RuntimeException(errorDto.getCode()+" ---> "+errorDto.getMessage());
            }
        }
    }

}