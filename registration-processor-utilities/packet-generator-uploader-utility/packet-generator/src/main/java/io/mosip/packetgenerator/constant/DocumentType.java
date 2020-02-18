package io.mosip.packetgenerator.constant;
/**
 * 
 * @author Girish Yarru
 *
 */
public enum DocumentType {
	DEMOGRAPHIC("Demographic"),
	BIOMETRIC("Biometric"),
	NONE("None");
	
	public final String docType;

	private DocumentType(String docType) {
		this.docType = docType;
	}

	@Override
	public String toString() {
		return docType;
	}
}
