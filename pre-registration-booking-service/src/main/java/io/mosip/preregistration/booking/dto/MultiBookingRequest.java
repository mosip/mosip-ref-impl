package io.mosip.preregistration.booking.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

/**
 * Wrapper for several appointment requests in one API call.
 *
 * @author Kishan Rathore
 * @since 1.0.0
 */
@Getter
@Setter
public class MultiBookingRequest {

	/** Individual booking rows. */
	List<MultiBookingRequestDTO> bookingRequest;
}
