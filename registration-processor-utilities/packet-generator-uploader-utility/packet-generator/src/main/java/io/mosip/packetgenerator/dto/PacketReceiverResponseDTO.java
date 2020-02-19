package io.mosip.packetgenerator.dto;

import java.io.Serializable;
import java.util.List;

import io.mosip.registration.processor.core.common.rest.dto.BaseRestResponseDTO;
import io.mosip.registration.processor.core.common.rest.dto.ErrorDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Instantiates a new packet receiver response DTO.
 * 
 * @author Girish Yarru
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class PacketReceiverResponseDTO extends BaseRestResponseDTO implements Serializable {

	private static final long serialVersionUID = -6943589722277098292L;

	/** The response. */
	private PacketReceiverSubResponseDTO response;

	/** The errors. */
	private List<ErrorDTO> errors;

}
