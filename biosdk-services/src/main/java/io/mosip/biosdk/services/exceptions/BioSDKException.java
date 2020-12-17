package io.mosip.biosdk.services.exceptions;

import io.mosip.kernel.core.exception.BaseUncheckedException;

public class BioSDKException extends BaseUncheckedException {
    /**
     * Serializable Version Id
     */
    private static final long serialVersionUID = 276197701640260133L;

    /**
     * Constructs a new unchecked exception
     */
    public BioSDKException() {
        super();
    }

    /**
     * Constructor
     *
     * @param errorCode
     *            the Error Code Corresponds to Particular Exception
     * @param errorMessage
     *            the Message providing the specific context of the error
     */
    public BioSDKException(String errorCode, String errorMessage) {
        super(errorCode, errorMessage);
    }

    /**
     * Constructor
     *
     * @param errorCode
     *            the Error Code Corresponds to Particular Exception
     * @param errorMessage
     *            the Message providing the specific context of the error
     * @param throwable
     *            the Cause of exception
     */
    public BioSDKException(String errorCode, String errorMessage, Throwable throwable) {
        super(errorCode, errorMessage, throwable);
    }
}
