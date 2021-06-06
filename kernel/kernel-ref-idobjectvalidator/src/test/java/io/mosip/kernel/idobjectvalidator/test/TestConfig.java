package io.mosip.kernel.idobjectvalidator.test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * @author Manoj SP
 *
 */
@Configuration
public class TestConfig {

	ObjectMapper mapper = new ObjectMapper();

	@Bean
	public RestTemplate restTemplate()
			throws RestClientException, JsonParseException, JsonMappingException, IOException, URISyntaxException {
		mapper.registerModule(new Jdk8Module()).registerModule(new JavaTimeModule());
		RestTemplate restTemplate = mock(RestTemplate.class);
		mockGenderResponse(restTemplate);
		return restTemplate;
	}

	private void mockGenderResponse(RestTemplate restTemplate)
			throws RestClientException, JsonParseException, JsonMappingException, IOException, URISyntaxException {
		String response = "{\"id\":null,\"version\":null,\"responsetime\":\"2019-05-21T05:37:06.813Z\",\"metadata\":null,\"response\":{\"genderType\":[{\"code\":\"MLE\",\"genderName\":\"Male\",\"langCode\":\"eng\",\"isActive\":true}]},\"errors\":null}";
		when(restTemplate.getForObject(new URI("http://0.0.0.0/genderTypes?langCode=eng"), ObjectNode.class))
				.thenReturn(mapper.readValue(response.getBytes(), ObjectNode.class));
	}

	@Bean
	public ObjectMapper objectMapper() {
		return mapper;
	}
}
