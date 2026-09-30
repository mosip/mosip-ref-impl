# kernel-smsserviceprovider-msg91

Reference `SMSServiceProvider` using the MSG91 HTTP API.

Pins live in parent [`kernel/pom.xml`](../pom.xml). Module description lives in [`pom.xml`](pom.xml) — not here.

- **Artifact**: `io.mosip.kernel:kernel-smsserviceprovider-msg91`
- **SPI**: `SMSServiceProviderImpl` via `META-INF/spring.factories`
- **Logging**: `kernel-core` (commons) — do not add `kernel-logger-logback`

## Implementation

Keep the SPI contract. Change `SMSServiceProviderImpl` (or an equivalent impl) for another vendor. Do not change the REST contract of consuming services.

```text
io.mosip.kernel.core.notification.spi.SMSServiceProvider
```

## Properties

```text
mosip.kernel.sms.enabled
mosip.kernel.sms.country.code
mosip.kernel.sms.number.min.length
mosip.kernel.sms.number.max.length
mosip.kernel.sms.api
mosip.kernel.sms.authkey
mosip.kernel.sms.route
mosip.kernel.sms.sender
mosip.id.validation.identity.phone
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

JaCoCo LINE covered ratio is gated in the parent `pom.xml`. Outbound MOSIP tokens: `kernel-auth-adapter`.

## License

[Mozilla Public License 2.0](../../LICENSE) — [NOTICE](../../NOTICE)
