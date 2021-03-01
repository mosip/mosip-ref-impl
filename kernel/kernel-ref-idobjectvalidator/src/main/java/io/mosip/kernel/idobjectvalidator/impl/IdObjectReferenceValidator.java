package io.mosip.kernel.idobjectvalidator.impl;

import static io.mosip.kernel.core.idobjectvalidator.constant.IdObjectValidatorErrorConstant.ID_OBJECT_PARSING_FAILED;
import static io.mosip.kernel.core.idobjectvalidator.constant.IdObjectValidatorErrorConstant.ID_OBJECT_VALIDATION_FAILED;
import static io.mosip.kernel.core.idobjectvalidator.constant.IdObjectValidatorErrorConstant.INVALID_INPUT_PARAMETER;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.DOB_FORMAT;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.DOC_TYPE_SCHEMA_FORMAT;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IDENTITY_DOB_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IDENTITY_GENDER_LANGUAGE_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IDENTITY_GENDER_VALUE_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IDENTITY_LANGUAGE_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IDENTITY_RESIDENCE_STATUS_LANGUAGE_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.IDENTITY_RESIDENCE_STATUS_VALUE_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.JSON_PATH_WILDCARD_SEARCH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.LOCATION_NA;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTERDATA_DOCUMENT_CATEGORIES_URI;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTERDATA_DOCUMENT_TYPES_URI;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTERDATA_GENDERTYPES_URI;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTERDATA_INDIVIDUAL_TYPES_URI;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTERDATA_LANGUAGE_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTERDATA_LANGUAGE_URI;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTERDATA_LOCATIONS_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTERDATA_LOCATIONS_URI;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.MASTERDATA_LOCATION_HIERARCHY_URI;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.SIMPLE_TYPE_LANGUAGE_PATH;
import static io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorConstant.SIMPLE_TYPE_VALUE_PATH;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.annotation.PostConstruct;

import org.apache.commons.collections4.SetValuedMap;
import org.apache.commons.collections4.multimap.HashSetValuedHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import io.mosip.kernel.core.util.DateUtils;
import io.mosip.kernel.core.util.StringUtils;
import io.mosip.kernel.idobjectvalidator.constant.IdObjectReferenceValidatorDocumentMapping;
import net.minidev.json.JSONArray;

/**
 * The Class IdObjectReferenceValidator.
 *
 * @author Manoj SP
 */
@Lazy
@RefreshScope
@Component
@ConfigurationProperties("mosip.kernel.idobjectvalidator.locationhierarchy")
public class IdObjectReferenceValidator implements IdObjectValidator {

	private Map<String, String> mapping = Collections.emptyMap();

	private static final String INDIVIDUAL_TYPES = "individualTypes";

	private static final String GENDER_NAME = "genderName";

	private static final String LOCATIONS = "locations";

	/** The Constant LOCATION_HIERARCHY_NAME. */
	private static final String LOCATION_HIERARCHY_NAME = "locationHierarchyName";

	/** The Constant LOCATION_HIERARCHYLEVEL. */
	private static final String LOCATION_HIERARCHYLEVEL = "locationHierarchylevel";

	private static final String NAME = "name";

	private static final String DOCUMENTS = "documents";

	/** The Constant DOCUMENTCATEGORIES. */
	private static final String DOCUMENTCATEGORIES = "documentcategories";

	/** The Constant LANG_CODE. */
	private static final String LANG_CODE = "langCode";

	/** The Constant GENDER_TYPE. */
	private static final String GENDER_TYPE = "genderType";

	/** The Constant CODE. */
	private static final String CODE = "code";

	/** The Constant IS_ACTIVE. */
	private static final String IS_ACTIVE = "isActive";

	/** The env. */
	@Autowired
	private Environment env;

	/** The mapper. */
	@Autowired
	private ObjectMapper mapper;

	/** The Constant READ_OPTIONS. */
	private static final Configuration READ_OPTIONS = Configuration.defaultConfiguration()
			.addOptions(Option.SUPPRESS_EXCEPTIONS);

	/** The Constant READ_LIST_OPTIONS. */
	private static final Configuration READ_LIST_OPTIONS = Configuration.defaultConfiguration()
			.addOptions(Option.SUPPRESS_EXCEPTIONS, Option.ALWAYS_RETURN_LIST);

