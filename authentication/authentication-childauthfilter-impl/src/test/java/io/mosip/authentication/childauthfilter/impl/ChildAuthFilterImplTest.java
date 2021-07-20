package io.mosip.authentication.childauthfilter.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.springframework.test.util.ReflectionTestUtils;

import io.mosip.authentication.authfilter.exception.IdAuthenticationFilterException;
import io.mosip.authentication.core.constant.IdAuthCommonConstants;
import io.mosip.authentication.core.indauth.dto.AuthRequestDTO;
import io.mosip.authentication.core.indauth.dto.AuthTypeDTO;
import io.mosip.authentication.core.indauth.dto.IdentityInfoDTO;

/**
 * @author Loganathan Sekar
 *
 */
public class ChildAuthFilterImplTest {
	
	private static final int CHILD_MAX_AGE_TEST = 6;
	private static final String DATE_OF_BIRTH_ATTRIB_NAME = "dateOfBirth";
	private ChildAuthFilterImpl childAuthFilterImpl = new ChildAuthFilterImpl();
	
	@Before
	public void before() {
		ReflectionTestUtils.setField(childAuthFilterImpl, "dateOfBirthAttributeName", DATE_OF_BIRTH_ATTRIB_NAME);
		ReflectionTestUtils.setField(childAuthFilterImpl, "dateOfBirthPattern", IdAuthCommonConstants.DOB_PATTERN);
		ReflectionTestUtils.setField(childAuthFilterImpl, "childMaxAge", CHILD_MAX_AGE_TEST);
		ReflectionTestUtils.setField(childAuthFilterImpl, "factorsDeniedForChild", new String[] {"otp", "bio"});
	}
	
	@Test
	public void testInit() throws IdAuthenticationFilterException {
		childAuthFilterImpl.init();
	}
	
	@Test
	public void testValidDateOfBirth() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(8).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidChildDateOfBirth_OTP() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setOtp(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(4).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test
	public void testValidChildDateOfBirth_OTP_Allowed() throws IdAuthenticationFilterException {
		ReflectionTestUtils.setField(childAuthFilterImpl, "factorsDeniedForChild", new String[] {"bio", "demo"});
		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setOtp(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(4).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidChildDateOfBirth_BIO() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setBio(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(4).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test
	public void testValidChildDateOfBirth_BIO_Allowed() throws IdAuthenticationFilterException {
		ReflectionTestUtils.setField(childAuthFilterImpl, "factorsDeniedForChild", new String[] {"demo", "otp"});
		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setBio(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(4).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidChildDateOfBirth_Demo() throws IdAuthenticationFilterException {
		ReflectionTestUtils.setField(childAuthFilterImpl, "factorsDeniedForChild", new String[] {"demo", "bio"});

		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setDemo(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(4).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test
	public void testValidChildDateOfBirth_Demo_NotAlowed() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setDemo(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(4).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test
	public void testValidChildDateOfBirth_Bio_BorderCase_exact() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setBio(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(CHILD_MAX_AGE_TEST).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidChildDateOfBirth_Bio_BorderCase_1day_less() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setBio(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(CHILD_MAX_AGE_TEST).plusDays(1).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test
	public void testValidChildDateOfBirth_Bio_BorderCase_1day_more() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setBio(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().minusYears(CHILD_MAX_AGE_TEST).minusDays(1).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidChildDateOfBirth_Bio_FutureDate() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		AuthTypeDTO requestedAuth = new AuthTypeDTO();
		requestedAuth.setBio(true);
		req.setRequestedAuth(requestedAuth);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
		String dob = LocalDate.now().plusYears(1).plusDays(1).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidInvalidDOB() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd-yyyy");
		String dob = LocalDate.now().minusYears(8).format(formatter );
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidEmptyDOB() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		String dob = "";
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidNullDOB() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		String dob = null;
		IdentityInfoDTO identityInfoDTO = new IdentityInfoDTO();
		identityInfoDTO.setValue(dob);
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of(identityInfoDTO));
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidEmptyDOBData() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		Map<String, List<IdentityInfoDTO>> identityData = Map.of(DATE_OF_BIRTH_ATTRIB_NAME, List.of());
		childAuthFilterImpl.validate(req, identityData, null);
	}
	
	@Test(expected = IdAuthenticationFilterException.class)
	public void testValidNullDOBData() throws IdAuthenticationFilterException {
		AuthRequestDTO req = new AuthRequestDTO();
		Map<String, List<IdentityInfoDTO>> identityData = new HashMap<>();
		identityData.put(DATE_OF_BIRTH_ATTRIB_NAME, null);
		childAuthFilterImpl.validate(req, identityData, null);
	}
	

}
