package io.mosip.packetgenerator.dto;

import lombok.Data;

@Data
public class PacketDetails {
	private String registartionId;
	private byte[] packetBytes;

}
