package io.mosip.registrationprocessor.eis.config;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

import java.util.List;

import org.junit.Test;
import org.springframework.test.util.ReflectionTestUtils;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme;

/**
 * Swagger UI Authorize is an OpenAPI header apiKey named Authorization.
 */
public class SwaggerConfigTest {

	@Test
	public void openApiRegistersAuthorizationHeaderApiKey() {
		SwaggerConfig config = new SwaggerConfig();
		ReflectionTestUtils.setField(config, "openApiProperties", sampleProperties());

		OpenAPI api = config.openApi();
		SecurityScheme scheme = api.getComponents().getSecuritySchemes().get(SwaggerConfig.AUTHORIZATION_SCHEME);

		assertNotNull(scheme);
		assertEquals(SecurityScheme.Type.APIKEY, scheme.getType());
		assertEquals(SecurityScheme.In.HEADER, scheme.getIn());
		assertEquals(SwaggerConfig.AUTHORIZATION_SCHEME, scheme.getName());
		assertFalse(api.getSecurity().isEmpty());
		assertEquals(SwaggerConfig.AUTHORIZATION_SCHEME, api.getSecurity().get(0).keySet().iterator().next());
		assertEquals("/registrationprocessor/v1/eis", api.getServers().get(0).getUrl());
	}

	private static OpenApiProperties sampleProperties() {
		LicenseProperty license = new LicenseProperty();
		license.setName("Mosip");
		license.setUrl("https://docs.mosip.io/platform/license");
		InfoProperty info = new InfoProperty();
		info.setTitle("External Integration Service");
		info.setDescription("External Integration Service");
		info.setVersion("1.0");
		info.setLicense(license);
		Server server = new Server();
		server.setUrl("/registrationprocessor/v1/eis");
		server.setDescription("External Integration Service");
		Service service = new Service();
		service.setServers(List.of(server));
		OpenApiProperties properties = new OpenApiProperties();
		properties.setInfo(info);
		properties.setService(service);
		return properties;
	}
}
