package io.mosip.preregistration.booking.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Availability calendar for one registration centre.
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class AvailabilityDto {

	/** Registration centre id. */
	private String regCenterId;

	/** Per-day slots (including holidays). */
	private List<DateTimeDto> centerDetails;
}
