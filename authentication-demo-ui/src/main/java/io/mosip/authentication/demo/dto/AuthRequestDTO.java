package io.mosip.authentication.demo.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * The Class AuthRequestDTO.
 * 
 * @author Sanjay Murali
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AuthRequestDTO extends BaseAuthRequestDTO {

	/** The value for transactionID*/
	private String transactionID;

	/** The value for requestTime*/
	private String requestTime;
	
	/** The value for request*/
	private RequestDTO request;

	/** The value for consentObtained*/
	private boolean consentObtained;
	

	/** The value for individualId*/
	private String individualId;
	

	/** The value for requestHMAC*/
	private String requestHMAC;
	
	/** The value for thumbprint*/
	private String thumbprint;
	
	/** The value for requestSessionKey*/
	private String requestSessionKey;
	
	private String env;
	
	private String  domainUri;
	
	@Deprecated(since="1.2.0")
	private AuthTypeDTO requestedAuth;
	
	@Deprecated(since="1.2.0")
	private String individualIdType;

}
