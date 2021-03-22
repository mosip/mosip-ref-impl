package io.mosip.biosdk.services.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ErrorDto {
    private String code;
    private String message;

    public ErrorDto(String code, String message){
        this.code = code;
        this.message = message;
    }
}
