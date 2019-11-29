package io.mosip.kernel.idobjectvalidator.constant;

/**
 * The Class IdObjectReferenceValidatorConstant.
 *
 * @author Manoj SP
 */
public class IdObjectReferenceValidatorConstant {
	
	public static final String ROOT_PATH = "identity";
	public static final String IDENTITY_ARRAY_VALUE_FIELD = "value";
	public static final String IDENTITY_REFERENCE_IDENTITY_NUMBER_PATH = "identity.referenceIdentityNumber";
	public static final String IDENTITY_LANGUAGE_PATH = "identity.*.*.language";
	public static final String IDENTITY_POSTAL_CODE_PATH = "identity.postalCode";
	public static final String IDENTITY_GENDER_LANGUAGE_PATH = "identity.gender.*.language";
	public static final String IDENTITY_GENDER_VALUE_PATH = "identity.gender.*.value";
	public static final String IDENTITY_REGION_LANGUAGE_PATH = "identity.region.*.language";
	public static final String IDENTITY_REGION_VALUE_PATH = "identity.region.*.value";
	public static final String IDENTITY_PROVINCE_LANGUAGE_PATH = "identity.province.*.language";
	public static final String IDENTITY_PROVINCE_VALUE_PATH = "identity.province.*.value";
	public static final String IDENTITY_CITY_LANGUAGE_PATH = "identity.city.*.language";
	public static final String IDENTITY_CITY_VALUE_PATH = "identity.city.*.value";
	public static final String IDENTITY_ZONE_LANGUAGE_PATH = "identity.zone.*.language";
	public static final String IDENTITY_ZONE_VALUE_PATH = "identity.zone.*.value";
	public static final String MASTERDATA_LANGUAGE_PATH = "response.languages.*";
	public static final String MASTERDATA_LOCATIONS_PATH = "locations.*";
	public static final String MASTERDATA_LANGUAGE_URI = "mosip.kernel.idobjectvalidator.masterdata.languages.rest.uri";
	public static final String MASTERDATA_GENDERTYPES_URI = "mosip.kernel.idobjectvalidator.masterdata.gendertypes.rest.uri";
	public static final String MASTERDATA_DOCUMENT_CATEGORIES_URI = "mosip.kernel.idobjectvalidator.masterdata.documentcategories.rest.uri";
	public static final String MASTERDATA_DOCUMENT_TYPES_URI = "mosip.kernel.idobjectvalidator.masterdata.documenttypes.rest.uri";
	public static final String MASTERDATA_LOCATIONS_URI = "mosip.kernel.idobjectvalidator.masterdata.locations.rest.uri";
	public static final String MASTERDATA_LOCATION_HIERARCHY_URI = "mosip.kernel.idobjectvalidator.masterdata.locationhierarchy.rest.uri";
	public static final String DOB_FORMAT = "uuuu/MM/dd";
	public static final String IDENTITY_DOB_PATH = "identity.dateOfBirth";
}
