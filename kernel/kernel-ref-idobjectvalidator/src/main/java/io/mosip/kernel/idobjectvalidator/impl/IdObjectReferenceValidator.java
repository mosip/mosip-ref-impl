package io.mosip.kernel.idobjectvalidator.impl;

import static io.mosip.kernel.core.idobjectvalidator.constant.IdObjectValidatorErrorConstant.ID_OBJECT_VALIDATION_FAILED;
import static io.mosip.kernel.core.idobjectvalidator.constant.IdObjectValidatorErrorConstant.INVALID_INPUT_PARAMETER;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.BIOMETRICS_TYPE;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.CACHE_RESET_CRON_PATTERN;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.CODE;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.DOB_FORMAT;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.DOCUMENT_TYPE;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IDENTITY_DOB_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IDENTITY_ID_SCHEMA_VERSION_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IDENTITY_LANGUAGE_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IS_CACHE_RESET_ENABLED;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.LANGUAGE;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTER_DATA_URI;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MOSIP_MANDATORY_LANG;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MOSIP_OPTIONAL_LANG;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.SCHEMA_FIELD_DEF_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.SCHEMA_SUB_TYPE_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.SIMPLE_TYPE;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.SLASH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.STRING;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.TYPE;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.VALUE;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.VALUE_NA;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.annotation.PostConstruct;

import org.apache.commons.collections4.SetValuedMap;
import org.apache.commons.collections4.multimap.HashSetValuedHashMap;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.Option;

import io.mosip.kernel.core.exception.ExceptionUtils;
import io.mosip.kernel.core.exception.ServiceError;
import io.mosip.kernel.core.http.ResponseWrapper;
import io.mosip.kernel.core.idobjectvalidator.exception.IdObjectIOException;
import io.mosip.kernel.core.idobjectvalidator.exception.IdObjectValidationFailedException;
import io.mosip.kernel.core.idobjectvalidator.spi.IdObjectValidator;
import io.mosip.kernel.core.logger.spi.Logger;
import io.mosip.kernel.core.util.DateUtils;
import io.mosip.kernel.logger.logback.factory.Logfactory;
import net.minidev.json.JSONArray;

/**
 * The Class IdObjectReferenceValidator.
 *
 * @author Manoj SP
 */
@Lazy
@RefreshScope
public class IdObjectReferenceValidator implements IdObjectValidator {

	private final static Logger logger = Logfactory.getSlf4jLogger(IdObjectReferenceValidator.class);

	@Value("${" + MOSIP_MANDATORY_LANG + ":}")
	private String mandatoryLanguages;

	@Value("${" + MOSIP_OPTIONAL_LANG + ":}")
	private String optionalLanguages;

	@Value("${" + MASTER_DATA_URI + "}")
	private String masterDataUri;

	@Value("${" + IDENTITY_ID_SCHEMA_VERSION_PATH + "}")
	private String idSchemaVersionPath;

	private Map<String, String> fieldToSubTypeMapping;

	private Map<String, String> fieldToFieldDefMapping;

	private Set<String> processedSchemaVersions = new HashSet<>();

	/** The env. */
	@Autowired
	private Environment env;

	/** The mapper. */
	@Autowired
	private ObjectMapper mapper;

	/** The Constant READ_OPTIONS. */
	private static final Configuration READ_OPTIONS = Configuration.defaultConfiguration()
			.addOptions(Option.SUPPRESS_EXCEPTIONS);

	/** The Constant PATH_LIST_OPTIONS. */
	private static final Configuration PATH_LIST_OPTIONS = Configuration.defaultConfiguration()
			.addOptions(Option.SUPPRESS_EXCEPTIONS, Option.AS_PATH_LIST, Option.ALWAYS_RETURN_LIST);

	/** The rest template. */
	@Autowired
	private RestTemplate restTemplate;

	/** The language list. */
	private Set<String> languageList;

	/** The location details. */
	private Map<String, SetValuedMap<String, String>> validationDataCache = new HashMap<>();

