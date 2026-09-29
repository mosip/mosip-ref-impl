package io.mosip.preregistration.booking.config;

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
public class BookingConfigOpenApiTest {

	@Test
	public void openApiRegistersAuthorizationHeaderApiKey() {
		BookingConfig config = new BookingConfig();
		ReflectionTestUtils.setField(config, "openApiProperties", sampleProperties());

		OpenAPI api = config.openApi();
		SecurityScheme scheme = api.getComponents().getSecuritySchemes().get(BookingConfig.AUTHORIZATION_SCHEME);

		assertNotNull(scheme);
		assertEquals(SecurityScheme.Type.APIKEY, scheme.getType());
		assertEquals(SecurityScheme.In.HEADER, scheme.getIn());
		assertEquals(BookingConfig.AUTHORIZATION_SCHEME, scheme.getName());
		assertFalse(api.getSecurity().isEmpty());
		assertEquals(BookingConfig.AUTHORIZATION_SCHEME, api.getSecurity().get(0).keySet().iterator().next());
		assertEquals("/preregistration/v1", api.getServers().get(0).getUrl());
	}

	private static OpenApiProperties sampleProperties() {
		LicenseProperty license = new LicenseProperty();
		license.setName("Mosip");
		license.setUrl("https://docs.mosip.io/platform/license");
		InfoProperty info = new InfoProperty();
		info.setTitle("Pre-Registration-Booking");
		info.setDescription("Pre-Registration-Booking Service");
		info.setVersion("1.0");
		info.setLicense(license);
		Server server = new Server();
		server.setUrl("/preregistration/v1");
		server.setDescription("Pre-Registration-Booking Service");
		Service service = new Service();
		service.setServers(List.of(server));
		OpenApiProperties properties = new OpenApiProperties();
		properties.setInfo(info);
		properties.setService(service);
		return properties;
	}
}
