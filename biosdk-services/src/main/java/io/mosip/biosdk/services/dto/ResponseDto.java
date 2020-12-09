package io.mosip.biosdk.services.dto;

import io.swagger.annotations.ApiModelProperty;
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
    /**
     * version
     */
    @ApiModelProperty(value = "request version", position = 2)
    private String version;

    @ApiModelProperty(value = "Response Time", position = 3)
    private String responsetime;

    @ApiModelProperty(value = "Response", position = 4)
    private T response;

    /** The error details. */
    @ApiModelProperty(value = "Error Details", position = 5)
    private List<ErrorDto> errors;
}
