package io.mosip.kernel.virusscanner.clamav.constant;

/**
 * Internal Packet virus scan error codes.
 *
 */
/**
 * MOSIP error codes for ClamAV connectivity and missing scan files.
 */
public class VirusScannerErrorCodes {
	/** Packet virus-scan prefix. */
	private static final String IIS_EPP_EPV_PREFIX = "IIS_";

	/** Prevents instantiation. */
	private VirusScannerErrorCodes() {
		throw new IllegalStateException("Utility class");
	}

	/** Generic module prefix. */
	private static final String IIS_EPP_EPV_PREFIX_GEN_MODULE = IIS_EPP_EPV_PREFIX + "GEN_";
	/** ClamAV daemon unreachable. */
	public static final String IIS_EPP_EPV_SERVICE_NOT_ACCESSIBLE = IIS_EPP_EPV_PREFIX_GEN_MODULE
			+ "ANTIVIRUS_SERVICE_NOT_ACCESSIBLE";
	/** File path does not exist. */
	public static final String IIS_EPP_EPV_FILE_NOT_PRESENT = IIS_EPP_EPV_PREFIX_GEN_MODULE
			+ "FILE_NOT_PRESENT_FOR_SCAN";
}
