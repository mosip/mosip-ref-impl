# kernel-ref-idobjectvalidator

Reference `IdObjectValidator` that checks identity JSON against schema and masterdata (documents, locations, gender, etc.).

- **Artifact**: `io.mosip.kernel:kernel-ref-idobjectvalidator:1.4.1-SNAPSHOT`
- **Parent**: `kernel-ref-parent` (Boot **4.1.1**, `kernel-core` supplies logging)
- **Preview**: tests use `--enable-preview`
- **Config**: `mosip.idobjectvalidator.scheduler.reset-cache.cron-job-pattern` and masterdata URI properties

## Build

```text
cd kernel
mvn -pl kernel-ref-idobjectvalidator clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

Runtime consumers (booking, registration client) add this JAR plus `kernel-auth-adapter` as needed.

```text
mvn -pl kernel-ref-idobjectvalidator clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio **0.90**. `json-path` / `json-smart` are compile dependencies (identity JSON queries).

## License

[Mozilla Public License 2.0](../../LICENSE) — [NOTICE](../../NOTICE)
