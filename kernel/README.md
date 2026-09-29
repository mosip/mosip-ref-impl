# kernel

Parent **`kernel-ref-parent`** (`packaging=pom`). Spring Boot **4.1.1**, Java 21, no `kernel-bom`. Logging comes from `kernel-core` (commons); do not add `kernel-logger-logback`. MOSIP versions are in `kernel/pom.xml`.

## Modules

| Module | SPI / role | README |
|---|---|---|
| [kernel-ref-idobjectvalidator](kernel-ref-idobjectvalidator) | `IdObjectValidator` — identity JSON vs schema + masterdata | [README](kernel-ref-idobjectvalidator/README.md) |
| [kernel-smsserviceprovider-msg91](kernel-smsserviceprovider-msg91) | `SMSServiceProvider` — MSG91 HTTP | [README](kernel-smsserviceprovider-msg91/README.md) |
| [kernel-virusscanner-clamav](kernel-virusscanner-clamav) | `VirusScanner<Boolean, InputStream>` — ClamAV | [README](kernel-virusscanner-clamav/README.md) |

Swap implementation = swap the JAR. SPIs auto-load from `META-INF/spring.factories`.

## Build

From this directory:

```text
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn -pl kernel-ref-idobjectvalidator clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio **0.90** on `verify` (`target/site/jacoco/index.html` per child). `kernel-ref-idobjectvalidator` tests use `--enable-preview`.

Git commit plugin writes `service-git.properties` (not `git.properties`).

## License

[Mozilla Public License 2.0](../LICENSE) — [NOTICE](../NOTICE)
