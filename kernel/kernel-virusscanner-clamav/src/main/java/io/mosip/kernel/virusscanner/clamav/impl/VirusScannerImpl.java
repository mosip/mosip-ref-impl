package io.mosip.kernel.virusscanner.clamav.impl;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.mosip.kernel.core.virusscanner.exception.VirusScannerException;
import io.mosip.kernel.core.virusscanner.spi.VirusScanner;
import io.mosip.kernel.virusscanner.clamav.constant.VirusScannerErrorCodes;
import xyz.capybara.clamav.ClamavClient;
import xyz.capybara.clamav.ClamavException;
import xyz.capybara.clamav.commands.scan.result.ScanResult;

/**
 * ClamAV implementation of {@link VirusScanner}{@code <Boolean, InputStream>}.
 * <p>
 * Connects lazily to {@code mosip.kernel.virus-scanner.host} /
 * {@code mosip.kernel.virus-scanner.port}. A scan returns {@link Boolean#TRUE}
 * when {@link ScanResult.OK} is received, otherwise {@link Boolean#FALSE} and a
 * warning is logged. Unreachable daemon or missing files become
 * {@link VirusScannerException}.
 * </p>
 *
 * @author Mukul Puspam
 * @author Pranav Kumar
 */
@Component
public class VirusScannerImpl implements VirusScanner<Boolean, InputStream> {

	/** Logger for scan warnings and ClamAV failures. */
	private static final Logger LOGGER = LoggerFactory.getLogger(VirusScannerImpl.class);

	/** ClamAV daemon hostname ({@code mosip.kernel.virus-scanner.host}). */
	@Value("${mosip.kernel.virus-scanner.host}")
	private String host;

	/** ClamAV daemon port ({@code mosip.kernel.virus-scanner.port}). */
	@Value("${mosip.kernel.virus-scanner.port}")
	private int port;

	/** Lazily created ClamAV client; tests may assign a mock. */
	protected ClamavClient clamavClient;

	/** SLF4J pattern {@code "{} - {}"} for exception messages. */
	private static final String LOGDISPLAY = "{} - {}";

	/** User-facing text when the daemon cannot be reached. */
	private static final String ANTIVIRUS_SERVICE_NOT_ACCESSIBLE = "The anti virus service is not accessible";

	/** User-facing text when the scan path does not exist. */
	private static final String FILE_NOT_PRESENT = "The file not found for for scanning";

	/**
	 * Creates {@link #clamavClient} if it is still {@code null}.
	 */
	public void createConnection() {
		if (this.clamavClient == null)
			this.clamavClient = new ClamavClient(host, port);
	}

	/**
	 * Scans a file on disk by path.
	 *
	 * @param fileName absolute or relative path
	 * @return {@code true} if ClamAV reports OK
	 */
	@Override
	public Boolean scanFile(String fileName) {
		Boolean result = Boolean.FALSE;
		createConnection();
		File file = new File(fileName);
		InputStream is = null;
		try {
			is = new FileInputStream(file);
		} catch (FileNotFoundException e1) {
			throw new VirusScannerException(VirusScannerErrorCodes.IIS_EPP_EPV_FILE_NOT_PRESENT, FILE_NOT_PRESENT, e1);
		}
		try {
			ScanResult scanResult = this.clamavClient.scan(is);
			if (scanResult instanceof ScanResult.OK) {
				result = Boolean.TRUE;
			} else {
				Map<String, Collection<String>> listOfVirus = foundViruses(scanResult);
				LOGGER.warn("Virus Found in file " + fileName + ": ", listOfVirus);
			}
		} catch (ClamavException e) {
			throw new VirusScannerException(VirusScannerErrorCodes.IIS_EPP_EPV_SERVICE_NOT_ACCESSIBLE,
					ANTIVIRUS_SERVICE_NOT_ACCESSIBLE, e);
		}

		return result;
	}

	/**
	 * Scans an already opened stream (caller owns the stream).
	 *
	 * @param is document bytes
	 * @return {@code true} if ClamAV reports OK
	 */
	@Override
	public Boolean scanFile(InputStream is) {
		Boolean result = Boolean.FALSE;
		createConnection();
		try {
			ScanResult scanResult = this.clamavClient.scan(is);
			if (scanResult instanceof ScanResult.OK) {
				result = Boolean.TRUE;
			} else {
				Map<String, Collection<String>> listOfVirus = foundViruses(scanResult);
				LOGGER.warn("Virus Found in file : " + listOfVirus);
			}
		} catch (ClamavException e) {
			throw new VirusScannerException(VirusScannerErrorCodes.IIS_EPP_EPV_SERVICE_NOT_ACCESSIBLE,
					ANTIVIRUS_SERVICE_NOT_ACCESSIBLE, e);
		}
		return result;
	}

