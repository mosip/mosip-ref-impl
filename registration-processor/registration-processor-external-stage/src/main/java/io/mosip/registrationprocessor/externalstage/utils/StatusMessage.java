package io.mosip.registrationprocessor.externalstage.utils;

/**
 * Human-readable status strings written after EIS success or failure.
 */
public final class StatusMessage {

	/** Utility class; do not instantiate. */
	private StatusMessage() {

	}

	/** Human-readable text after a failed EIS call. */
	public static final String EXTERNAL_STAGE_FAILURE = "external stage failure";

	/** Human-readable text after a successful EIS call. */
	public static final String EXTERNAL_STAGE_SUCCESS = "external stage success";

}
