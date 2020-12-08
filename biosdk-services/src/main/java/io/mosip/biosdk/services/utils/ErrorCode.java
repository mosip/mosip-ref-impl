package io.mosip.biosdk.services.utils;

public enum ErrorCode {

    NO_PROVIDERS("BIO_SDK_001", "No Bio SDK service provider implementations found for given version");

    private String errorCode;
    private String errorMessage;

    ErrorCode(String errorCode, String errorMessage) {
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public String getErrorCode() {
        return errorCode;
    }
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    public String getErrorMessage() {
        return errorMessage;
    }
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

}
