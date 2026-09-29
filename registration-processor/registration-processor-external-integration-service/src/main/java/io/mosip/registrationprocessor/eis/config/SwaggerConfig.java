package io.mosip.registrationprocessor.eis.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Autowired;
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
 * Springdoc OpenAPI / Swagger UI configuration for the External Integration Service.
 * <p>
 * Swagger UI shows an <strong>Authorize</strong> button that sends the
 * {@code Authorization} header (IDA-style apiKey), matching commons kernel services.
 * </p>
 *
 * @implSpec OpenAPI 3 / springdoc (not Swagger 2)
 */
@Configuration
public class SwaggerConfig {

	/** Logger reserved for this configuration class. */
	private static final Logger logger = LoggerFactory.getLogger(SwaggerConfig.class);

	/**
	 * Scheme name shown by Swagger UI as Authorize (IDA-style Authorization apiKey).
	 */
	public static final String AUTHORIZATION_SCHEME = "Authorization";

	/** OpenAPI title, description, version, license, group, and server list from {@code openapi.*}. */
	@Autowired
	private OpenApiProperties openApiProperties;

	/**
	 * OpenAPI document used by Springdoc for Swagger UI.
	 *
	 * @return configured {@link OpenAPI} with info, servers, and Authorize apiKey
	 */
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
	 * with Name / In / Value.
	 *
	 * @return the security scheme
	 */
	private static SecurityScheme authorizationApiKey() {
		return new SecurityScheme().type(SecurityScheme.Type.APIKEY).in(SecurityScheme.In.HEADER)
				.name(AUTHORIZATION_SCHEME);
	}

	/**
	 * Groups servlet paths into one Swagger UI document ({@code openapi.group.*}).
	 *
	 * @return grouped OpenAPI definition
	 */
	@Bean
	public GroupedOpenApi groupedOpenApi() {
		return GroupedOpenApi.builder().group(openApiProperties.getGroup().getName())
				.pathsToMatch(openApiProperties.getGroup().getPaths().stream().toArray(String[]::new))
				.build();
	}
}
