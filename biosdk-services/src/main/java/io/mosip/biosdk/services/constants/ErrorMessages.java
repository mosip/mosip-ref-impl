package io.mosip.biosdk.services.constants;

public enum ErrorMessages {
    NO_BIOSDK_PROVIDER_FOUND("No BioSDK provider found with the given version"),
    BIOSDK_LIB_EXCEPTION("Exception thrown by BioSDK library"),
    INVALID_REQUEST_BODY("Unable to parse request body"),
    UNCHECKED_EXCEPTION("UNCHECKED_EXCEPTION");

    private ErrorMessages(String message) {
        this.message = message;
    }

    private final String message;

    /**
     * @return message
     */
    public String getMessage() {
        return message;
    }
}
