package io.mosip.packetgenerator.dto;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.ZoneId;

import javax.validation.Valid;

import com.fasterxml.jackson.annotation.JsonFormat;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
public class Request implements Serializable {

	private static final long serialVersionUID = 4373201325809902206L;
	@ApiModelProperty(notes = "id", example = "io.mosip.packetgenerator.uploader", required = true)
	private String id = "io.mosip.packetgenerator.uploader";
	@ApiModelProperty(notes = "id", example = "v1", required = true)
	private String version = "v1";
	@ApiModelProperty(notes = "Timestamp as metadata", example = "2020-02-11T14:07:03.134Z", required = true)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
	private String requesttime = String.valueOf(LocalDateTime.now(ZoneId.of("UTC")));
	@Valid
	private PacketRequestDto request;

}