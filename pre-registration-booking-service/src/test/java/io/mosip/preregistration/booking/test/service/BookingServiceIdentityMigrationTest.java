package io.mosip.preregistration.booking.test.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

import io.mosip.preregistration.application.service.ApplicationIdentityMigrationService;
import io.mosip.preregistration.booking.dto.BookingRequestDTO;
import io.mosip.preregistration.booking.dto.BookingStatusDTO;
import io.mosip.preregistration.booking.entity.AvailibityEntity;
import io.mosip.preregistration.booking.repository.impl.BookingDAO;
import io.mosip.preregistration.booking.service.BookingService;
import io.mosip.preregistration.booking.service.util.BookingServiceUtil;
import io.mosip.preregistration.core.common.entity.RegistrationBookingEntity;

/**
 * Covers the best-effort contract of the canonical-identity backfill invoked
 * from {@link BookingService}.
 *
 * <p>The backfill rewrites legacy raw identifiers to canonical UUIDs and is
 * documented as best-effort: it must never fail the user's request, because the
 * booking's own {@code crBy} is already canonical by the time it runs, and any
 * record it misses is swept up by the nightly identity reconciliation job. The
 * call sites therefore swallow failures. Without that guard the exception
 * reaches {@code BookingExceptionCatcher}, which rethrows, and the whole booking
 * is rolled back - which is exactly what these tests pin down.
 */
@RunWith(MockitoJUnitRunner.Silent.class)
public class BookingServiceIdentityMigrationTest {

	private static final String PRE_REG_ID = "98765432101234";

	private static final String CANONICAL_CR_BY = "3f2a9c14-7b6d-4e18-9c53-1d8ef04a25b7";

	private static final String BOOKING_SUCCESS_MESSAGE = "Appointment booked successfully";

	@Mock
	private BookingDAO bookingDAO;

	@Mock
	private BookingServiceUtil serviceUtil;

	@Mock
	private ApplicationIdentityMigrationService applicationIdentityMigrationService;

	@InjectMocks
	private BookingService bookingService;

	private BookingRequestDTO bookingRequestDTO;

	private AvailibityEntity availabilityEntity;

	private RegistrationBookingEntity bookingEntity;

	@Before
	public void setUp() {
		bookingRequestDTO = new BookingRequestDTO();
		bookingRequestDTO.setRegistrationCenterId("10001");
		bookingRequestDTO.setRegDate("2026-12-10");
		bookingRequestDTO.setSlotFromTime("09:00");
		bookingRequestDTO.setSlotToTime("09:15");

		availabilityEntity = new AvailibityEntity();
		availabilityEntity.setRegcntrId("10001");
		availabilityEntity.setRegDate(LocalDate.parse("2026-12-10"));
		availabilityEntity.setFromTime(LocalTime.parse("09:00"));
		availabilityEntity.setToTime(LocalTime.parse("09:15"));
		availabilityEntity.setAvailableKiosks(5);

		bookingEntity = new RegistrationBookingEntity();
		bookingEntity.setCrBy(CANONICAL_CR_BY);

		Mockito.when(bookingDAO.findFirstByRegDateAndRegcntrIdAndFromTimeAndToTime(any(), anyString(), any(), any()))
				.thenReturn(availabilityEntity);
		Mockito.when(serviceUtil.isKiosksAvailable(any())).thenReturn(true);
		Mockito.when(serviceUtil.bookingEntitySetter(anyString(), any())).thenReturn(bookingEntity);
		Mockito.when(bookingDAO.saveRegistrationEntityForBooking(any())).thenReturn(bookingEntity);
		Mockito.when(bookingDAO.updateAvailibityEntity(any())).thenReturn(availabilityEntity);
	}

	private void givenIdentityMigrationFails() {
		Mockito.doThrow(new RuntimeException("identity migration unavailable"))
				.when(applicationIdentityMigrationService).migrateRawUserToEffectiveUser(anyString(), any());
	}

	/**
	 * A failing backfill must not surface to the applicant as a failed booking.
	 */
	@Test
	public void book_identityMigrationFails_bookingSucceeds() {
		givenIdentityMigrationFails();

		BookingStatusDTO result = bookingService.book(PRE_REG_ID, bookingRequestDTO);

		assertNotNull(result);
		assertEquals(BOOKING_SUCCESS_MESSAGE, result.getBookingMessage());
	}

	/**
	 * The steps after the backfill must still run. Guarding only the exception
	 * without letting the flow continue would leave the slot reserved but never
	 * decremented, so this asserts the side effect rather than just the response.
	 */
	@Test
	public void book_identityMigrationFails_availabilityStillDecremented() {
		givenIdentityMigrationFails();

		bookingService.book(PRE_REG_ID, bookingRequestDTO);

		assertEquals(4, availabilityEntity.getAvailableKiosks());
		Mockito.verify(bookingDAO).updateAvailibityEntity(availabilityEntity);
	}

	/**
	 * Guard must not change the happy path: the backfill is still invoked, and
	 * still with the booking's own canonical creator rather than the caller.
	 */
	@Test
	public void book_identityMigrationSucceeds_migratesWithBookingCreator() {
		BookingStatusDTO result = bookingService.book(PRE_REG_ID, bookingRequestDTO);

		assertEquals(BOOKING_SUCCESS_MESSAGE, result.getBookingMessage());
		Mockito.verify(applicationIdentityMigrationService).migrateRawUserToEffectiveUser(PRE_REG_ID,
				CANONICAL_CR_BY);
	}
}
