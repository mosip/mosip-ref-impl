package io.mosip.registrationprocessor.externalstage.entity;

import java.io.Serializable;

import lombok.Data;

/**
 * MOSIP REST envelope used when posting to EIS.
 */
@Data
public class BaseRestRequestDTO implements Serializable {

	/** Serialization version. */
	private static final long serialVersionUID = 4373201325809902206L;

	/** MOSIP request id. */
	private String id;

	/** API version. */
	private String version;

	/** Request timestamp. */
	private String requesttime;

}
