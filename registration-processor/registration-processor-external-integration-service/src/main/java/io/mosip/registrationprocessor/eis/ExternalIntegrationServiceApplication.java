package io.mosip.registrationprocessor.eis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;

/**
 * Spring Boot entry point for the External Integration Service (EIS) stub.
 */
@SpringBootApplication
@PropertySource("classpath:bootstrap.properties")
public class ExternalIntegrationServiceApplication {

	/**
	 * Starts the EIS servlet on {@code server.port} / {@code server.servlet.path}.
	 *
	 * @param args command-line arguments passed to Spring Boot
	 */
	public static void main(String[] args) {
		SpringApplication.run(ExternalIntegrationServiceApplication.class, args);
	}

}
