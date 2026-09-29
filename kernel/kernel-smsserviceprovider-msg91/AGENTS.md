# kernel-smsserviceprovider-msg91

`SMSServiceProvider` SPI (MSG91). Auto-config: `META-INF/spring.factories`. Pins in `kernel/pom.xml`.

```
kernel-smsserviceprovider-msg91/
├── pom.xml  README.md  AGENTS.md
└── src/
    ├── main/
    │   ├── java/io/mosip/kernel/smsserviceprovider/msg91/
    │   │   ├── impl/SMSServiceProviderImpl.java
    │   │   ├── exception/ApiExceptionHandler.java
    │   │   ├── dto/SmsVendorRequestDto.java  SmsServerResponseDto.java
    │   │   └── constant/SmsPropertyConstant.java  SmsExceptionConstant.java
    │   └── resources/
    │       ├── META-INF/spring.factories
    │       └── logback.xml
    └── test/
        ├── java/.../msg91/SmsServiceProviderTest.java
        └── resources/application.properties
```
