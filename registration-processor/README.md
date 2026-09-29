# registration-processor

Parent **`registration-processor-ref-parent`** (`packaging=pom`). Spring Boot **4.1.1**, Java 21. No MOSIP `pre-processor` parent and no `kernel-bom`. MOSIP registration-processor jars are pinned in `registration-processor/pom.xml`. Logging via `kernel-core` (commons).

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

JaCoCo LINE covered ratio **0.90** on `verify`. Git info: `service-git.properties`.

## Config

- [application-default.properties](https://github.com/mosip/mosip-config/blob/master/application-default.properties)
- [registration-processor-default.properties](https://github.com/mosip/mosip-config/blob/master/registration-processor-default.properties)

## License

[Mozilla Public License 2.0](../LICENSE) — [NOTICE](../NOTICE)
