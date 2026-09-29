package io.mosip.preregistration.booking.dto;

import java.time.LocalTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * A bookable time window and remaining capacity.
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class SlotDto {

	/** Slot start (inclusive). */
	private LocalTime fromTime;

	/** Slot end (exclusive or inclusive per MOSIP config). */
	private LocalTime toTime;

	/** Remaining appointments that can still be booked in this slot. */
	private int availability;
}
