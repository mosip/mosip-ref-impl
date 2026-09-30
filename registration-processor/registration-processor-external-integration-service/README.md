# registration-processor-external-integration-service

Country stub REST service that receives POSTs from `registration-processor-external-stage`. Replace the controller body with country-specific integration logic.

Pins live in parent [`registration-processor/pom.xml`](../pom.xml). Module description lives in [`pom.xml`](pom.xml) — not here.

- **Artifact**: `io.mosip.registrationprocessor:registration-processor-external-integration-service`
- **Logging**: `kernel-core` (commons) — do not add `kernel-logger-logback`
- **Git info**: `service-git.properties`

## Overview

Used by registration-processor for external system integration. Default implementation returns `true` when the request body is non-null.

## Design

- [Approach for External System Integration](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_external_system_integration.md)
- [Approach for Adding HTTP Stage](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_http_integration.md)

## Default context and port

```text
server.port=8201
server.servlet.path=/registrationprocessor/v1/eis
```

See [bootstrap.properties](src/main/resources/bootstrap.properties).

## Operations

1. `POST /registration-processor/external-integration-service/v1.0` — returns `true` for a non-null request payload.

## Prerequisites

- JDK **21.0.3**
- Maven **3.9.6**
- Spring Cloud Config

## Build & run

```text
cd registration-processor
mvn -pl registration-processor-external-integration-service clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

```text
java -jar target/registration-processor-external-integration-service-1.4.1-SNAPSHOT.jar
```

### Docker

```text
docker build -t registration-processor-external-integration-service .
```

## Configuration

- [application-default.properties](https://github.com/mosip/mosip-config/blob/master/application-default.properties)
- [registration-processor-default.properties](https://github.com/mosip/mosip-config/blob/master/registration-processor-default.properties)

## Swagger UI (Authorize)

| | |
|---|---|
| UI | `http://localhost:8201/registrationprocessor/v1/eis/swagger-ui.html` (springdoc default under servlet path) |
| Scheme | **Authorization** header apiKey |

Click **Authorize**, paste the authmanager token, then Try-it-out.

```text
mvn -pl registration-processor-external-integration-service clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio is gated in the parent `pom.xml`. Boot 4 tests use `org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest`.

## Deployment (Kubernetes)

```text
export KUBECONFIG=~/.kube/<k8s-cluster.config>
cd deploy
./install.sh
```

## APIs

[External Integration Service API](https://mosip.github.io/documentation/1.2.0/registration-processor-external-integration-service.html)

## License

[Mozilla Public License 2.0](../../LICENSE) — [NOTICE](../../NOTICE)
