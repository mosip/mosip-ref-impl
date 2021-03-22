package io.mosip.biosdk.services.constants;

public enum ResponseStatus {

	SUCCESS(200, "OK"),
	INVALID_INPUT(401, "Invalid Input Parameter - %s"),
	MISSING_INPUT(402, "Missing Input Parameter - %s"),
	QUALITY_CHECK_FAILED(403, "Quality check of Biometric data failed"),
	POOR_DATA_QUALITY(406, "Data provided is of poor quality"),
	UNKNOWN_ERROR(500, "UNKNOWN_ERROR");
	
	ResponseStatus(int statusCode, String statusMessage) {
		this.setStatusCode(statusCode);
		this.setStatusMessage(statusMessage);
	}
	
	private int statusCode;
	private String statusMessage;
	
	public int getStatusCode() {
		return statusCode;
	}
	public void setStatusCode(int statusCode) {
		this.statusCode = statusCode;
	}

	public String getStatusMessage() {
		return statusMessage;
	}

	public void setStatusMessage(String statusMessage) {
		this.statusMessage = statusMessage;
	}

	
}
