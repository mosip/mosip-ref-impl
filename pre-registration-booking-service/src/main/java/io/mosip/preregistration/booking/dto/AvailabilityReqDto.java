package io.mosip.preregistration.booking.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Request body used to fetch availability for one centre.
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class AvailabilityReqDto {
	/** Registration centre whose slots are requested. */
	private String registrationCenterId;
}
