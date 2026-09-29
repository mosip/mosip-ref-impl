# Pre-registration Booking Service

Spring Boot **4.1.1** REST service (`BookingApplication`) used by the Pre-Registration portal to book, cancel, and query appointments.

- **Artifact**: `io.mosip.preregistration:pre-registration-booking-service:1.4.1-SNAPSHOT`
- **Parent**: `spring-boot-starter-parent` 4.1.1 (no `kernel-bom`)
- **REST**: `BookingController` `/appointment/**`
- **Auth**: `@PreAuthorize("hasAnyRole(@authorizedRoles.get…())")`; runtime JARs `kernel-auth-adapter` and `kernel-ref-idobjectvalidator`
- **Logging**: `kernel-core` (commons) — do not add `kernel-logger-logback`
- **Git info**: `git-commit-id-plugin` writes `service-git.properties`

## Overview

This service lets an applicant book an appointment with basic slot details (registration centre, date, time).

## Databases

Refer to the required released tagged version [SQL scripts](https://github.com/mosip/pre-registration/tree/master/db_scripts).

## Prerequisites

- JDK **21.0.3**
- Maven **3.9.6**
- Spring Cloud Config server (see Configuration)
- PostgreSQL 16 (typical MOSIP stack)

## Build & run (for developers)

```text
cd pre-registration-booking-service
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

Run `BookingApplication` from the IDE or:

```text
java -jar target/pre-registration-booking-service-1.4.1-SNAPSHOT.jar
```

### Docker

```text
cd pre-registration-booking-service
docker build -t pre-registration-booking-service .
```

### Runtime classpath (auth + ID object validator)

```xml
<dependency>
    <groupId>io.mosip.kernel</groupId>
    <artifactId>kernel-auth-adapter</artifactId>
    <version>${kernel.auth.adapter.version}</version>
</dependency>
<dependency>
    <groupId>io.mosip.kernel</groupId>
    <artifactId>kernel-ref-idobjectvalidator</artifactId>
    <version>${project.version}</version>
</dependency>
```

MOSIP versions are in this module’s `pom.xml` (`kernel.auth.adapter.version`, `pre.registration.core.version`, `kernel.core.version`).

```text
mvn clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio **0.90** (`target/site/jacoco/index.html`). Jackson 2 via `spring-boot-jackson2`. Spring Cloud **2025.1.3**. Git info: `service-git.properties`.

## Configuration

Uses Spring Cloud Config:

- [application-default.properties](https://github.com/mosip/mosip-config/blob/master/application-default.properties)
- [pre-registration-default.properties](https://github.com/mosip/mosip-config/blob/master/pre-registration-default.properties)

Default context, path, port: [bootstrap.properties](src/main/resources/bootstrap.properties)

- Port: `9095`
- Context: `/preregistration/v1`

## Swagger UI (Authorize)

| | |
|---|---|
| UI | `http://localhost:9095/preregistration/v1/appointment/booking-service/swagger-ui.html` |
| API docs | `/appointment/booking-service/v3/api-docs` |

Click **Authorize**. Scheme: **Authorization** header apiKey. Paste the token from authmanager; Try-it-out sends it on every call.

## Deployment (Kubernetes)

```text
export KUBECONFIG=~/.kube/<k8s-cluster.config>
cd deploy
./install.sh    # ./delete.sh  ./restart.sh
```

See also [Sandbox Deployment Guide](https://docs.mosip.io/1.2.0/deploymentnew/v3-installation).

## APIs

[Pre-Registration Booking Service API](https://mosip.github.io/documentation/1.2.0/pre-registration-booking-service.html)

## License

[Mozilla Public License 2.0](../LICENSE) — [NOTICE](../NOTICE)
