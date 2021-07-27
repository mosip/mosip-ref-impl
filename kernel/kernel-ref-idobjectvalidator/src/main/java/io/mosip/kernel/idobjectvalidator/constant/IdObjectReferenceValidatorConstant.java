package io.mosip.kernel.idobjectvalidator.constant;

/**
 * The Class IdObjectReferenceValidatorConstant.
 *
 * @author Manoj SP
 */
public class IdObjectReferenceValidatorConstant {

	public static final String TYPE = "type";

	public static final String VALUE = "value";

	public static final String CODE = "code";

	public static final String LANGUAGE = "language";

	public static final String BIOMETRICS_TYPE = "biometricsType";

	public static final String DOCUMENT_TYPE = "documentType";

	public static final String SIMPLE_TYPE = "simpleType";

	public static final String STRING = "String";

	public static final String SLASH = "/";

	public static final String SCHEMA_FIELD_DEF_PATH = "$.properties.identity.properties.*.$ref";

	public static final String SCHEMA_SUB_TYPE_PATH = "$.properties.identity.properties.*.subType";
	
	public static final String MOSIP_MANDATORY_LANG = "mosip.mandatory-languages";
	
	public static final String MOSIP_OPTIONAL_LANG = "mosip.optional-languages";
	
	public static final String IDENTITY_ID_SCHEMA_VERSION_PATH = "mosip.kernel.idobjectvalidator.identity.id-schema-version-path";
	
	public static final String IDENTITY_DOB_PATH = "mosip.kernel.idobjectvalidator.identity.dob-path";
	
	public static final String DOB_FORMAT = "mosip.kernel.idobjectvalidator.date-format";
	
	public static final String VALUE_NA = "mosip.kernel.idobjectvalidator.masterdata.value-not-available";
	
	public static final String IDENTITY_LANGUAGE_PATH = "identity.*.*.language";

	public static final String MASTER_DATA_URI = "mosip.idobjectvalidator.masterdata.rest.uri";

	public static final String IS_CACHE_RESET_ENABLED = "mosip.idobjectvalidator.refresh-cache-on-unknown-value";

	public static final String CACHE_RESET_CRON_PATTERN = "mosip.idobjectvalidator.scheduler.reset-cache.cron-job-pattern";
}
