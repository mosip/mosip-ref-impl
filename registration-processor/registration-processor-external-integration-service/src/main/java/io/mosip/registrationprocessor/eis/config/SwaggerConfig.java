package io.mosip.registrationprocessor.eis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

/**
 * external Configuration
 *
 */
@Configuration
public class SwaggerConfig {
	/**
	 * DummyBean method for swagger configuration
	 * @return
	 */
	public OpenAPI customOpenAPI() {
		return new OpenAPI()
				.components(new Components())
				.info(new Info().title("External Integration Service API documentation").description(
						"External Integration service ").version("3.0.1"));
	}
}
