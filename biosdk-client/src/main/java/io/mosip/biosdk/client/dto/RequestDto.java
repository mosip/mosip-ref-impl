package io.mosip.biosdk.client.dto;

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
    private boolean encryption = false;
    private String hmac;
    private String sessionKey;
    private String request;
}
