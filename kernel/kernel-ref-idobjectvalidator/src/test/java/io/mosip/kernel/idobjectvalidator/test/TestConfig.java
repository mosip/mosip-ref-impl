package io.mosip.kernel.idobjectvalidator.test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import io.mosip.kernel.core.http.ResponseWrapper;

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

	@SuppressWarnings("unchecked")
	private void mockGenderResponse(RestTemplate restTemplate)
			throws RestClientException, JsonParseException, JsonMappingException, IOException, URISyntaxException {
		String response = "{\"id\":null,\"version\":null,\"responsetime\":\"2021-06-24T16:32:55.693Z\",\"metadata\":null,\"response\":{\"eng\":[{\"code\":\"Female\",\"value\":null,\"dataType\":\"string\"},{\"code\":\"Others\",\"value\":null,\"dataType\":\"string\"},{\"code\":\"Male\",\"value\":null,\"dataType\":\"string\"}]},\"errors\":null}";
		when(restTemplate.exchange(Mockito.any(URI.class), Mockito.any(HttpMethod.class), Mockito.any(), Mockito.any(ParameterizedTypeReference.class)))
				.thenReturn(new ResponseEntity<>(mapper.readValue(response.getBytes(), ResponseWrapper.class), HttpStatus.OK));
	}

	@Bean
	public ObjectMapper objectMapper() {
		return mapper;
	}
}
