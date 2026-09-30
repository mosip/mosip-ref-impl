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
- Config server + Kafka/Vert.x cluster as in MOSIP registration-processor

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
