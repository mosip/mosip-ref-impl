package io.mosip.preregistration.booking.config;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.Arrays;
import java.util.List;

import org.junit.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import io.mosip.kernel.dataaccess.hibernate.repository.impl.HibernateRepositoryImpl;
import io.mosip.preregistration.booking.BookingApplication;

/**
 * Same pattern as kernel-notification-service {@code NotificationBootApplication}:
 * allow-list {@code scanBasePackages} instead of {@code io.mosip.*}, and
 * {@code excludeName} for kernel-core sidecar auto-configs. DataSource/JPA stay
 * enabled because booking persists slots.
 */
public class BookingApplicationComponentScanTest {

	@Test
	public void scanBasePackagesIsAllowListNotIoMosipStar() {
		List<String> packages = Arrays.asList(
				BookingApplication.class.getAnnotation(SpringBootApplication.class).scanBasePackages());
		assertFalse(packages.contains("io.mosip.*"));
		assertTrue(packages.contains("io.mosip.preregistration.booking.*"));
		assertTrue(packages.contains("io.mosip.preregistration.core.*"));
		assertTrue(packages.contains("${mosip.auth.adapter.impl.basepackage}"));
		assertTrue(packages.contains("io.mosip.kernel.core.logger.config"));
		assertTrue(packages.contains("io.mosip.kernel.idobjectvalidator.*"));
	}

	@Test
	public void jpaScanIncludesBookingAndCoreRepositoriesAndEntities() {
		List<String> repositories = Arrays.asList(
				BookingApplication.class.getAnnotation(EnableJpaRepositories.class).basePackages());
		assertTrue(repositories.contains("io.mosip.preregistration.booking.repository"));
		assertTrue(repositories.contains("io.mosip.preregistration.core.common.repository"));
		assertEquals(HibernateRepositoryImpl.class,
				BookingApplication.class.getAnnotation(EnableJpaRepositories.class).repositoryBaseClass());

		List<String> entities = Arrays.asList(
				BookingApplication.class.getAnnotation(EntityScan.class).basePackages());
		assertTrue(entities.contains("io.mosip.preregistration.booking.entity"));
		assertTrue(entities.contains("io.mosip.preregistration.core.common.entity"));
	}

	@Test
	public void autoConfigurationExcludesKernelCoreSidecarsNotDataSource() {
		List<String> names = Arrays.asList(
				BookingApplication.class.getAnnotation(EnableAutoConfiguration.class).excludeName());
		assertTrue(names.contains("io.mosip.kernel.idgenerator.vid.impl.VidGeneratorImpl"));
		assertTrue(names.contains("io.mosip.kernel.websub.api.config.WebSubClientConfig"));
		assertFalse(names.contains("org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration"));
		assertFalse(names.contains("org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration"));
	}
}
