# kernel

Parent `kernel-ref-parent` (`packaging=pom`) for three MOSIP kernel SPI reference implementations.

Pins (Boot parent, MOSIP jars, plugins, JaCoCo gate) and the module description live in [`pom.xml`](pom.xml) — not here.

- **Artifact**: `io.mosip.kernel:kernel-ref-parent`
- **Logging**: `kernel-core` (commons) — do not add `kernel-logger-logback`
- **Git info**: `service-git.properties`

## Modules

| Module | SPI / role |
|---|---|
| [kernel-ref-idobjectvalidator](kernel-ref-idobjectvalidator) | `IdObjectValidator` — identity JSON vs schema + masterdata |
| [kernel-smsserviceprovider-msg91](kernel-smsserviceprovider-msg91) | `SMSServiceProvider` — MSG91 HTTP |
| [kernel-virusscanner-clamav](kernel-virusscanner-clamav) | `VirusScanner<Boolean, InputStream>` — ClamAV |

Swap implementation = swap the JAR. SPIs auto-load from `META-INF/spring.factories`.

## Build

```text
cd kernel
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

```text
mvn -pl kernel-ref-idobjectvalidator clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio is gated in `pom.xml` (`target/site/jacoco/index.html` per child). `kernel-ref-idobjectvalidator` tests use `--enable-preview`.

## License

[Mozilla Public License 2.0](../LICENSE) — [NOTICE](../NOTICE)
