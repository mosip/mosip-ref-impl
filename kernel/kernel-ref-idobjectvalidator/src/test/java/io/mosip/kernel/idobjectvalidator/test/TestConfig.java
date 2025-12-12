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
		String genderResponse = "{\"id\":null,\"version\":null,\"responsetime\":\"2021-06-24T16:32:55.693Z\",\"metadata\":null,\"response\":{\"eng\":[{\"code\":\"Female\",\"value\":null,\"dataType\":\"string\"},{\"code\":\"Others\",\"value\":null,\"dataType\":\"string\"},{\"code\":\"Male\",\"value\":null,\"dataType\":\"string\"}]},\"errors\":null}";
		String documentTypeResponse = "{\"id\":null,\"version\":null,\"responsetime\":\"2021-06-24T16:32:55.693Z\",\"metadata\":null,\"response\":{\"eng\":[{\"code\":\"passport\",\"value\":\"Passport\",\"dataType\":\"string\"},{\"code\":\"drivingLicense\",\"value\":\"Driving License\",\"dataType\":\"string\"},{\"code\":\"Ration Card\",\"value\":\"Ration Card\",\"dataType\":\"string\"},{\"code\":\"DOC001\",\"value\":\"Document Type 1\",\"dataType\":\"string\"},{\"code\":\"Birth Certificate\",\"value\":\"Birth Certificate\",\"dataType\":\"string\"}],\"fra\":[{\"code\":\"passport\",\"value\":\"Passeport\",\"dataType\":\"string\"}],\"ara\":[{\"code\":\"passport\",\"value\":\"جواز سفر\",\"dataType\":\"string\"}]},\"errors\":null}";

		String biometricTypeResponse = "{\"id\":null,\"version\":null,\"responsetime\":\"2021-06-24T16:32:55.693Z\",\"metadata\":null,\"response\":{\"eng\":[{\"code\":\"fileReferenceID\",\"value\":\"File Reference ID\",\"dataType\":\"string\"},{\"code\":\"fileRef\",\"value\":\"File Ref\",\"dataType\":\"string\"}],\"fra\":[{\"code\":\"fileReferenceID\",\"value\":\"ID de référence de fichier\",\"dataType\":\"string\"}],\"ara\":[{\"code\":\"fileReferenceID\",\"value\":\"معرف مرجع الملف\",\"dataType\":\"string\"}]},\"errors\":null}";
		String stringTypeResponse = "{\"id\":null,\"version\":null,\"responsetime\":\"2021-06-24T16:32:55.693Z\",\"metadata\":null,\"response\":{\"eng\":[{\"code\":\"12345\",\"value\":\"12345\",\"dataType\":\"string\"},{\"code\":\"10112\",\"value\":\"10112\",\"dataType\":\"string\"},{\"code\":\"570004\",\"value\":\"570004\",\"dataType\":\"string\"},{\"code\":\"test@test.com\",\"value\":\"test@test.com\",\"dataType\":\"string\"},{\"code\":\"abc@xyz.com\",\"value\":\"abc@xyz.com\",\"dataType\":\"string\"},{\"code\":\"9876543210\",\"value\":\"9876543210\",\"dataType\":\"string\"},{\"code\":\"1234567890\",\"value\":\"1234567890\",\"dataType\":\"string\"}],\"fra\":[{\"code\":\"12345\",\"value\":\"12345\",\"dataType\":\"string\"}],\"ara\":[{\"code\":\"12345\",\"value\":\"12345\",\"dataType\":\"string\"}]},\"errors\":null}";

		when(restTemplate.exchange(Mockito.any(URI.class), Mockito.any(HttpMethod.class), Mockito.any(),
				Mockito.any(ParameterizedTypeReference.class)))
				.thenAnswer(invocation -> {
					URI uri = invocation.getArgument(0);
					String uriString = uri.toString();

					if (uriString.contains("genderTypes")) {
						return new ResponseEntity<>(mapper.readValue(genderResponse.getBytes(), ResponseWrapper.class),
								HttpStatus.OK);
					} else if (uriString.contains("proofOfIdentityTypes") || uriString.contains("proofOfAddressTypes")
							|| uriString.contains("proofOfDateOfBirthTypes")
							|| uriString.contains("proofOfRelationshipTypes")) {
						return new ResponseEntity<>(
								mapper.readValue(documentTypeResponse.getBytes(), ResponseWrapper.class),
								HttpStatus.OK);
					} else if (uriString.contains("individualBiometricsTypes")
							|| uriString.contains("parentOrGuardianBiometricsTypes")
							|| uriString.contains("individualAuthBiometricsTypes")) {
						return new ResponseEntity<>(
								mapper.readValue(biometricTypeResponse.getBytes(), ResponseWrapper.class),
								HttpStatus.OK);
					} else if (uriString.contains("postalCode") || uriString.contains("email")
							|| uriString.contains("phone")
							|| uriString.contains("referenceIdentityNumber")) {
						return new ResponseEntity<>(
								mapper.readValue(stringTypeResponse.getBytes(), ResponseWrapper.class), HttpStatus.OK);
					} else {
						return new ResponseEntity<>(mapper.readValue(genderResponse.getBytes(), ResponseWrapper.class),
								HttpStatus.OK);
					}
				});
	}

	@Bean
	public ObjectMapper objectMapper() {
		return mapper;
	}
}
