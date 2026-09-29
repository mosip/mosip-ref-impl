package io.mosip.registrationprocessor.externalstage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import io.mosip.registrationprocessor.externalstage.stage.ExternalStage;

/**
 * Registers Vert.x {@link ExternalStage} as a Spring bean (aspects enabled).
 */
@Configuration
@EnableAspectJAutoProxy
public class Externalconfig {
	/**
	 * @return new {@link ExternalStage} instance managed by Spring
	 */
	@Bean
	public ExternalStage externalStage() {
		return new ExternalStage();
	}
}
