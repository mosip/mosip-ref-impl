package io.mosip.preregistration.booking.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Single booking outcome message.
 */
@Getter
@Setter
public class BookingStatusDTO {

	/** Human-readable booking result. */
	private String bookingMessage;
}
