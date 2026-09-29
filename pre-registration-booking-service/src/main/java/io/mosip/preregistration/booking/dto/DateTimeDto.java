package io.mosip.preregistration.booking.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * One calendar day of slot availability for a centre.
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class DateTimeDto {

	/** Calendar date (ISO local date string). */
	private String date;

	/** {@code true} when the centre is closed for a holiday. */
	private boolean isHoliday;

	/** Bookable slots on {@link #date}. */
	private List<SlotDto> timeSlots;
}
