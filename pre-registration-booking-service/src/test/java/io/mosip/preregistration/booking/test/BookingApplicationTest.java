package io.mosip.preregistration.booking.test;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(
		scanBasePackages = { "io.mosip.preregistration.core.*", "io.mosip.preregistration.booking.*" },
		excludeName = {
				"org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration",
				"org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration"
		})
public class BookingApplicationTest {

	/**
	 * Main method for Booking Application.
	 * 
	 * @param args
	 *            the arguments.
	 */
	public static void main(String[] args) {
		SpringApplication.run(BookingApplicationTest.class, args);
	}
}
