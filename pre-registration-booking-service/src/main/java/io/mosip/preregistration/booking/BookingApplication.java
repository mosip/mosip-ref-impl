/* 
 * Copyright
 * 
 */
package io.mosip.preregistration.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

import io.mosip.preregistration.booking.config.BookingConfig;

/**
 * Starts the Pre-registration booking REST service (Spring Boot 4.1.1).
 * <p>
 * Component scan is {@code io.mosip.*} with kernel crypto/keymanager packages excluded.
 * Swagger UI Authorize is wired in {@link BookingConfig}.
 * </p>
 * 
 * @author Kishan Rathore
 * @author Jagadishwari
 * @author Ravi C. Balaji
 * @since 1.0.0
 *
 */
@SpringBootApplication
@ComponentScan(basePackages = "io.mosip.*", excludeFilters = {
		@ComponentScan.Filter(type = FilterType.REGEX,
				pattern = {"io\\.mosip\\.kernel\\.zkcryptoservice\\..*",
						"io\\.mosip\\.kernel\\.tokenidgenerator\\..*",
						"io\\.mosip\\.kernel\\.signature\\..*",
						"io\\.mosip\\.kernel\\.partnercertservice\\..*",
						"io\\.mosip\\.kernel\\.lkeymanager\\..*",
						"io\\.mosip\\.kernel\\.keymanagerservice\\..*",
						"io\\.mosip\\.kernel\\.keymanager\\..*",
						"io\\.mosip\\.kernel\\.keygenerator\\..*",
						"io\\.mosip\\.kernel\\.cryptomanager\\..*",
						"io\\.mosip\\.kernel\\.crypto\\..*",
						"io\\.mosip\\.kernel\\.clientcrypto\\..*",
				}) })
@EnableConfigurationProperties(BookingConfig.class)
public class BookingApplication {
	/**
	 * Method to start the Booking API service.
	 *
	 * @param args Spring Boot arguments
	 */
	public static void main(String[] args) {
		SpringApplication.run(BookingApplication.class, args);
	}
}
