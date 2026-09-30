# kernel-ref-idobjectvalidator

Reference `IdObjectValidator` that checks identity JSON against schema and masterdata (documents, locations, gender, languages).

Pins live in parent [`kernel/pom.xml`](../pom.xml). Module description lives in [`pom.xml`](pom.xml) — not here.

- **Artifact**: `io.mosip.kernel:kernel-ref-idobjectvalidator`
- **Impl**: `IdObjectReferenceValidator`
- **Preview**: tests use `--enable-preview`
- **Config**: `mosip.idobjectvalidator.masterdata.rest.uri`, `mosip.idobjectvalidator.scheduler.reset-cache.cron-job-pattern`

## Build

```text
cd kernel
mvn -pl kernel-ref-idobjectvalidator clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

```text
mvn -pl kernel-ref-idobjectvalidator clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio is gated in the parent `pom.xml` (`target/site/jacoco/index.html`). Drop the JAR onto booking / registration-client.

## License

[Mozilla Public License 2.0](../../LICENSE) — [NOTICE](../../NOTICE)
