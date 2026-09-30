# registration-processor

Parent `registration-processor-ref-parent` (`packaging=pom`) for the MOSIP registration-processor reference implementations (Vert.x external stage and the country EIS stub).

Pins (Boot parent, MOSIP jars, plugins, JaCoCo gate) and the module description live in [`pom.xml`](pom.xml) — not here.

- **Artifact**: `io.mosip.registrationprocessor:registration-processor-ref-parent`
- **Logging**: `kernel-core` (commons) — do not add `kernel-logger-logback`
- **Git info**: `service-git.properties`
- **CI**: both Boot JARs publish as artifact `registration-processor`

## Modules

| Module | Role | README |
|---|---|---|
| [registration-processor-external-stage](registration-processor-external-stage) | Vert.x stage: `EXTERNAL_STAGE_BUS_IN` → POST EIS → `EXTERNAL_STAGE_BUS_OUT` | [README](registration-processor-external-stage/README.md) |
| [registration-processor-external-integration-service](registration-processor-external-integration-service) | Country EIS stub REST (`true` if request body non-null) | [README](registration-processor-external-integration-service/README.md) |

Prefix for stage properties: `mosip.regproc.external.`

## Build

From this directory:

```text
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn -pl registration-processor-external-integration-service clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

External-stage needs unpublished MOSIP SNAPSHOTs (`registration-processor-core`, status-service-impl, rest-client) installed locally if they are not on Central snapshots. EIS can be built with `-pl` on its own.

JaCoCo LINE covered ratio is gated in `pom.xml` (`target/site/jacoco/index.html` per child).

## Config

- [application-default.properties](https://github.com/mosip/mosip-config/blob/master/application-default.properties)
- [registration-processor-default.properties](https://github.com/mosip/mosip-config/blob/master/registration-processor-default.properties)

## License

[Mozilla Public License 2.0](../LICENSE) — [NOTICE](../NOTICE)
