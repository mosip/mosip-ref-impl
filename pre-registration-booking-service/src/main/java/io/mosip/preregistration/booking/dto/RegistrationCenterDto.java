package io.mosip.preregistration.booking.dto;

import java.time.LocalTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Registration-centre masterdata used to generate appointment slots.
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class RegistrationCenterDto {

	/** Centre identifier. */
	private String id;

	/** Display name. */
	private String name;

	/** Centre type code from masterdata. */
	private String centerTypeCode;

	/** Address line 1. */
	private String addressLine1;

	/** Address line 2. */
	private String addressLine2;

	/** Address line 3. */
	private String addressLine3;

	/** Latitude. */
	private String latitude;

	/** Longitude. */
	private String longitude;

	/** Location hierarchy code. */
	private String locationCode;

	/** Holiday location code used to load holidays. */
	private String holidayLocationCode;

	/** Contact phone. */
	private String contactPhone;

	/** Number of stations at the centre. */
	private Short numberOfStations;

	/** Working-hours description. */
	private String workingHours;

	/** Language of textual fields. */
	private String langCode;

	/** Number of kiosks. */
	private Short numberOfKiosks;

	/** Processing time per kiosk (slot length). */
	private LocalTime perKioskProcessTime;

	/** Centre opening time. */
	private LocalTime centerStartTime;

	/** Centre closing time. */
	private LocalTime centerEndTime;

	/** IANA or MOSIP time zone id. */
	private String timeZone;

	/** Contact person name. */
	private String contactPerson;

	/** Lunch break start. */
	private LocalTime lunchStartTime;

	/** Lunch break end. */
	private LocalTime lunchEndTime;

	/** Whether the centre is active. */
	private Boolean isActive;
}
