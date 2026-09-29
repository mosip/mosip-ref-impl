package io.mosip.kernel.smsserviceprovider.msg91.dto;

import lombok.Data;

/**
 * Payload sent to the MSG91 vendor (from / to / text).
 */
@Data
public class SmsVendorRequestDto {
	/** Sender identity. */
	private String from;
	/** Destination MSISDN. */
	private String to;
	/** Message body. */
	private String text;
}
