package io.mosip.registrationprocessor.eis.entity;

import java.io.Serializable;

import lombok.Data;

/**
 * Common MOSIP REST envelope fields shared by EIS request payloads.
 */
@Data
public class BaseRestRequestDTO implements Serializable {

	/** Serialization version. */
	private static final long serialVersionUID = 4373201325809902206L;

	/** MOSIP request id. */
	private String id;

	/** API version (for example {@code 1.0}). */
	private String version;

	/** Request timestamp (ISO string as sent by the stage). */
	private String requesttime;

}
