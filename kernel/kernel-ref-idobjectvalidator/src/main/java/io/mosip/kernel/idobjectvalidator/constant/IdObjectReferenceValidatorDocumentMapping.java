package io.mosip.kernel.idobjectvalidator.constant;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * The Enum IdObjectReferenceValidatorDocumentMapping.
 *
 * @author Manoj SP
 */
public enum IdObjectReferenceValidatorDocumentMapping {
	
	/** Proof of address document. */
	POA("proofOfAddress", "POA"),

	/** Proof of identity document. */
	POI("proofOfIdentity", "POI"),
	
	/** Proof of relationship document. */
	POR("proofOfRelationship", "POR"),

	/** Proof of exception document. */
	POE("proofOfException", "POE");

	/** Identity JSON attribute name. */
	private final String attributeName;

	/** MOSIP document category code. */
	private final String code;
	
	/**
	 * Instantiates a new id object reference validator document mapping.
	 *
	 * @param attributeName the attribute name
	 * @param code the code
	 */
	IdObjectReferenceValidatorDocumentMapping(String attributeName, String code) {
		this.attributeName = attributeName;
		this.code = code;
	}

	/**
	 * Gets the attribute name.
	 *
	 * @return the attribute name
	 */
	public String getAttributeName() {
		return attributeName;
	}

	/**
	 * Gets the code.
	 *
	 * @return the code
	 */
	public String getCode() {
		return code;
	}
	
	/**
	 * Gets the all mapping.
	 *
	 * @return the all mapping
	 */
	public static Map<String, String> getAllMapping() {
		return Arrays.stream(values()).parallel()
				.collect(Collectors.toMap(IdObjectReferenceValidatorDocumentMapping::getCode,
						IdObjectReferenceValidatorDocumentMapping::getAttributeName));
	}
}
