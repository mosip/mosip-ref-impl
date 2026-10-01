# pre-registration-booking-service

`BookingController` `/appointment/**`. Adapters in JAR. JVM = Helm `javaOpts`. Pins in `pom.xml`. CI waits for kernel publish.

```
pre-registration-booking-service/
├── pom.xml  Dockerfile  README.md  AGENTS.md  run-local.bat  run-local.sh
└── src/
    ├── main/java/io/mosip/preregistration/booking/
    │   ├── BookingApplication.java
    │   ├── controller/BookingController.java
    │   ├── service/BookingService.java  BookingServiceIntf.java
    │   ├── service/util/BookingServiceUtil.java  BookingLock.java
    │   ├── config/BookingConfig.java  OpenApiProperties.java
    │   ├── repository/BookingAvailabilityRepository.java  DemographicRepository.java  RegistrationBookingRepository.java
    │   ├── repository/impl/BookingDAO.java
    │   ├── entity/AvailabilityPK.java  AvailibityEntity.java
    │   ├── codes/RequestCodes.java
    │   ├── errorcodes/ErrorCodes.java  ErrorMessages.java
    │   ├── dto/
    │   └── exception/  util/BookingExceptionCatcher.java  BookingExceptionHandler.java
    ├── main/resources/  bootstrap.properties  application-local.properties  logback.xml
    └── test/
        ├── java/.../booking/config/BookingApplicationComponentScanTest.java  BookingConfigOpenApiTest.java
        ├── java/.../booking/test/BookingApplicationTest.java
        ├── java/.../test/config/TestConfig.java  TestSecurityConfig.java
        ├── java/.../test/controller/BookingControllerTest.java
        ├── java/.../test/service/BookingServiceTest.java  BookingServiceCoverageTest.java  BookingServiceIdentityMigrationTest.java
        ├── java/.../test/service/util/BookingServiceUtilTest.java
        └── resources/  application.properties  bootstrap.properties  booking.json  cancelAppointment.json  multibooking.json  create-schema.sql
```
