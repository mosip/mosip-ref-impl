package io.mosip.preregistration.booking.dto;

import java.time.LocalTime;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Data
@Getter
@Setter
@NoArgsConstructor
@ToString
public class SlotTimeDto {
	
	private LocalTime fromTime;
	
	private LocalTime toTime;
	
	public SlotTimeDto(LocalTime fromTime, LocalTime toTime) {
		this.fromTime = fromTime;
		this.toTime = toTime;
	}

}
