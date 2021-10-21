package io.mosip.biosdk.services.dto;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;


@Component("authorizedRoles")
@ConfigurationProperties(prefix = "mosip.role.biosdk")
@Getter
@Setter
public class AuthorizedRolesDTO {

    ##Booking controller
    private List<String> getservicestatus;
    
}
}