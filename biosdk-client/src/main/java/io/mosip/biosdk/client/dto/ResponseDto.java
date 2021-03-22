package io.mosip.biosdk.client.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ResponseDto<T> {
    private String version;
    private String responsetime;
    private T response;
    private List<ErrorDto> errors;
}