	/**
	 * Scans every file in a directory (non-recursive {@link File#listFiles()}).
	 *
	 * @param folderPath directory path
	 * @return {@code true} if every file is OK; {@code false} on first infection
	 */
	@Override
	public Boolean scanFolder(String folderPath) {

		Boolean result = Boolean.TRUE;
		createConnection();
		File folder = new File(folderPath);
		File[] files = folder.listFiles();
		for (File file : files) {
			try {
				ScanResult scanResult = this.clamavClient.scan(new FileInputStream(file));
				if (!(scanResult instanceof ScanResult.OK)) {
					result = Boolean.FALSE;
					break;
				}
			} catch (FileNotFoundException e) {
				throw new VirusScannerException(VirusScannerErrorCodes.IIS_EPP_EPV_FILE_NOT_PRESENT, FILE_NOT_PRESENT,
						e);
			} catch (ClamavException e) {
				throw new VirusScannerException(VirusScannerErrorCodes.IIS_EPP_EPV_SERVICE_NOT_ACCESSIBLE,
						ANTIVIRUS_SERVICE_NOT_ACCESSIBLE, e);
			}
		}
		return result;
	}

	/**
	 * Scans an in-memory document.
	 *
	 * @param docArray raw bytes
	 * @return {@code true} if virus-free
	 * @throws IOException if the byte stream cannot be closed
	 */
	@Override
	public Boolean scanDocument(byte[] docArray) throws IOException {
		Boolean result = Boolean.FALSE;
		InputStream docInputStream = new ByteArrayInputStream(docArray);

		createConnection();
		try {

			ScanResult scanResult = this.clamavClient.scan(docInputStream);
			if (scanResult instanceof ScanResult.OK) {
				result = Boolean.TRUE;
			} else {
				Map<String, Collection<String>> listOfVirus = foundViruses(scanResult);
				LOGGER.warn("Virus Found in file " + docInputStream + ": ", listOfVirus);
			}
		} catch (ClamavException e) {
			LOGGER.error(LOGDISPLAY, e.getMessage());
			throw new VirusScannerException(VirusScannerErrorCodes.IIS_EPP_EPV_SERVICE_NOT_ACCESSIBLE,
					ANTIVIRUS_SERVICE_NOT_ACCESSIBLE, e);
		} finally {

			docInputStream.close();
		}

		return result;
	}

	/**
	 * Scans a {@link File} using a try-with-resources {@link FileInputStream}.
	 *
	 * @param doc file on disk
	 * @return {@code true} if virus-free
	 * @throws IOException if the file cannot be read
	 */
	@Override
	public Boolean scanDocument(File doc) throws IOException {
		Boolean result = Boolean.FALSE;

		createConnection();
		try (FileInputStream docInputStream = new FileInputStream(doc)) {

			ScanResult scanResult = this.clamavClient.scan(docInputStream);
			if (scanResult instanceof ScanResult.OK) {
				result = Boolean.TRUE;
			} else {
				Map<String, Collection<String>> listOfVirus = foundViruses(scanResult);
				LOGGER.warn("Virus Found in file " + doc + ": ", listOfVirus);
			}
		} catch (ClamavException e) {
			LOGGER.error(LOGDISPLAY, e.getMessage());
			throw new VirusScannerException(VirusScannerErrorCodes.IIS_EPP_EPV_SERVICE_NOT_ACCESSIBLE,
					ANTIVIRUS_SERVICE_NOT_ACCESSIBLE, e);
		}

		return result;
	}

	/**
	 * Extracts the virus map from a {@link ScanResult.VirusFound} result.
	 *
	 * @param scanResult ClamAV scan outcome
	 * @return found signatures, or an empty map if the result is not VirusFound
	 */
	private static Map<String, Collection<String>> foundViruses(ScanResult scanResult) {
		if (scanResult instanceof ScanResult.VirusFound found) {
			return found.getFoundViruses();
		}
		return Map.of();
	}

}
