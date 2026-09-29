package io.mosip.preregistration.booking.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Holiday row returned with registration-centre masterdata.
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class HolidayDto {
	/** Holiday identifier. */
	private String holidayId;
	/** Calendar date of the holiday. */
	private String holidayDate;
	/**
	 * Holiday day is day of week as integer value, week start from Monday , Monday is 1 and Sunday is 7
	 */
	private String holidayDay;
	/**
	 * Holiday month is month of the year as integer value.
	 */
	private String holidayMonth;
	/** Four-digit year. */
	private String holidayYear;
	/** Display name of the holiday. */
	private String holidayName;
	/** Language of {@link #holidayName}. */
	private String languageCode;
	/** Whether the holiday is currently active. */
	private Boolean isActive;
}
