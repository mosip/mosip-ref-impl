package io.mosip.kernel.idobjectvalidator.test;

import static io.mosip.kernel.core.idobjectvalidator.constant.IdObjectValidatorErrorConstant.INVALID_INPUT_PARAMETER;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.autoconfigure.RefreshAutoConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestContext;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.mosip.kernel.core.idobjectvalidator.exception.IdObjectIOException;
import io.mosip.kernel.core.idobjectvalidator.exception.IdObjectValidationFailedException;
import io.mosip.kernel.core.idobjectvalidator.exception.InvalidIdSchemaException;
import io.mosip.kernel.core.idobjectvalidator.spi.IdObjectValidator;
import io.mosip.kernel.idobjectvalidator.impl.IdObjectReferenceValidator;

/**
 * @author Manoj SP
 *
 */
@RunWith(SpringRunner.class)
@ContextConfiguration(classes = { TestContext.class, WebApplicationContext.class })
@ImportAutoConfiguration(RefreshAutoConfiguration.class)
@SpringBootTest
@Import({ IdObjectReferenceValidator.class, TestConfig.class })
@EnableConfigurationProperties
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
@ActiveProfiles("test")
public class IdObjectReferenceValidatorTest {

	@Autowired
	Environment env;

	@Autowired
	private IdObjectValidator validator;
	
	private String schema;
	
	@Before
	public void init() throws IOException {
		schema = IOUtils.toString(ClassLoader.getSystemResourceAsStream("schema.json"), "UTF-8");
	}

