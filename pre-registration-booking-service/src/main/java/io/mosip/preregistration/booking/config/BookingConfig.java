
/* 
 * Copyright
 * 
 */
package io.mosip.preregistration.booking.config;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;


/**
 * This class is used for Swagger / Springdoc configuration, host and port helpers,
 * and MOSIP booking id maps.
 * <p>
 * {@link #openApi()} registers an <strong>Authorize</strong> apiKey named
 * {@code Authorization} (header), same pattern as commons kernel-auth-service.
 * </p>
 * 
 * @author Kishan Rathore
 * @author Jagadishwari
 * @author Ravi C. Balaji
 * @since 1.0.0
 *
 */
@Configuration
@ConfigurationProperties("mosip.preregistration.booking")
public class BookingConfig {
	
	/** The id. */
	private Map<String, String> id;
	
	/**
	 * Sets the id.
	 *
	 * @param id the id
	 */
	public void setId(Map<String, String> id) {
		this.id = id;
	}
	

	/**
	 * Id.
	 *
	 * @return the map
	 */
	@Bean
	public Map<String, String> ic() {
		return Collections.unmodifiableMap(id);
	}

	/**
	 * Reference for ${application.env.local:false} from property file.
	 */
	@Value("${application.env.local:false}")
	private Boolean localEnv;

	/**
	 * Reference for ${swagger.base-url:#{null}} from property file.
	 */
	@Value("${swagger.base-url:#{null}}")
	private String swaggerBaseUrl;

	/**
	 * Reference for ${server.port:9095} from property file.
	 */
	@Value("${server.port:9095}")
	private int serverPort;

	/**
	 * To define Protocol
	 */
	String proto = "http";
	/**
	 * To define Host
	 */
	String host = "localhost";
	/**
	 * To define port
	 */
	int port = -1;
	String hostWithPort = "localhost:9095";

	/**
	 * @return set or protocols
	 */
	private Set<String> protocols() {
		Set<String> protocols = new HashSet<>();
		protocols.add(proto);
		return protocols;
	}

	private static final Logger logger = LoggerFactory.getLogger(BookingConfig.class);

	/**
	 * Scheme name shown by Swagger UI as Authorize (IDA-style Authorization apiKey).
	 */
	public static final String AUTHORIZATION_SCHEME = "Authorization";

	@Autowired
	private OpenApiProperties openApiProperties;

	@Bean
	public OpenAPI openApi() {
		OpenAPI api = new OpenAPI()
				.components(new Components().addSecuritySchemes(AUTHORIZATION_SCHEME, authorizationApiKey()))
				.addSecurityItem(new SecurityRequirement().addList(AUTHORIZATION_SCHEME))
				.info(new Info()
						.title(openApiProperties.getInfo().getTitle())
						.version(openApiProperties.getInfo().getVersion())
						.description(openApiProperties.getInfo().getDescription())
						.license(new License()
								.name(openApiProperties.getInfo().getLicense().getName())
								.url(openApiProperties.getInfo().getLicense().getUrl())));

		openApiProperties.getService().getServers().forEach(server -> {
			api.addServersItem(new Server().description(server.getDescription()).url(server.getUrl()));
		});
		logger.info("swagger open api bean is ready");
		return api;
	}

	/**
	 * Header apiKey named {@code Authorization} so Swagger UI shows Authorize
	 * with Name / In / Value (same as commons kernel-auth-service).
	 *
	 * @return the security scheme
	 */
	private static SecurityScheme authorizationApiKey() {
		return new SecurityScheme().type(SecurityScheme.Type.APIKEY).in(SecurityScheme.In.HEADER)
				.name(AUTHORIZATION_SCHEME);
	}

	@Bean
	public GroupedOpenApi groupedOpenApi() {
		return GroupedOpenApi.builder().group(openApiProperties.getGroup().getName())
				.pathsToMatch(openApiProperties.getGroup().getPaths().stream().toArray(String[]::new))
				.build();
	}

}



