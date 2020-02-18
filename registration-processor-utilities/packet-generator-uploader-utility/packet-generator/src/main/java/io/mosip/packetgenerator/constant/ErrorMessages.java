package io.mosip.packetgenerator.constant;
/**
 * 
 * @author Girish Yarru
 *
 */
public enum ErrorMessages {
	API_RESOUCE_ACCESS_FAILED("PKTGNR - 001", "Api Access Exception "),
	ID_VALIDATION_FAILED("PKTGNR - 002","Id Object validation failed "),
	WRITE_FILE_TO_ZIPFAILED("PKTGNR - 003","Exception occured while creating packet "),
	ENCRYPTION_EXCEPTION("PKTGNR - 003","Exception occured while encrypting the packet "),
	INVALID_REQUEST("PKTGNR - 004","InvalidRequest - "),
	SYNC_FAILED("PKTGNR - 005","Sync Failed"),
	FAILED_TO_UPLOAD("PKTGNR - 006","Failed to upload file"),
	SYSTEM_EXCEPTION_OCCURED("PKTGNR - 005","System exception occured "),
	RUNTIME_EXCEPTION("PKTGNR - 005","System exception occured ");
	public String errorCode;
	public String errorMessage;

	private ErrorMessages(String errorCode, String errorMessage) {
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

}