	@Test
	public void testValidData() throws JsonParseException, JsonMappingException, IdObjectValidationFailedException,
			IdObjectIOException, IOException, InvalidIdSchemaException {
		String identityString = "{\"identity\":{\"residenceStatus\":[{\"language\":\"eng\",\"value\":\"Native\"}],\"IDSchemaVersion\":1.0,\"UIN\":4920546943,\"fullName\":[{\"language\":\"eng\",\"value\":\"Ibrahim Ibn Ali\"}],\"dateOfBirth\":\"1955/04/15\",\"age\":45,\"gender\":[{\"language\":\"eng\",\"value\":\"Male\"}],\"addressLine1\":[{\"language\":\"eng\",\"value\":\"exemple d'adresse ligne 1\"}],\"addressLine2\":[{\"language\":\"eng\",\"value\":\"exemple d'adresse ligne 2\"}],\"addressLine3\":[{\"language\":\"eng\",\"value\":\"exemple d'adresse ligne 2\"}],\"region\":[{\"language\":\"eng\",\"value\":\"Rabat Sale Kenitra\"}],\"province\":[{\"language\":\"eng\",\"value\":\"Kenitra\"}],\"city\":[{\"language\":\"eng\",\"value\":\"Kenitra\"}],\"postalCode\":\"10112\",\"phone\":\"9876543210\",\"email\":\"abc@xyz.com\",\"CNIENumber\":\"6789545678909\",\"localAdministrativeAuthority\":[{\"language\":\"eng\",\"value\":\"Mograne\"}],\"parentOrGuardianRID\":212124324784912,\"parentOrGuardianUIN\":212124324784912,\"parentOrGuardianName\":[{\"language\":\"eng\",\"value\":\"salma\"}],\"proofOfAddress\":{\"format\":\"pdf\",\"type\":\"Ration Card\",\"value\":\"fileReferenceID\"},\"proofOfIdentity\":{\"format\":\"txt\",\"type\":\"DOC001\",\"value\":\"fileReferenceID\"},\"proofOfRelationship\":{\"format\":\"pdf\",\"type\":\"Birth Certificate\",\"value\":\"fileReferenceID\"},\"proofOfDateOfBirth\":{\"format\":\"pdf\",\"type\":\"passport\",\"value\":\"fileReferenceID\"},\"individualBiometrics\":{\"format\":\"cbeff\",\"version\":1.0,\"value\":\"fileReferenceID\"},\"parentOrGuardianBiometrics\":{\"format\":\"cbeff\",\"version\":1.1,\"value\":\"fileReferenceID\"}}}";
		try {
			
			validator.validateIdObject(schema,
					new ObjectMapper().readValue(identityString.getBytes(StandardCharsets.UTF_8), Object.class));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void testReferenceValidatorError() throws IdObjectValidationFailedException, IdObjectIOException, JsonParseException,
			JsonMappingException, IOException, InvalidIdSchemaException {
		try {
			String identityString = "{\"identity\":{\"IDSchemaVersion\":1.0,\"UIN\":4920546943,\"fullName\":[{\"language\":\"ara\",\"value\":\"ابراهيم بن علي\"},{\"language\":\"eng\",\"value\":\"Ibrahim Ibn Ali\"}],\"dateOfBirth\":\"1955/04/15\",\"age\":45,\"gender\":[{\"language\":\"ara\",\"value\":\"الذكر\"},{\"language\":\"eng\",\"value\":\"male\"}],\"addressLine1\":[{\"language\":\"ara\",\"value\":\"عنوان العينة سطر 1\"},{\"language\":\"eng\",\"value\":\"exemple d'adresse ligne 1\"}],\"addressLine2\":[{\"language\":\"ara\",\"value\":\"عنوان العينة سطر 2\"},{\"language\":\"eng\",\"value\":\"exemple d'adresse ligne 2\"}],\"addressLine3\":[{\"language\":\"ara\",\"value\":\"عنوان العينة سطر 2\"},{\"language\":\"eng\",\"value\":\"exemple d'adresse ligne 2\"}],\"region\":[{\"language\":\"ara\",\"value\":\"طنجة - تطوان - الحسيمة\"},{\"language\":\"eng\",\"value\":\"T\"}],\"province\":[{\"language\":\"ara\",\"value\":\"فاس-مكناس\"},{\"language\":\"eng\",\"value\":\"Fès-Meknès\"}],\"city\":[{\"language\":\"ara\",\"value\":\"الدار البيضاء\"},{\"language\":\"eng\",\"value\":\"Casablanca\"}],\"postalCode\":\"570004\",\"phone\":\"9876543210\",\"email\":\"abc@xyz.com\",\"CNIENumber\":\"6789545678909\",\"localAdministrativeAuthority\":[{\"language\":\"ara\",\"value\":\"سلمى\"},{\"language\":\"eng\",\"value\":\"salma\"}],\"parentOrGuardianRID\":212124324784912,\"parentOrGuardianUIN\":212124324784912,\"parentOrGuardianName\":[{\"language\":\"ara\",\"value\":\"سلمى\"},{\"language\":\"eng\",\"value\":\"salma\"}],\"proofOfAddress\":{\"format\":\"pdf\",\"type\":\"drivingLicense\",\"value\":\"fileReferenceID\"},\"proofOfIdentity\":{\"format\":\"txt\",\"type\":\"passport\",\"value\":\"fileReferenceID\"},\"proofOfRelationship\":{\"format\":\"pdf\",\"type\":\"passport\",\"value\":\"fileReferenceID\"},\"proofOfDateOfBirth\":{\"format\":\"pdf\",\"type\":\"passport\",\"value\":\"fileReferenceID\"},\"individualBiometrics\":{\"format\":\"cbeff\",\"version\":1.0,\"value\":\"fileReferenceID\"},\"parentOrGuardianBiometrics\":{\"format\":\"cbeff\",\"version\":1.1,\"value\":\"fileReferenceID\"}}}";
			validator.validateIdObject(schema,
					new ObjectMapper().readValue(identityString.getBytes(StandardCharsets.UTF_8), Object.class));
		} catch (IdObjectValidationFailedException e) {
			assertTrue(Optional.ofNullable(e.getCodes())
					.map(codes -> codes.contains(INVALID_INPUT_PARAMETER.getErrorCode())).get());
			assertTrue(e.getErrorTexts()
					.contains(String.format(INVALID_INPUT_PARAMETER.getMessage(), "identity/gender/0/language")));
			assertTrue(e.getErrorTexts()
					.contains(String.format(INVALID_INPUT_PARAMETER.getMessage(), "identity/addressLine3/0/language")));
		}
	}

}
