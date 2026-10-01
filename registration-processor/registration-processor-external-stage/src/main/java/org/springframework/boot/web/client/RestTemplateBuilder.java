package org.springframework.boot.web.client;

/**
 * Boot 4 no longer ships this type. MOSIP {@code RegistrationStatusBeanConfig#getRestTemplateBuilder}
 * still does {@code new RestTemplateBuilder()}.
 */
public class RestTemplateBuilder {

	/**
	 * Matches the Boot 3 constructor invoked by MOSIP status-service-impl.
	 *
	 * @param customizers unused
	 */
	public RestTemplateBuilder(RestTemplateCustomizer... customizers) {
	}
}
