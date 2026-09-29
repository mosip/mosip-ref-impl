# kernel-smsserviceprovider-msg91

Reference implementation of `io.mosip.kernel.core.notification.spi.SMSServiceProvider` using the MSG91 HTTP API.

- **Artifact**: `io.mosip.kernel:kernel-smsserviceprovider-msg91:1.4.1-SNAPSHOT`
- **Parent**: `kernel-ref-parent` (Boot **4.1.1**, `kernel-core` for logging)
- **SPI**: `SMSServiceProviderImpl` auto-loaded via `META-INF/spring.factories`
- Do not add `kernel-logger-logback`; logging is in `kernel-core`.

## Implementation

Keep the SPI contract. Change `SMSServiceProviderImpl` (or an equivalent impl) for another vendor. Do not change the REST contract of consuming services.

```text
io.mosip.kernel.core.notification.spi.SMSServiceProvider
```

## API docs (Javadoc)

```text
cd kernel
mvn -pl kernel-smsserviceprovider-msg91 javadoc:javadoc
```

## Properties (config server / application environment)

```text
mosip.kernel.sms.enabled=true
mosip.kernel.sms.country.code=91
mosip.kernel.sms.number.min.length=10
mosip.kernel.sms.number.max.length=10
mosip.kernel.sms.api=http://api.msg91.com/api/v2/sendsms
mosip.kernel.sms.authkey=<authkey>
mosip.kernel.sms.route=4
mosip.kernel.sms.sender=MOSMSG
mosip.id.validation.identity.phone=^([6-9]{1})([0-9]{9})$
```

## Maven

```xml
<dependency>
    <groupId>io.mosip.kernel</groupId>
    <artifactId>kernel-smsserviceprovider-msg91</artifactId>
    <version>1.4.1-SNAPSHOT</version>
</dependency>
```

## Usage

```java
@Autowired
private SMSServiceProvider smsServiceProvider;

smsServiceProvider.sendSms(contactNumber, contentMessage);
```

## Build

```text
cd kernel
mvn -pl kernel-smsserviceprovider-msg91 clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio **0.90**. Outbound MOSIP tokens: `kernel-auth-adapter` (version in parent `pom.xml`).

## License

[Mozilla Public License 2.0](../../LICENSE) — [NOTICE](../../NOTICE)
