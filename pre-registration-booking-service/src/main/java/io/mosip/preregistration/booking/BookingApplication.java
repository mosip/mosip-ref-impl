/* 
 * Copyright
 * 
 */
package io.mosip.preregistration.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import io.mosip.kernel.dataaccess.hibernate.repository.impl.HibernateRepositoryImpl;
import io.mosip.preregistration.booking.config.BookingConfig;

/**
 * Starts the Pre-registration booking REST service (Spring Boot 4.1.1).
 * <p>
 * Component scan is an allow-list (same pattern as kernel-notification-service
 * {@code NotificationBootApplication}): booking, pre-registration-core, auth
 * adapter, logger config, and the packaged idobjectvalidator SPI. Do not scan
 * {@code io.mosip.*} — kernel-core {@code DataMapperImpl} is a {@code @Component}
 * whose {@code Class} constructor Boot 4 cannot autowire. Kernel-core sidecar
 * auto-configs are excluded by name; DataSource/JPA stay enabled. Swagger UI
 * Authorize is wired in {@link BookingConfig}.
 * {@code scanBasePackages} does not register Spring Data repositories or JPA
 * entities outside this application's package. BookingServiceUtil autowires
 * core {@code UserDetailsService}, which needs {@code UserDetailsRepository}
 * from pre-registration-core; {@link EnableJpaRepositories} and
 * {@link EntityScan} cover booking plus {@code io.mosip.preregistration.core.common}.
 * Kernel {@code BaseRepository.update} is implemented by
 * {@link HibernateRepositoryImpl}; Boot's default factory cannot parse that method.
 * </p>
 * 
 * @author Kishan Rathore
 * @author Jagadishwari
 * @author Ravi C. Balaji
 * @since 1.0.0
 *
 */
@SpringBootApplication(scanBasePackages = {
		"io.mosip.preregistration.booking.*",
		"io.mosip.preregistration.core.*",
		"${mosip.auth.adapter.impl.basepackage}",
		"io.mosip.kernel.core.logger.config",
		"io.mosip.kernel.idobjectvalidator.*"
})
@EnableJpaRepositories(basePackages = {
		"io.mosip.preregistration.booking.repository",
		"io.mosip.preregistration.core.common.repository"
}, repositoryBaseClass = HibernateRepositoryImpl.class)
@EntityScan(basePackages = {
		"io.mosip.preregistration.booking.entity",
		"io.mosip.preregistration.core.common.entity"
})
@EnableAutoConfiguration(excludeName = {
		"io.mosip.kernel.idgenerator.vid.impl.VidGeneratorImpl",
		"io.mosip.kernel.idgenerator.vid.util.VidFilterUtils",
		"io.mosip.kernel.idgenerator.tokenid.impl.TokenIdGeneratorImpl",
		"io.mosip.kernel.idgenerator.machineid.impl.MachineIdGeneratorImpl",
		"io.mosip.kernel.idgenerator.regcenterid.impl.RegistrationCenterIdGeneratorImpl",
		"io.mosip.kernel.idgenerator.mispid.impl.MispIdGeneratorImpl",
		"io.mosip.kernel.licensekeygenerator.misp.impl.MISPLicenseKeyGeneratorImpl",
		"io.mosip.kernel.licensekeygenerator.misp.util.MISPLicenseKeyGeneratorUtil",
		"io.mosip.kernel.idgenerator.rid.impl.RidGeneratorImpl",
		"io.mosip.kernel.idvalidator.prid.impl.PridValidatorImpl",
		"io.mosip.kernel.idvalidator.rid.impl.RidValidatorImpl",
		"io.mosip.kernel.idvalidator.uin.impl.UinValidatorImpl",
		"io.mosip.kernel.idvalidator.vid.impl.VidValidatorImpl",
		"io.mosip.kernel.idvalidator.mispid.impl.MispIdValidatorImpl",
		"io.mosip.kernel.pdfgenerator.impl.PDFGeneratorImpl",
		"io.mosip.kernel.qrcode.generator.zxing.QrcodeGeneratorImpl",
		"io.mosip.kernel.transliteration.icu4j.impl.TransliterationImpl",
		"io.mosip.kernel.applicanttype.api.impl.ApplicantTypeImpl",
		"io.mosip.kernel.idobjectvalidator.config.IdObjectValidatorConfig",
		"io.mosip.kernel.websub.api.config.IntentVerificationConfig",
		"io.mosip.kernel.websub.api.config.WebSubClientConfig",
		"io.mosip.kernel.websub.api.config.publisher.WebSubPublisherClientConfig",
		"io.mosip.kernel.websub.api.config.publisher.RestTemplateHelper"
})
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
