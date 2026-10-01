# registration-processor-external-stage

Vert.x stage that reads `EXTERNAL_STAGE_BUS_IN`, POSTs to the External Integration Service, then emits `EXTERNAL_STAGE_BUS_OUT`.

Pins live in parent [`registration-processor/pom.xml`](../pom.xml). Module description lives in [`pom.xml`](pom.xml) — not here.

- **Artifact**: `io.mosip.registrationprocessor:registration-processor-external-stage`
- **Logging**: `kernel-core` (commons) — do not add `kernel-logger-logback`
- **Git info**: `service-git.properties`

## Overview

Integrates the packet SEDA pipeline with an external HTTP system (EIS).

## Design

- [Approach for External System Integration](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_external_system_integration.md)
- [Approach for Adding HTTP Stage](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_http_integration.md)
- [Guideline for adding an External Stage](https://github.com/mosip/registration/blob/master/design/registration-processor/External_System_Integration_Guide.md)

## Default ports and path

```text
eventbus.port=5736
server.port=8095
server.servlet.path=/registrationprocessor/v1/external
```

## Configurable properties (config server)

```text
EISERVICE=${mosip.base.url}/registrationprocessor/v1/eis/registration-processor/external-integration-service/v1.0
mosip.regproc.external.eventbus.kafka.commit.type=single
mosip.regproc.external.eventbus.kafka.max.poll.records=100
mosip.regproc.external.eventbus.kafka.poll.frequency=100
mosip.regproc.external.eventbus.kafka.group.id=external-stage
mosip.regproc.external.message.expiry-time-limit=${mosip.regproc.common.stage.message.expiry-time-limit}
mosip.regproc.external.eventbus.port=5736
mosip.regproc.external.server.port=8095
mosip.regproc.external.server.servlet.path=/registrationprocessor/v1/external
```

Prefix: `mosip.regproc.external.`

## Operations

External validation by sending the packet id list to EIS (`ApiName.EISERVICE`). Status is updated true/false from the HTTP response.

## Prerequisites

- JDK **21.0.3**
- Maven **3.9.6**
- Cluster: config-server + Kafka/Vert.x. Laptop: `run-local` (`init`/`test` without that stack)

## Local testing (run-local)

Laptop runner (same commands as commons `kernel-notification-service`). Profile **`local`** loads `src/main/resources/application-local.properties` from `ExternalStageApplication` (this is Vert.x, not `SpringApplication`). Cluster Docker does **not** set this profile.

Windows cmd (from this module directory):

```text
run-local.bat init
run-local.bat test
```

`start` / `smoke` / `all` boot the Vert.x stage. Profile `local` does **not** call MOSIP `ConfigPropertyReader` and drops `CoreConfigBean.getPropertiesFromConfigServer` (Vert.x `SpringConfigServerStore` against bootstrap `localhost`). H2 supplies `javax.persistence.jdbc.*` for `HibernateDaoConfig`. This module also shadows MOSIP `BasePacketEntity` / `BaseRegistrationEntity` (Hibernate 7 forbids `@Inheritance` on `@MappedSuperclass`). Packet processing still needs a real status DB and EIS. If status-service beans cannot load, startup prints `EXTERNAL_STAGE_STARTUP_FAILED` and exits. Use `init` / `test` on a laptop without that stack.

Linux / macOS / Git Bash: `./run-local.sh <command>`. Maven is invoked from `registration-processor/` with `-pl registration-processor-external-stage -am`.

| | |
|---|---|
| HTTP | `8095` (`STAGE_PORT`) |
| Eventbus | `5736` |
| Logs | `.local/logs/external-stage.log` (gitignored) |

Full command table: [repo README — Local testing](../../README.md#local-testing-run-local).

## Build & run

```text
cd registration-processor
mvn -pl registration-processor-external-stage clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn -pl registration-processor-external-stage clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

### Docker

```text
docker build -t registration-processor-external-stage .
```

### Runtime auth adapter (typical MOSIP stage)

```xml
<dependency>
    <groupId>io.mosip.kernel</groupId>
    <artifactId>kernel-auth-adapter</artifactId>
    <version>${kernel.auth.adapter.version}</version>
</dependency>
```

JaCoCo LINE covered ratio is gated in the parent `pom.xml`. Needs MOSIP `registration-processor-core` / status-service-impl / rest-client SNAPSHOTs on the classpath. `kernel-auth-adapter` is packaged in the Boot JAR.

## Configuration

- [application-default.properties](https://github.com/mosip/mosip-config/blob/master/application-default.properties)
- [registration-processor-default.properties](https://github.com/mosip/mosip-config/blob/master/registration-processor-default.properties)

## Deployment (Kubernetes)

```text
export KUBECONFIG=~/.kube/<k8s-cluster.config>
cd deploy
./install.sh
```

## License

[Mozilla Public License 2.0](../../LICENSE) — [NOTICE](../../NOTICE)
