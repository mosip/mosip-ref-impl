package io.mosip.packetgenerator.dto;

import lombok.Data;
/**
 * 
 * @author Girish Yarru
 *
 */
@Data
public class PacketDetails {
	private String registartionId;
	private byte[] packetBytes;

}
