package io.mosip.preregistration.booking.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.List;

/**
 * Binds {@code openapi.*} properties used by {@link BookingConfig} for Springdoc.
 */
@Configuration
@ConfigurationProperties(prefix = "openapi")
@Data
public class OpenApiProperties {
	/** API title, description, version, and license. */
	private InfoProperty info;
	/** Published server URLs for the OpenAPI document. */
	private Service service;
	/** Swagger UI group name and path filters. */
	private Group group;
}

/** OpenAPI info block bound from {@code openapi.info.*}. */
@Data
class InfoProperty {
	/** Display title in Swagger UI. */
	private String title;
	/** Longer description of the API. */
	private String description;
	/** Document version string. */
	private String version;
	/** License name and URL. */
	private LicenseProperty license;
}

/** License fields bound from {@code openapi.info.license.*}. */
@Data
class LicenseProperty {
	/** License display name (for example Mosip). */
	private String name;
	/** License document URL. */
	private String url;
}

/** Server list bound from {@code openapi.service.*}. */
@Data
class Service {
	/** OpenAPI servers (Try-it-out base URLs). */
	private List<Server> servers;
}

/** A single OpenAPI server URL and description. */
@Data
class Server {
	/** Human-readable server label. */
	private String description;
	/** Absolute or relative base URL. */
	private String url;
}

/** Path group bound from {@code openapi.group.*}. */
@Data
class Group {
	/** Springdoc group name. */
	private String name;
	/** Ant-style paths included in this group. */
	private List<String> paths;
}
