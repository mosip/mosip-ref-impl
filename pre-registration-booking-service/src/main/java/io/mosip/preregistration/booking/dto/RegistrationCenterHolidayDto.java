package io.mosip.preregistration.booking.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Masterdata payload: one centre plus its holidays.
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class RegistrationCenterHolidayDto {
	/** Centre metadata used to generate slots. */
	private RegistrationCenterDto registrationCenter;
	/** Holidays for that centre. */
	private List<HolidayDto> holidays;
}