	/** The Constant PATH_LIST_OPTIONS. */
	private static final Configuration PATH_LIST_OPTIONS = Configuration.defaultConfiguration()
			.addOptions(Option.SUPPRESS_EXCEPTIONS, Option.AS_PATH_LIST, Option.ALWAYS_RETURN_LIST);

	/** The rest template. */
	@Autowired
	private RestTemplate restTemplate;

	/** The language list. */
	private List<String> languageList;

	/** The gender map. */
	private SetValuedMap<String, String> genderMap;

	/** The doc cat map. */
	private SetValuedMap<String, String> docCatMap;

	/** The doc type map. */
	private SetValuedMap<String, String> docTypeMap;

	/** The location hierarchy details. */
	private Map<String, SetValuedMap<String, String>> locationHierarchyDetails;

	/** The location details. */
	private Map<String, SetValuedMap<String, String>> locationDetails;

	private SetValuedMap<String, String> residenceStatusMap;

	/**
	 * Load data.
	 */
	@PostConstruct
	public void loadData() {
		mapper.registerModule(new Jdk8Module()).registerModule(new JavaTimeModule());
		loadLanguages();
		loadGenderTypes();
		loadLocationDetails();
		loadDocCategories();
		loadDocTypes();
		loadResidenceStatus();
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
		try {
			String identityString = mapper.writeValueAsString(identityObject);
			List<ServiceError> errorList = new ArrayList<>();
			validateDateOfBirth(identityString, errorList);
			validateLanguage(identityString, errorList);
			validateGender(identityString, errorList);
			validateLocationHierarchy(identityString, errorList);
			validateDocuments(identityString, errorList);
			validateResidenceStatus(identityString, errorList);
			if (errorList.isEmpty()) {
				return true;
			} else {
				throw new IdObjectValidationFailedException(ID_OBJECT_VALIDATION_FAILED, errorList);
			}
		} catch (JsonProcessingException e) {
			ExceptionUtils.logRootCause(e);
			throw new IdObjectIOException(ID_OBJECT_PARSING_FAILED, e);
		}
	}

