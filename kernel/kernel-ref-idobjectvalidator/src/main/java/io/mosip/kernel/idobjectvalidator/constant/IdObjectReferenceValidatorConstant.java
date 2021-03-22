package io.mosip.kernel.idobjectvalidator.constant;

/**
 * The Class IdObjectReferenceValidatorConstant.
 *
 * @author Manoj SP
 */
public class IdObjectReferenceValidatorConstant {
	
	public static final String ROOT_PATH = "identity";
	public static final String IDENTITY_ARRAY_VALUE_FIELD = "value";
	public static final String MASTERDATA_LANGUAGE_PATH = "response.languages.*";
	public static final String MASTERDATA_LOCATIONS_PATH = "locations.*";
	public static final String DOC_TYPE_SCHEMA_FORMAT = "identity.%s.type";
	public static final String JSON_PATH_WILDCARD_SEARCH = "*.%s";
	public static final String SIMPLE_TYPE_VALUE_PATH = "%s.*.value";
	public static final String SIMPLE_TYPE_LANGUAGE_PATH = "%s.*.language";
	public static final String IDENTITY_REFERENCE_IDENTITY_NUMBER_PATH = "identity.referenceIdentityNumber";
	public static final String IDENTITY_LANGUAGE_PATH = "identity.*.*.language";
	public static final String IDENTITY_GENDER_LANGUAGE_PATH = "identity.gender.*.language";
	public static final String IDENTITY_GENDER_VALUE_PATH = "identity.gender.*.value";
	public static final String IDENTITY_RESIDENCE_STATUS_LANGUAGE_PATH = "identity.residenceStatus.*.language";
	public static final String IDENTITY_RESIDENCE_STATUS_VALUE_PATH = "identity.residenceStatus.*.value";
	public static final String IDENTITY_DOB_PATH = "identity.dateOfBirth";
	public static final String DOB_FORMAT = "mosip.kernel.idobjectvalidator.date-format";
	public static final String MASTERDATA_LANGUAGE_URI = "mosip.kernel.idobjectvalidator.masterdata.languages.rest.uri";
	public static final String MASTERDATA_GENDERTYPES_URI = "mosip.kernel.idobjectvalidator.masterdata.gendertypes.rest.uri";
	public static final String MASTERDATA_DOCUMENT_CATEGORIES_URI = "mosip.kernel.idobjectvalidator.masterdata.documentcategories.rest.uri";
	public static final String MASTERDATA_DOCUMENT_TYPES_URI = "mosip.kernel.idobjectvalidator.masterdata.documenttypes.rest.uri";
	public static final String MASTERDATA_LOCATIONS_URI = "mosip.kernel.idobjectvalidator.masterdata.locations.rest.uri";
	public static final String MASTERDATA_LOCATION_HIERARCHY_URI = "mosip.kernel.idobjectvalidator.masterdata.locationhierarchy.rest.uri";
	public static final String MASTERDATA_INDIVIDUAL_TYPES_URI = "mosip.kernel.idobjectvalidator.masterdata.individualtypes.rest.uri";
	public static final String LOCATION_NA = "mosip.kernel.idobjectvalidator.masterdata.locations.locationNotAvailable";
}
