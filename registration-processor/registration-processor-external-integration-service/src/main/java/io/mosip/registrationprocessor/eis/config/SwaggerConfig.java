package io.mosip.registrationprocessor.eis.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;

/**
 * Configuration class for swagger config
 * @implSpec upgrade the Swagger2.0 to OpenAPI (Swagger3.0)
 *
 */
@Configuration
public class SwaggerConfig {

	private static final Logger logger = LoggerFactory.getLogger(SwaggerConfig.class);

	@Autowired
	private OpenApiProperties openApiProperties;

	@Bean
	public OpenAPI openApi() {
		OpenAPI api = new OpenAPI()
				.components(new Components())
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

	@Bean
	public GroupedOpenApi groupedOpenApi() {
		return GroupedOpenApi.builder().group(openApiProperties.getGroup().getName())
				.pathsToMatch(openApiProperties.getGroup().getPaths().stream().toArray(String[]::new))
				.build();
	}
}