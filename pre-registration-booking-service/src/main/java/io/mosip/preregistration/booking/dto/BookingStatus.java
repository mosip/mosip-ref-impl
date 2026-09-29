package io.mosip.preregistration.booking.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

/**
 * Multi-appointment response: one status per requested pre-id.
 */
@Getter
@Setter
public class BookingStatus {

	/** Per-pre-id booking outcomes. */
	List<BookingStatusDTO> bookingStatusResponse;
}
