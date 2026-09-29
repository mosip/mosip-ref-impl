# pre-registration-booking-service

Boot REST `BookingApplication` → `BookingController` `/appointment/**`. Roles via `@authorizedRoles` bean. Adapters in JAR (no wget). JVM from Helm `javaOpts`. Pins in `pom.xml`.

```
pre-registration-booking-service/
├── pom.xml  Dockerfile  README.md  AGENTS.md
└── src/
    ├── main/
    │   ├── java/io/mosip/preregistration/booking/
    │   │   ├── BookingApplication.java
    │   │   ├── controller/BookingController.java
    │   │   ├── service/BookingService.java  BookingServiceIntf.java
    │   │   ├── service/util/BookingServiceUtil.java  BookingLock.java
    │   │   ├── config/BookingConfig.java  OpenApiProperties.java
    │   │   ├── repository/BookingAvailabilityRepository.java  DemographicRepository.java  RegistrationBookingRepository.java
    │   │   ├── repository/impl/BookingDAO.java
    │   │   ├── entity/AvailabilityPK.java  AvailibityEntity.java
    │   │   ├── codes/RequestCodes.java
    │   │   ├── errorcodes/ErrorCodes.java  ErrorMessages.java
    │   │   ├── dto/
    │   │   └── exception/  util/BookingExceptionCatcher.java  BookingExceptionHandler.java
    │   └── resources/  bootstrap.properties  logback.xml
    └── test/
        ├── java/io/mosip/preregistration/booking/
        │   ├── config/BookingConfigOpenApiTest.java
        │   └── test/
        │       ├── BookingApplicationTest.java
        │       ├── config/TestConfig.java  TestSecurityConfig.java
        │       ├── controller/BookingControllerTest.java
        │       └── service/BookingServiceTest.java  BookingServiceCoverageTest.java  BookingServiceIdentityMigrationTest.java
        │           └── util/BookingServiceUtilTest.java
        └── resources/  application.properties  bootstrap.properties  booking.json  cancelAppointment.json  multibooking.json  create-schema.sql
```
