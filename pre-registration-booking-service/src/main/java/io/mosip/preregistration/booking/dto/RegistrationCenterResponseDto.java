package io.mosip.preregistration.booking.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Masterdata list wrapper for registration centres.
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class RegistrationCenterResponseDto {
	/** Centres returned by masterdata. */
	private List<RegistrationCenterDto> registrationCenters;
}
