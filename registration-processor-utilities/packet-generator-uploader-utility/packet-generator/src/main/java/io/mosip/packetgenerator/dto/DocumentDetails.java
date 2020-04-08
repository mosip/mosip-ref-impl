package io.mosip.packetgenerator.dto;

import io.mosip.packetgenerator.constant.DocumentType;
import lombok.Data;

@Data
public class DocumentDetails {
	private DocumentType docType;
	private String docExtension;
	private byte[] docValue;
	private String docName;

}
