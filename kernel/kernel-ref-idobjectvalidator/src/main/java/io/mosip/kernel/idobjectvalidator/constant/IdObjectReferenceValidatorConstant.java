package io.mosip.kernel.idobjectvalidator.constant;

/**
 * JSON-path keys, identity field types, and configuration property names used by
 * {@link io.mosip.kernel.idobjectvalidator.impl.IdObjectReferenceValidator}.
 *
 * @author Manoj SP
 */
public class IdObjectReferenceValidatorConstant {

	/** JSON property name {@code type}. */
	public static final String TYPE = "type";

	/** JSON property name {@code value}. */
	public static final String VALUE = "value";

	/** JSON property name {@code code}. */
	public static final String CODE = "code";

	/** JSON property name {@code language}. */
	public static final String LANGUAGE = "language";

	/** Identity schema type name for biometric attributes. */
	public static final String BIOMETRICS_TYPE = "biometricsType";

	/** Identity schema type name for document attributes. */
	public static final String DOCUMENT_TYPE = "documentType";

	/** Identity schema type name for language-tagged simple values. */
	public static final String SIMPLE_TYPE = "simpleType";

	/** Identity schema type name for plain strings. */
	public static final String STRING = "String";

	/** Path separator used when building JSON Pointer-like paths. */
	public static final String SLASH = "/";

	/** JsonPath to each identity field {@code $ref} in the ID schema. */
	public static final String SCHEMA_FIELD_DEF_PATH = "$.properties.identity.properties.*.$ref";

	/** JsonPath to each identity field {@code subType} in the ID schema. */
	public static final String SCHEMA_SUB_TYPE_PATH = "$.properties.identity.properties.*.subType";

	/** Config key for MOSIP mandatory UI languages. */
	public static final String MOSIP_MANDATORY_LANG = "mosip.mandatory-languages";

	/** Config key for MOSIP optional UI languages. */
	public static final String MOSIP_OPTIONAL_LANG = "mosip.optional-languages";

	/** Config key for the identity JSON path of ID schema version. */
	public static final String IDENTITY_ID_SCHEMA_VERSION_PATH = "mosip.kernel.idobjectvalidator.identity.id-schema-version-path";

	/** Config key for the identity JSON path of date of birth. */
	public static final String IDENTITY_DOB_PATH = "mosip.kernel.idobjectvalidator.identity.dob-path";

	/** Config key for accepted DOB date format. */
	public static final String DOB_FORMAT = "mosip.kernel.idobjectvalidator.date-format";

	/** Config key for the masterdata "value not available" sentinel. */
	public static final String VALUE_NA = "mosip.kernel.idobjectvalidator.masterdata.value-not-available";

	/** JsonPath matching language tags under identity. */
	public static final String IDENTITY_LANGUAGE_PATH = "identity.*.*.language";

	/** Config key for the masterdata REST URI template. */
	public static final String MASTER_DATA_URI = "mosip.idobjectvalidator.masterdata.rest.uri";

	/** Config key: refresh masterdata cache when an unknown code is seen. */
	public static final String IS_CACHE_RESET_ENABLED = "mosip.idobjectvalidator.refresh-cache-on-unknown-value";

	/** Config key: cron expression that clears the masterdata cache. */
	public static final String CACHE_RESET_CRON_PATTERN = "mosip.idobjectvalidator.scheduler.reset-cache.cron-job-pattern";
}
