package io.mosip.kernel.idobjectvalidator.constant;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * The Enum IdObjectReferenceValidatorLocationMapping.
 *
 * @author Manoj SP
 */
public enum IdObjectReferenceValidatorLocationMapping {
	
	/** Country hierarchy level. */
	COUNTRY("Country", "0"),

	/** Region hierarchy level. */
	REGION("Region", "1"),

	/** Province hierarchy level. */
	PROVINCE("Province", "2"),

	/** City hierarchy level. */
	CITY("City", "3"),

	/** Zone hierarchy level. */
	ZONE("Zone", "4"),

	/** Postal-code hierarchy level. */
	POSTAL_CODE("Postal Code", "5");


	/** Location hierarchy display name. */
	private final String hierarchyName;

	/** Numeric hierarchy level as used in masterdata. */
	private final String level;
	
	/**
	 * Instantiates a new id object reference validator location mapping.
	 *
	 * @param hierarchyName the hierarchy name
	 * @param level the level
	 */
	IdObjectReferenceValidatorLocationMapping(String hierarchyName, String level) {
		this.hierarchyName = hierarchyName;
		this.level = level;
	}

	/**
	 * Gets the hierarchy name.
	 *
	 * @return the hierarchy name
	 */
	public String getHierarchyName() {
		return hierarchyName;
	}

	/**
	 * Gets the level.
	 *
	 * @return the level
	 */
	public String getLevel() {
		return level;
	}
	
	/**
	 * Gets the all mapping.
	 *
	 * @return the all mapping
	 */
	public static Map<String, String> getAllMapping() {
		return Arrays.stream(values()).parallel()
				.collect(Collectors.toMap(IdObjectReferenceValidatorLocationMapping::getLevel,
						IdObjectReferenceValidatorLocationMapping::getHierarchyName));
	}
}