	/**
	 * Load data.
	 */
	@PostConstruct
	public void loadData() {
		resetCache();
		if (env.containsProperty(CACHE_RESET_CRON_PATTERN)) {
			ScheduledExecutorService localExecutor = Executors.newSingleThreadScheduledExecutor();
			TaskScheduler scheduler = new ConcurrentTaskScheduler(localExecutor);
			scheduler.schedule(() -> resetCache(), new CronTrigger(env.getProperty(CACHE_RESET_CRON_PATTERN)));
		}
		mapper.registerModule(new Jdk8Module()).registerModule(new JavaTimeModule());
	}

	public void resetCache() {
		languageList = Set.of();
		fieldToSubTypeMapping = Map.of();
		fieldToFieldDefMapping = Map.of();
		validationDataCache.clear();
		processedSchemaVersions.clear();
		populateMasterDataCache();
		loadLanguages();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * io.mosip.kernel.core.idobjectvalidator.spi.IdObjectValidator#validateIdObject
	 * (java.lang.Object)
	 */
	@Override
	public boolean validateIdObject(String identitySchema, Object identityObject, List<String> requiredFields)
			throws IdObjectIOException, IdObjectValidationFailedException {
		processSchemaData(identitySchema, identityObject);
		Set<ServiceError> errorList = new HashSet<>();
		validateDateOfBirth(identityObject, errorList);
		validateLanguage(identityObject, errorList);
		validateIdObject(identityObject, errorList);
		if (errorList.isEmpty()) {
			return true;
		} else {
			logger.error("IdObjectReferenceValidationFailed: \n {}", errorList.toString());
			throw new IdObjectValidationFailedException(ID_OBJECT_VALIDATION_FAILED, new ArrayList<>(errorList));
		}
	}

	/**
	 * Load languages.
	 */
	private void loadLanguages() {
		languageList = Arrays.asList(mandatoryLanguages.split(",")).stream().filter(lang -> !lang.isBlank())
				.map(StringUtils::trim).collect(Collectors.toSet());
		languageList.addAll(Arrays.asList(optionalLanguages.split(",")).stream().filter(lang -> !lang.isBlank())
				.map(StringUtils::trim).collect(Collectors.toSet()));
	}

	private void processSchemaData(String identitySchema, Object identityObject) {
		String schemaVersion = JsonPath.compile(idSchemaVersionPath).read(identityObject, READ_OPTIONS).toString();
		if (!isSchemaProcessed(schemaVersion)) {
			extractSubTypes(identitySchema);
			extractFieldDefinitions(identitySchema);
			populateMasterDataCache();
			processedSchemaVersions.add(schemaVersion);
		}
	}

	private boolean isSchemaProcessed(String schemaVersion) {
		return processedSchemaVersions.contains(schemaVersion);
	}

	private void extractSubTypes(String identitySchema) {
		JsonPath subTypePath = JsonPath.compile(SCHEMA_SUB_TYPE_PATH);
		List<String> subTypePathList = subTypePath.read(identitySchema, PATH_LIST_OPTIONS);
		fieldToSubTypeMapping = IntStream.range(0, subTypePathList.size()).boxed()
				.collect(Collectors.toMap(i -> convertToPath(subTypePathList.get(i)).split(SLASH)[3],
						i -> JsonPath.compile(subTypePathList.get(i)).read(identitySchema, READ_OPTIONS)));
	}

	private void extractFieldDefinitions(String identitySchema) {
		JsonPath fieldDefPath = JsonPath.compile(SCHEMA_FIELD_DEF_PATH);
		List<String> fieldDefPathList = fieldDefPath.read(identitySchema, PATH_LIST_OPTIONS);
		fieldToFieldDefMapping = IntStream.range(0, fieldDefPathList.size()).boxed()
				.collect(
						Collectors.toMap(i -> convertToPath(fieldDefPathList.get(i)).split(SLASH)[3],
								i -> StringUtils.substringAfterLast(
										JsonPath.compile(fieldDefPathList.get(i)).read(identitySchema, READ_OPTIONS),
										SLASH)));
	}

	private void populateMasterDataCache() {
		validationDataCache.putAll(fieldToSubTypeMapping.entrySet().stream()
				.filter(fieldEntry -> !validationDataCache.containsKey(fieldEntry.getKey())).collect(Collectors.toMap(
						fieldEntry -> fieldEntry.getKey(), fieldEntry -> fetchMasterData(fieldEntry.getValue()))));
		logger.debug("IdObjectReferenceValidator VALIDATION VALUES LOADED: {}", validationDataCache.toString());
	}

	private void validateDateOfBirth(Object identity, Set<ServiceError> errorList) {
		if (env.containsProperty(DOB_FORMAT) && env.containsProperty(IDENTITY_DOB_PATH)) {
			JsonPath jsonPath = JsonPath.compile(IDENTITY_DOB_PATH);
			JSONArray pathList = jsonPath.read(identity,
					Configuration.defaultConfiguration().addOptions(Option.SUPPRESS_EXCEPTIONS, Option.AS_PATH_LIST));
			String data = jsonPath.read(identity,
					Configuration.defaultConfiguration().addOptions(Option.SUPPRESS_EXCEPTIONS));
			try {
				if (Objects.nonNull(data) && LocalDate
						.parse(data,
								DateTimeFormatter.ofPattern(env.getProperty(DOB_FORMAT))
										.withResolverStyle(ResolverStyle.STRICT))
						.isAfter(DateUtils.getUTCCurrentDateTime().toLocalDate())) {
					String errorMessage = String.format(INVALID_INPUT_PARAMETER.getMessage(),
							convertToPath(String.valueOf(pathList.get(0))));
					errorList.removeIf(serviceError -> serviceError.getMessage().equals(errorMessage));
					errorList.add(new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(), errorMessage));
				}
			} catch (DateTimeParseException e) {
				ExceptionUtils.logRootCause(e);
				String errorMessage = String.format(INVALID_INPUT_PARAMETER.getMessage(),
						convertToPath(String.valueOf(pathList.get(0))));
				errorList.removeIf(serviceError -> serviceError.getMessage().equals(errorMessage));
				errorList.add(new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(), errorMessage));
			}
		}
	}

	private void validateLanguage(Object identityObject, Set<ServiceError> errorList) {
		if (!languageList.isEmpty()) {
			JsonPath jsonPath = JsonPath.compile(IDENTITY_LANGUAGE_PATH);
			JSONArray pathList = jsonPath.read(identityObject, PATH_LIST_OPTIONS);
			Map<String, String> dataMap = IntStream.range(0, pathList.size()).boxed()
					.collect(Collectors.toMap(i -> String.valueOf(pathList.get(i)),
							i -> JsonPath.compile(String.valueOf(pathList.get(i))).read(identityObject, READ_OPTIONS)));
			dataMap.entrySet().stream().filter(entry -> !languageList.contains(entry.getValue()))
					.forEach(entry -> errorList.add(new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(),
							String.format(INVALID_INPUT_PARAMETER.getMessage(), convertToPath(entry.getKey())))));
		}
	}

	@SuppressWarnings("unchecked")
	private void validateIdObject(Object identityObject, Set<ServiceError> errorList) {
		for (String field : validationDataCache.keySet()) {
			JSONArray dataArray = JsonPath.compile("*." + field).read(identityObject, READ_OPTIONS);
			// If dataArray is empty, means the field is not present in identity data.
			// Exception is not thrown if dataArray is empty as the field might be optional
			// field
			// and so it is not sent as part of identity data.
			if (!dataArray.isEmpty()) {
				Object data = dataArray.get(0);
				String fieldType = fieldToFieldDefMapping.getOrDefault(field, STRING);
				switch (fieldType) {
				case SIMPLE_TYPE:
					validateSimpleType(errorList, field, data);
					break;
				case DOCUMENT_TYPE:
					validateDocumentType(errorList, field, (Map<String, String>) data);
					break;
				case BIOMETRICS_TYPE:
					validateBiometricType(errorList, field, (Map<String, String>) data);
					break;
				case STRING:
					validateStringType(errorList, field, data);
					break;
				}
			}
		}
	}

	@SuppressWarnings("unchecked")
	private void validateSimpleType(Set<ServiceError> errorList, String field, Object data) {
		ArrayList<Map<String, String>> fieldDataList = (ArrayList<Map<String, String>>) data;
		IntStream.range(0, fieldDataList.size())
				.forEach(index -> validateValue(errorList, field, index, fieldDataList.get(index), true));
	}

	private void validateDocumentType(Set<ServiceError> errorList, String field, Map<String, String> data) {
		languageList.forEach(
				lang -> validateValue(errorList, field, null, Map.of(LANGUAGE, lang, VALUE, data.get(TYPE)), true));
	}

	private void validateBiometricType(Set<ServiceError> errorList, String field, Map<String, String> data) {
		languageList.forEach(
				lang -> validateValue(errorList, field, null, Map.of(LANGUAGE, lang, VALUE, data.get(VALUE)), true));
	}

	private void validateStringType(Set<ServiceError> errorList, String field, Object data) {
		languageList.forEach(lang -> validateValue(errorList, field, null,
				Map.of(LANGUAGE, lang, VALUE, String.valueOf(data)), false));
	}

	private void validateValue(Set<ServiceError> errorList, String field, Integer index, Map<String, String> fieldData,
			boolean containsValue) {
		refreshCacheOnUnknownValue(field, fieldData);
		if (!isValueValid(field, fieldData)) {
			// as language validation is done already, only value validation is done here
			errorList.add(new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(), String
					.format(INVALID_INPUT_PARAMETER.getMessage(), resolveValuePath(field, index, containsValue))));
		}
	}

	private void refreshCacheOnUnknownValue(String field, Map<String, String> fieldData) {
		if (env.getProperty(IS_CACHE_RESET_ENABLED, Boolean.class, false) && !isValueValid(field, fieldData)) {
			validationDataCache.remove(field);
			validationDataCache.put(field, fetchMasterData(fieldToSubTypeMapping.get(field)));
		}
	}

	private boolean isValueValid(String field, Map<String, String> fieldData) {
		return validationDataCache.containsKey(field)
				&& validationDataCache.get(field).containsMapping(fieldData.get(LANGUAGE), fieldData.get(VALUE));
	}

	private String resolveValuePath(String field, Integer index, boolean containsValue) {
		String valuePathString = "$.identity." + field
				+ (containsValue ? ("." + (Objects.nonNull(index) ? index + ".value" : VALUE)) : "");
		return convertToPath(JsonPath.compile(valuePathString).getPath());
	}

	private HashSetValuedHashMap<String, String> fetchMasterData(String field) {
		HashSetValuedHashMap<String, String> masterDataMap = new HashSetValuedHashMap<>();
		URI requestUri = UriComponentsBuilder.fromUriString(masterDataUri)
				.queryParam("langCode", languageList.stream().collect(Collectors.joining(","))).build(field);
		ResponseWrapper<Object> responseObject = restTemplate
				.exchange(requestUri, HttpMethod.GET, null, new ParameterizedTypeReference<ResponseWrapper<Object>>() {
				}).getBody();
		logger.debug("IdObjectReferenceValidator masterdata field : {} response : {}", field, responseObject);
		Map<String, List<ObjectNode>> response = mapper.convertValue(responseObject.getResponse(),
				new TypeReference<Map<String, List<ObjectNode>>>() {
				});
		response.entrySet()
				.forEach(entry -> masterDataMap.putAll(entry.getKey(),
						entry.getValue().stream()
								.flatMap(responseValue -> List.of(env.getProperty(VALUE_NA, ""),
										responseValue.get(CODE).isNull() ? "" : responseValue.get(CODE).asText(),
										responseValue.get(VALUE).isNull() ? "" : responseValue.get(VALUE).asText())
										.stream())
								.filter(StringUtils::isNotBlank).map(StringUtils::trim).collect(Collectors.toList())));
		return masterDataMap;
	}

	private String convertToPath(String jsonPath) {
		String path = String.valueOf(jsonPath.replaceAll("[$']", ""));
		return path.substring(1, path.length() - 1).replace("][", SLASH);
	}

}