	/**
	 * Load languages.
	 */
	@SuppressWarnings("unchecked")
	private void loadLanguages() {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))) {
			ObjectNode responseBody = restTemplate.getForObject(env.getProperty(MASTERDATA_LANGUAGE_URI),
					ObjectNode.class);
			JsonPath jsonPath = JsonPath.compile(MASTERDATA_LANGUAGE_PATH);
			JSONArray response = jsonPath.read(responseBody.toString(), READ_LIST_OPTIONS);
			languageList = Optional.ofNullable(response).filter(data -> !data.isEmpty()).orElse(new JSONArray())
					.stream().map(obj -> ((LinkedHashMap<String, Object>) obj))
					.filter(obj -> (Boolean) obj.get(IS_ACTIVE)).map(obj -> String.valueOf(obj.get(CODE)))
					.collect(Collectors.toList());
		}
	}

	/**
	 * Load gender types.
	 */
	@SuppressWarnings("unchecked")
	private void loadGenderTypes() {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_GENDERTYPES_URI))) {
			ResponseWrapper<LinkedHashMap<String, ArrayList<LinkedHashMap<String, Object>>>> responseBody = restTemplate
					.getForObject(env.getProperty(MASTERDATA_GENDERTYPES_URI), ResponseWrapper.class);
			if (Objects.isNull(responseBody.getErrors()) || responseBody.getErrors().isEmpty()) {
				ArrayList<LinkedHashMap<String, Object>> response = responseBody.getResponse().get(GENDER_TYPE);
				genderMap = new HashSetValuedHashMap<>(response.size());
				IntStream.range(0, response.size()).filter(index -> (Boolean) response.get(index).get(IS_ACTIVE))
						.forEach(index -> {
							genderMap.put(String.valueOf(response.get(index).get(LANG_CODE)),
									String.valueOf(response.get(index).get(GENDER_NAME)));
							genderMap.put(String.valueOf(response.get(index).get(LANG_CODE)),
									String.valueOf(response.get(index).get(CODE)));
						});
			}
		}
	}

	/**
	 * Load doc categories.
	 */
	@SuppressWarnings("unchecked")
	private void loadDocCategories() {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_DOCUMENT_CATEGORIES_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_DOCUMENT_TYPES_URI))) {
			ResponseWrapper<LinkedHashMap<String, ArrayList<LinkedHashMap<String, Object>>>> responseBody = restTemplate
					.getForObject(env.getProperty(MASTERDATA_DOCUMENT_CATEGORIES_URI), ResponseWrapper.class);
			if (Objects.isNull(responseBody.getErrors()) || responseBody.getErrors().isEmpty()) {
				ArrayList<LinkedHashMap<String, Object>> response = responseBody.getResponse().get(DOCUMENTCATEGORIES);
				docCatMap = new HashSetValuedHashMap<>(response.size());
				IntStream.range(0, response.size()).filter(index -> (Boolean) response.get(index).get(IS_ACTIVE))
						.forEach(index -> docCatMap.put(String.valueOf(response.get(index).get(LANG_CODE)),
								String.valueOf(response.get(index).get(CODE))));
			}
		}
	}

	/**
	 * Load doc types.
	 */
	@SuppressWarnings("unchecked")
	private void loadDocTypes() {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_DOCUMENT_CATEGORIES_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_DOCUMENT_TYPES_URI))) {
			docTypeMap = new HashSetValuedHashMap<>();
			if (Objects.nonNull(docCatMap) && !docCatMap.isEmpty()) {
				docCatMap.keySet().stream().forEach(langCode -> docCatMap.get(langCode).stream().forEach(docCat -> {
					String uri = UriComponentsBuilder.fromUriString(env.getProperty(MASTERDATA_DOCUMENT_TYPES_URI))
							.buildAndExpand(docCat, langCode).toUriString();
					ResponseWrapper<LinkedHashMap<String, ArrayList<LinkedHashMap<String, Object>>>> responseBody = restTemplate
							.getForObject(uri, ResponseWrapper.class);
					if (Objects.isNull(responseBody.getErrors()) || responseBody.getErrors().isEmpty()) {
						ArrayList<LinkedHashMap<String, Object>> response = responseBody.getResponse().get(DOCUMENTS);
						IntStream.range(0, response.size())
								.filter(index -> (Boolean) response.get(index).get(IS_ACTIVE)).forEach(
										index -> docTypeMap.put(docCat, String.valueOf(response.get(index).get(CODE))));
					}
				}));
			}
		}
	}

	/**
	 * Load location details.
	 */
	@SuppressWarnings({ "unchecked" })
	private void loadLocationDetails() {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_LOCATIONS_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_LOCATION_HIERARCHY_URI))) {
			locationHierarchyDetails = new LinkedHashMap<>();
			locationDetails = new LinkedHashMap<>();
			languageList.stream().forEach(langCode -> {
				String uri = UriComponentsBuilder.fromUriString(env.getProperty(MASTERDATA_LOCATIONS_URI))
						.buildAndExpand(langCode).toUriString();
				ResponseWrapper<ObjectNode> responseBody = restTemplate.exchange(uri, HttpMethod.GET, null,
						new ParameterizedTypeReference<ResponseWrapper<ObjectNode>>() {
						}).getBody();
				if (Objects.isNull(responseBody.getErrors()) || responseBody.getErrors().isEmpty()) {
					JsonPath jsonPath = JsonPath.compile(MASTERDATA_LOCATIONS_PATH);
					JSONArray response = jsonPath.read(responseBody.getResponse().toString(), READ_LIST_OPTIONS);
					response.stream().map(obj -> ((LinkedHashMap<String, Object>) obj))
							.filter(obj -> (Boolean) obj.get(IS_ACTIVE)).forEach(obj -> {
								locationHierarchyDetails.putIfAbsent(String.valueOf(obj.get(LOCATION_HIERARCHYLEVEL)),
										new HashSetValuedHashMap<>());
								locationHierarchyDetails.get(String.valueOf(obj.get(LOCATION_HIERARCHYLEVEL)))
										.put(langCode, String.valueOf(obj.get(LOCATION_HIERARCHY_NAME)));
								locationDetails.put(String.valueOf(obj.get(LOCATION_HIERARCHY_NAME)), null);
							});
				}
			});

			Set<String> locationHierarchyNames = locationDetails.keySet().stream().collect(Collectors.toSet());
			locationHierarchyNames.stream().forEach(hierarchyName -> {
				String uri = UriComponentsBuilder.fromUriString(env.getProperty(MASTERDATA_LOCATION_HIERARCHY_URI))
						.buildAndExpand(hierarchyName).toUriString();
				ResponseWrapper<LinkedHashMap<String, ArrayList<LinkedHashMap<String, Object>>>> responseBody = restTemplate
						.getForObject(uri, ResponseWrapper.class);
				if (Objects.isNull(responseBody.getErrors()) || responseBody.getErrors().isEmpty()) {
					ArrayList<LinkedHashMap<String, Object>> response = responseBody.getResponse().get(LOCATIONS);
					SetValuedMap<String, String> locations = new HashSetValuedHashMap<>(response.size());
					IntStream.range(0, response.size()).filter(index -> (Boolean) response.get(index).get(IS_ACTIVE))
							.forEach(index -> {
								locations.put(String.valueOf(response.get(index).get(LANG_CODE)),
										String.valueOf(response.get(index).get(CODE)));
								locations.put(String.valueOf(response.get(index).get(LANG_CODE)),
										String.valueOf(response.get(index).get(NAME)));
								if (StringUtils.isNotBlank(env.getProperty(LOCATION_NA))) {
									locations.put(String.valueOf(response.get(index).get(LANG_CODE)),
											StringUtils.trim(env.getProperty(LOCATION_NA)));
								}
							});
					locationDetails.put(hierarchyName, locations);
				}
			});
		}
	}

	@SuppressWarnings("unchecked")
	private void loadResidenceStatus() {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_INDIVIDUAL_TYPES_URI))) {
			ResponseWrapper<LinkedHashMap<String, ArrayList<LinkedHashMap<String, Object>>>> responseBody = restTemplate
					.getForObject(env.getProperty(MASTERDATA_INDIVIDUAL_TYPES_URI), ResponseWrapper.class);
			if (Objects.isNull(responseBody.getErrors()) || responseBody.getErrors().isEmpty()) {
				ArrayList<LinkedHashMap<String, Object>> response = responseBody.getResponse().get(INDIVIDUAL_TYPES);
				residenceStatusMap = new HashSetValuedHashMap<>(response.size());
				IntStream.range(0, response.size()).filter(index -> (Boolean) response.get(index).get(IS_ACTIVE))
						.forEach(index -> {
							residenceStatusMap.put(String.valueOf(response.get(index).get(LANG_CODE)),
									String.valueOf(response.get(index).get(CODE)));
							residenceStatusMap.put(String.valueOf(response.get(index).get(LANG_CODE)),
									String.valueOf(response.get(index).get(NAME)));
						});
			}
		}
	}

	private void validateLocationHierarchy(String identityString, List<ServiceError> errorList) {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_LOCATIONS_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_LOCATION_HIERARCHY_URI))) {
			mapping.entrySet().stream().forEach(fieldEntry -> {
				Arrays.asList(fieldEntry.getValue().split(",")).stream()
						.map(field -> String.format(JSON_PATH_WILDCARD_SEARCH, field)).forEach(field -> {
							JsonPath jsonPath = JsonPath.compile(field);
							JSONArray fieldData = jsonPath.read(identityString,
									Configuration.defaultConfiguration().addOptions(Option.SUPPRESS_EXCEPTIONS));
							final String fieldValuePath = String.format(SIMPLE_TYPE_VALUE_PATH, field);
							final String fieldLangPath = String.format(SIMPLE_TYPE_LANGUAGE_PATH, field);
							fieldData.stream().forEach(data -> {
								String extractedLang = null;
								String extractedValue = null;
								JSONArray pathList = null;

								if (data instanceof JSONArray) {
									JSONArray fieldLang = JsonPath.compile(fieldLangPath).read(identityString,
											Configuration.defaultConfiguration()
													.addOptions(Option.SUPPRESS_EXCEPTIONS));
									extractedLang = fieldLang.get(0).toString();
									JsonPath valuePath = JsonPath.compile(fieldValuePath);
									JSONArray fieldValue = valuePath.read(identityString, Configuration
											.defaultConfiguration().addOptions(Option.SUPPRESS_EXCEPTIONS));
									extractedValue = fieldValue.get(0).toString();
									pathList = valuePath.read(identityString, Configuration.defaultConfiguration()
											.addOptions(Option.SUPPRESS_EXCEPTIONS, Option.AS_PATH_LIST));
								} else if (data instanceof String) {
									extractedValue = data.toString();
									pathList = jsonPath.read(identityString, Configuration.defaultConfiguration()
											.addOptions(Option.SUPPRESS_EXCEPTIONS, Option.AS_PATH_LIST));
								}

								Set<String> hierarchyList = Objects.nonNull(extractedLang)
										? locationHierarchyDetails.get(fieldEntry.getKey()).get(extractedLang)
										: new HashSet<>(locationHierarchyDetails.get(fieldEntry.getKey()).values());
								if (hierarchyList.isEmpty()) {
									JSONArray langPathList = JsonPath.compile(fieldLangPath).read(identityString,
											Configuration.defaultConfiguration().addOptions(Option.SUPPRESS_EXCEPTIONS,
													Option.AS_PATH_LIST));
									String errorMessage = String.format(INVALID_INPUT_PARAMETER.getMessage(),
											convertToPath(String.valueOf(langPathList.get(0))));
									errorList.removeIf(serviceError -> serviceError.getMessage().equals(errorMessage));
									errorList.add(
											new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(), errorMessage));
								} else {
									boolean result = Objects.nonNull(extractedLang)
											? locationDetails.get(hierarchyList.iterator().next()).get(extractedLang)
													.contains(extractedValue)
											: hierarchyList.stream()
													.map(hierarchy -> locationDetails.get(hierarchy).values())
													.flatMap(Collection::stream).collect(Collectors.toSet())
													.contains(extractedValue);
									if (!result) {
										String errorMessage = String.format(INVALID_INPUT_PARAMETER.getMessage(),
												convertToPath(String.valueOf(pathList.get(0))));
										errorList.removeIf(
												serviceError -> serviceError.getMessage().equals(errorMessage));
										errorList.add(
												new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(), errorMessage));
									}
								}
							});
						});
			});
		}
	}

	/**
	 * Validate date of birth.
	 *
	 * @param identity  the identity
	 * @param errorList the error list
	 */
	private void validateDateOfBirth(String identity, List<ServiceError> errorList) {
		if (Objects.nonNull(env.getProperty(DOB_FORMAT))) {
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

	/**
	 * Validate language.
	 *
	 * @param identityString the identity string
	 * @param errorList      the error list
	 */
	private void validateLanguage(String identityString, List<ServiceError> errorList) {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))) {
			JsonPath jsonPath = JsonPath.compile(IDENTITY_LANGUAGE_PATH);
			JSONArray pathList = jsonPath.read(identityString, PATH_LIST_OPTIONS);
			Map<String, String> dataMap = IntStream.range(0, pathList.size()).boxed()
					.collect(Collectors.toMap(i -> String.valueOf(pathList.get(i)),
							i -> JsonPath.compile(String.valueOf(pathList.get(i))).read(identityString, READ_OPTIONS)));
			dataMap.entrySet().stream().filter(entry -> !languageList.contains(entry.getValue()))
					.forEach(entry -> errorList.add(new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(),
							String.format(INVALID_INPUT_PARAMETER.getMessage(), convertToPath(entry.getKey())))));
		}
	}

	/**
	 * Validate gender.
	 *
	 * @param identityString the identity string
	 * @param errorList      the error list
	 */
	private void validateGender(String identityString, List<ServiceError> errorList) {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_GENDERTYPES_URI))) {
			JsonPath genderLangPath = JsonPath.compile(IDENTITY_GENDER_LANGUAGE_PATH);
			List<String> genderLangPathList = genderLangPath.read(identityString, PATH_LIST_OPTIONS);
			JsonPath genderValuePath = JsonPath.compile(IDENTITY_GENDER_VALUE_PATH);
			List<String> genderValuePathList = genderValuePath.read(identityString, PATH_LIST_OPTIONS);
			Map<String, Map.Entry<String, String>> dataMap = IntStream.range(0, genderLangPathList.size())
					.filter(index -> languageList.contains(
							JsonPath.compile(genderLangPathList.get(index)).read(identityString, READ_OPTIONS)))
					.boxed()
					.collect(Collectors.toMap(genderLangPathList::get,
							i -> new AbstractMap.SimpleImmutableEntry<String, String>(genderValuePathList.get(i),
									JsonPath.compile(genderValuePathList.get(i)).read(identityString, READ_OPTIONS))));
			dataMap.entrySet().stream().filter(entry -> {
				String lang = JsonPath.compile(entry.getKey()).read(identityString, READ_OPTIONS);
				return genderMap.containsKey(lang) && !genderMap.get(lang).contains(entry.getValue().getValue());
			}).forEach(entry -> errorList.add(new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(),
					String.format(INVALID_INPUT_PARAMETER.getMessage(), convertToPath(entry.getValue().getKey())))));
		}
	}

	/**
	 * Validate documents.
	 *
	 * @param identityString the identity string
	 * @param errorList      the error list
	 */
	private void validateDocuments(String identityString, List<ServiceError> errorList) {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_DOCUMENT_CATEGORIES_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_DOCUMENT_TYPES_URI))) {
			IdObjectReferenceValidatorDocumentMapping.getAllMapping().entrySet().stream()
					.filter(entry -> docTypeMap.containsKey(entry.getKey())).forEach(entry -> {
						JsonPath jsonPath = JsonPath.compile(String.format(DOC_TYPE_SCHEMA_FORMAT, entry.getValue()));
						Object value = jsonPath.read(identityString, READ_OPTIONS);
						if (Objects.nonNull(value) && !docTypeMap.get(entry.getKey()).contains(value)) {
							errorList.add(new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(), String
									.format(INVALID_INPUT_PARAMETER.getMessage(), convertToPath(jsonPath.getPath()))));
						}
					});
		}
	}

	private void validateResidenceStatus(String identityString, List<ServiceError> errorList) {
		if (Objects.nonNull(env.getProperty(MASTERDATA_LANGUAGE_URI))
				&& Objects.nonNull(env.getProperty(MASTERDATA_INDIVIDUAL_TYPES_URI))) {
			JsonPath residenceStatusLangPath = JsonPath.compile(IDENTITY_RESIDENCE_STATUS_LANGUAGE_PATH);
			List<String> residenceStatusLangPathList = residenceStatusLangPath.read(identityString, PATH_LIST_OPTIONS);
			JsonPath residenceStatusValuePath = JsonPath.compile(IDENTITY_RESIDENCE_STATUS_VALUE_PATH);
			List<String> residenceStatusValuePathList = residenceStatusValuePath.read(identityString,
					PATH_LIST_OPTIONS);
			Map<String, Map.Entry<String, String>> dataMap = IntStream.range(0, residenceStatusLangPathList.size())
					.filter(index -> languageList.contains(JsonPath
							.compile(residenceStatusLangPathList.get(index)).read(identityString, READ_OPTIONS)))
					.boxed()
					.collect(Collectors.toMap(residenceStatusLangPathList::get,
							i -> new AbstractMap.SimpleImmutableEntry<String, String>(
									residenceStatusValuePathList.get(i),
									JsonPath.compile(residenceStatusValuePathList.get(i)).read(identityString,
											READ_OPTIONS))));
			dataMap.entrySet().stream().filter(entry -> {
				String lang = JsonPath.compile(entry.getKey()).read(identityString, READ_OPTIONS);
				return residenceStatusMap.containsKey(lang)
						&& !residenceStatusMap.get(lang).contains(entry.getValue().getValue());
			}).forEach(entry -> errorList.add(new ServiceError(INVALID_INPUT_PARAMETER.getErrorCode(),
					String.format(INVALID_INPUT_PARAMETER.getMessage(), convertToPath(entry.getValue().getKey())))));
		}
	}

	/**
	 * Convert to path.
	 *
	 * @param jsonPath the json path
	 * @return the string
	 */
	private String convertToPath(String jsonPath) {
		String path = String.valueOf(jsonPath.replaceAll("[$']", ""));
		return path.substring(1, path.length() - 1).replace("][", "/");
	}

	public void setMapping(Map<String, String> mapping) {
		this.mapping = mapping;
	}
}
