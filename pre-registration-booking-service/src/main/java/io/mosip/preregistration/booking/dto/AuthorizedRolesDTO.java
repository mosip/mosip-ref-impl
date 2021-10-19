package io.mosip.preregistration.booking.dto;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;


@Component("authorizedRoles")
@ConfigurationProperties(prefix = "mosip.role.preregistration.booking")
@Getter
@Setter
public class AuthorizedRolesDTO {

    ##Booking controller
    private List<String> getappointmentavailability;
    
    private List<String> postappointmentpreregistrationid;

    private List<String> postappointment;
	
	private List<String> getappointmentpreregistrationid;
	
	private List<String> putappointmentpreregistrationid;
	
    private List<String> putbatchappointmentpreregistrationid;	
	
	private List<String> deleteappointment;
		  
    private List<String> getappointmentpreregistrationidregistrationcenterid;
		  
    private List<String> getappointmentregistrationcenterid;
	
}
}