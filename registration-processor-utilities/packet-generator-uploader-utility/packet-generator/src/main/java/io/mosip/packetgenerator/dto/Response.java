package io.mosip.packetgenerator.dto;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import io.mosip.registration.processor.core.common.rest.dto.ErrorDTO;
import lombok.Data;

@Data
public class Response {
	private String id = "io.mosip.packetgenerator.uploader";
	private String version = "v1";
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
	private LocalDateTime responsetime = LocalDateTime.now(ZoneId.of("UTC"));
	private Object metadata;
	private List<ErrorDTO> errors = new ArrayList<>();
	private PacketResponseDto response;
}
