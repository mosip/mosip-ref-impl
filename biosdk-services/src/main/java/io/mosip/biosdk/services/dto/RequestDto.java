package io.mosip.biosdk.services.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class RequestDto {
    private String version;
    private String biosdkSpecVersion;
    private String request;
    private Boolean encryption;
    private String hmac;
    private String sessionKey;
}
