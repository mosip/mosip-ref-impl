package org.springframework.boot.web.client;

/**
 * Boot 4 no longer ships this type. MOSIP {@code RegistrationStatusBeanConfig}
 * still constructs it ({@code new RestTemplateBuilder()}).
 */
@FunctionalInterface
public interface RestTemplateCustomizer {

	/**
	 * Customize a RestTemplate. Unused by the MOSIP bean factory method.
	 *
	 * @param restTemplate template to customize
	 */
	void customize(Object restTemplate);
}
