# MOSIP Reference Implementation

[![Maven Package upon a push](https://github.com/mosip/mosip-ref-impl/actions/workflows/push-trigger.yml/badge.svg?branch=release-1.3.x)](https://github.com/mosip/mosip-ref-impl/actions/workflows/push-trigger.yml)

Country-pluggable **reference implementations** (not MOSIP core). Each Maven module is independent, publishes to OSSRH, and can be swapped by dropping in another JAR that implements the same SPI or REST contract.

There is **no repo-root POM** and **no `kernel-bom`**. Standalone modules parent `spring-boot-starter-parent` **4.1.1**. Kernel children inherit through `kernel-ref-parent`; registration-processor children inherit through `registration-processor-ref-parent`. MOSIP library versions (`kernel-core`, `kernel-auth-adapter`, `pre-registration-core`, registration-processor jars) are pinned in each module `pom.xml`, not here.

## Contents

- [Overview](#overview)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Shared facts](#shared-facts)
- [Build](#build)
- [Local testing (run-local)](#local-testing-run-local)
- [Tests and coverage](#tests-and-coverage)
- [Configuration](#configuration)
- [Swagger UI (Authorize)](#swagger-ui-authorize)
- [Docker](#docker)
- [Kubernetes / Helm](#kubernetes--helm)
- [Documentation](#documentation)
- [Notices and licensing](#notices-and-licensing)
- [Contribution](#contribution--community)

## Overview

This repository is the reference for how a country can adapt MOSIP:

| Area | What you replace |
|---|---|
| Packet cache | Hazelcast or Redis `PacketCacheProvider` JAR |
| Kernel SPIs | ID-object validator, MSG91 SMS, ClamAV virus scanner (`META-INF/spring.factories`) |
| Pre-registration | Booking REST service (`/appointment/**`) |
| Registration processor | External stage (Vert.x) + External Integration Service stub REST |
| Identity | Keycloak login theme (FTL) |
| Deploy | Helm chart for booking |

Angular UIs (`pre-registration-ui`, `admin-ui`) live in their own MOSIP repositories, not this tree. Coverage is produced at build time (`mvn clean verify` → `target/site/jacoco/index.html`); TestNG report archives are not checked in.

<!--
  A former directoryAngularFiles pointer list was unused and has been removed.
  testng-report-failed1.tar.gz was unused (no module, CI job, or script referenced it)
  and has been removed.
-->

## Repository layout

```text
mosip-ref-impl/
├── cache-provider-hazelcast/                 PacketCacheProvider + Actuator health
├── cache-provider-redis/                     PacketCacheProvider (Jedis)
├── kernel/                                   kernel-ref-parent (3 SPI modules)
│   ├── kernel-ref-idobjectvalidator/         IdObjectValidator
│   ├── kernel-smsserviceprovider-msg91/      SMS SPI (MSG91)
│   └── kernel-virusscanner-clamav/           VirusScanner + ClamAV
├── keycloak/theme/base/login/                login FTL theme
├── pre-registration-booking-service/         Spring Boot /appointment/**
├── registration-processor/                   registration-processor-ref-parent
│   ├── registration-processor-external-stage/
│   └── registration-processor-external-integration-service/
├── helm/prereg-booking/                      Kubernetes chart
├── licenses/                                 third-party texts + NOTICE
├── .github/workflows/                        CI (kattu Java 21)
├── deploy.sh  LICENSE  NOTICE  README.md
```

### Modules

| Module | Parent | Role | Typical port / notes |
|---|---|---|---|
| [cache-provider-hazelcast](cache-provider-hazelcast) | Boot 4.1.1 | Hazelcast packet cache + `HazelcastHealthIndicator` | library JAR (provided starter/actuator) |
| [cache-provider-redis](cache-provider-redis) | Boot 4.1.1 | Redis/Jedis packet cache (`RedisConfig`) | library JAR |
| [kernel-ref-idobjectvalidator](kernel/kernel-ref-idobjectvalidator) | `kernel-ref-parent` | Identity JSON vs schema + masterdata | library; `--enable-preview` on tests |
| [kernel-smsserviceprovider-msg91](kernel/kernel-smsserviceprovider-msg91) | `kernel-ref-parent` | MSG91 `SMSServiceProvider` | library; `spring.factories` |
| [kernel-virusscanner-clamav](kernel/kernel-virusscanner-clamav) | `kernel-ref-parent` | ClamAV `VirusScanner` | library; host/port properties |
| [pre-registration-booking-service](pre-registration-booking-service) | Boot 4.1.1 | Book / cancel / query appointments | **9095**, context `/preregistration/v1` |
| [registration-processor-external-integration-service](registration-processor/registration-processor-external-integration-service) | `registration-processor-ref-parent` | Country EIS stub REST | **8201**, path `/registrationprocessor/v1/eis` |
| [registration-processor-external-stage](registration-processor/registration-processor-external-stage) | `registration-processor-ref-parent` | Vert.x stage → POST EIS | eventbus **5736**, HTTP **8095** |
| [keycloak](keycloak) | — | Login theme | FTL under `theme/base/login/` |
| [helm/prereg-booking](helm/prereg-booking) | — | Booking Helm chart | namespace `prereg` |

Each module has its own `README.md` with artifact id, build, config, and (where applicable) Swagger.

## Prerequisites

| Tool | Version |
|---|---|
| JDK | **21.0.3** |
| Maven | **3.9.6** |
| Spring Boot parent | **4.1.1** |
| Spring Cloud | **2025.1.3** (Oakwood; pinned in module POMs) |
| Docker | latest stable (optional) |
| PostgreSQL | **16.0** (booking / MOSIP stack) |
| Keycloak | [mosip/keycloak](https://github.com/mosip/keycloak/tree/master) |
| Spring Cloud Config | required **on cluster** (see [Configuration](#configuration)). Laptop smoke uses profile `local` — see [Local testing (run-local)](#local-testing-run-local) |

### Runtime JARs for services

Add to the classpath or as Maven dependencies (versions from the consuming module `pom.xml`):

- `kernel-auth-adapter` — outbound auth / `@PreAuthorize` on booking
- `kernel-ref-idobjectvalidator` — identity object validation on booking

Unpublished MOSIP SNAPSHOTs (`pre-registration-core`, `registration-processor-core`, status-service-impl, rest-client) must be installed locally if they are not on Central snapshots.

## Shared facts

- **Swap impl = swap JAR.** Kernel SPIs load via `META-INF/spring.factories`. Services are Spring Boot 4.1.1 apps.
- **No `pre-processor` parent.** Registration-processor uses `registration-processor-ref-parent` → Boot 4.1.1.
- **Jackson 2** via `spring-boot-jackson2` (Boot 4 defaults to Jackson 3; MOSIP APIs still use Jackson 2).
- **Logging** is in `kernel-core` (commons). Do not add `kernel-logger-logback`.
- **`git-commit-id-plugin`** writes `service-git.properties` (not `git.properties`) so it does not collide with `kernel-core`.
- Tests: JUnit 4 vintage + JUnit 5 + Mockito; `--add-opens` is already in POMs. `kernel-ref-idobjectvalidator` uses `--enable-preview`.
- CI: `.github/workflows/push-trigger.yml` uses `mosip/kattu@master-java21` (build, Docker, OSSRH, Sonar).

## Build

Always run Maven **in the module directory** (or with `-f` / `-pl` as below). Skip Javadoc and GPG for local builds:

```text
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

| What | Command (from repo root) |
|---|---|
| Kernel (all 3 SPIs) | `mvn -f kernel/pom.xml clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true` |
| One kernel module | `mvn -f kernel/pom.xml -pl kernel-ref-idobjectvalidator clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true` |
| Registration-processor (both) | `mvn -f registration-processor/pom.xml clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true` |
| EIS only | `mvn -f registration-processor/pom.xml -pl registration-processor-external-integration-service clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true` |
| Booking | `cd pre-registration-booking-service && mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true` |
| Hazelcast cache | `cd cache-provider-hazelcast && mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true` |
| Redis cache | `cd cache-provider-redis && mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true` |

Run a single test class:

```text
mvn test -Dtest=ClassName[#method]
```

For a laptop process **without** config-server, use the module `run-local` scripts (next section). Cluster / Docker still starts the JAR with the Dockerfile config-server flags and **does not** activate profile `local`.

## Local testing (run-local)

The three runnable services ship the same command shape as commons `kernel-notification-service`: `init`, `start`, `smoke`, `stop`, `test`, `all`. Each module keeps laptop-only settings in `src/main/resources/application-local.properties` and activates them with **`-Dspring.profiles.active=local`**. Packaged `bootstrap.properties` is unchanged. Dockerfiles still pass `spring_config_url_env` / `active_profile_env` / config label — they never set profile `local`, so a cluster node does not read these files.

Artifacts, PIDs, and logs go under each module’s `.local/` (gitignored).

### Prerequisites

- JDK **21** and Maven **3.9.6** on `PATH`
- `curl` on Windows `smoke` (Git for Windows / Windows 10+). Linux/macOS smoke also accepts `python3`
- Unpublished MOSIP SNAPSHOTs installed locally if they are not on Central (booking: `pre-registration-core`; external-stage: `registration-processor-core`, status-service-impl, rest-client)

### Commands (same on every module)

| Command | What it does |
|---|---|
| `init` | Stops a leftover process, then `mvn clean package` (skip tests, skip GPG/Javadoc) |
| `test` | `mvn test` for that module |
| `start` | `java -jar` with profile `local`, waits until ready, prints URLs |
| `smoke` | HTTP checks (health + OpenAPI for Boot services) |
| `stop` | Kills the PID recorded under `.local/pids/` |
| `all` | `init` + `test` + `start` + `smoke` |

Windows **cmd** (not PowerShell as the entrypoint): `run-local.bat <command>`. Linux / macOS / Git Bash: `chmod +x run-local.sh` once, then `./run-local.sh <command>`.

### pre-registration-booking-service

Standalone Boot app (run Maven **in this folder**). In-memory **H2**; masterdata / demographic / notification URLs are stubs. Method security is off; tokens are not validated against IAM.

```text
cd pre-registration-booking-service
run-local.bat all
```

```text
cd pre-registration-booking-service
./run-local.sh all
```

| | |
|---|---|
| Port | **9095** (`BOOKING_PORT`) |
| Context | `/preregistration/v1` |
| Health | `http://127.0.0.1:9095/preregistration/v1/actuator/health` |
| Swagger | `http://127.0.0.1:9095/preregistration/v1/appointment/booking-service/swagger-ui.html` |
| OpenAPI | `http://127.0.0.1:9095/preregistration/v1/appointment/booking-service/v3/api-docs` |
| Properties | `src/main/resources/application-local.properties` |
| Logs / PID | `.local/logs/booking.log`, `.local/pids/booking.pid` |

Step by step: `run-local.bat init` then `start` then `smoke`. `stop` when finished. Override the port with `set BOOKING_PORT=9195` (cmd) or `BOOKING_PORT=9195 ./run-local.sh start`.

### registration-processor-external-integration-service

Country EIS stub. Maven runs from `registration-processor/` with `-pl registration-processor-external-integration-service`.

```text
cd registration-processor/registration-processor-external-integration-service
run-local.bat all
```

```text
cd registration-processor/registration-processor-external-integration-service
./run-local.sh all
```

| | |
|---|---|
| Port | **8201** (`EIS_PORT`) |
| Servlet path | `/registrationprocessor/v1/eis` |
| Health | `http://127.0.0.1:8201/registrationprocessor/v1/eis/actuator/health` |
| Swagger | `http://127.0.0.1:8201/registrationprocessor/v1/eis/swagger-ui.html` |
| OpenAPI | `http://127.0.0.1:8201/registrationprocessor/v1/eis/v3/api-docs` |
| Stub POST | `http://127.0.0.1:8201/registrationprocessor/v1/eis/registration-processor/external-integration-service/v1.0` |
| Properties | `src/main/resources/application-local.properties` |
| Logs / PID | `.local/logs/eis.log`, `.local/pids/eis.pid` |

`smoke` checks health and OpenAPI. To hit the stub yourself:

```text
curl -sS -H "Content-Type: application/json" -d "{\"id\":\"io.mosip.registrationprocessor\",\"version\":\"1.0\",\"request\":[\"10002100770001520240708000001\"]}" http://127.0.0.1:8201/registrationprocessor/v1/eis/registration-processor/external-integration-service/v1.0
```

A non-null `request` body returns `true`.

### registration-processor-external-stage

Vert.x stage (`ExternalStageApplication`), not a servlet Boot app. Maven runs from `registration-processor/` with `-pl registration-processor-external-stage -am`. `start` loads `application-local.properties` only when profile `local` is set (the main class registers that file because there is no `SpringApplication`).

```text
cd registration-processor/registration-processor-external-stage
run-local.bat init
run-local.bat test
```

```text
cd registration-processor/registration-processor-external-stage
./run-local.sh init
./run-local.sh test
```

| | |
|---|---|
| HTTP port | **8095** (`STAGE_PORT`) |
| Eventbus | **5736** |
| Servlet path | `/registrationprocessor/v1/external` |
| Properties | `src/main/resources/application-local.properties` |
| Logs / PID | `.local/logs/external-stage.log`, `.local/pids/external-stage.pid` |

**`init` and `test`** are the reliable laptop checks (unit tests mock Vert.x / EIS). **`start` / `smoke` / `all`** try to boot the real stage without config-server (`ConfigPropertyReader` / Vert.x SpringConfigServerStore are skipped). Packet processing still needs Kafka, registration-status DB, and a running EIS. If MOSIP status beans cannot load, the process prints `EXTERNAL_STAGE_STARTUP_FAILED` and exits (scripts no longer wait 120s). Use `test` for CI-style verification.

`smoke` accepts Actuator 200 if present, otherwise a listening HTTP port or the `Started ExternalStageApplication` log line (this stage does not publish Springdoc).

### What local vs cluster uses

| | Laptop `run-local` | Cluster / Docker |
|---|---|---|
| Profile | `local` | `active_profile_env` (typically `default` / env name) |
| Config | `application-local.properties` + `-Dspring.cloud.config.enabled=false` | Config server URI/label/name from the Dockerfile `CMD` |
| Booking DB | H2 in-memory | PostgreSQL from MOSIP config |
| IAM / issuer | Offline token validation; no Eureka lookup of IAM | Config-server IAM URLs |
| Artifacts | `.local/` | container logs |

Do not copy `application-local.properties` keys into `bootstrap.properties`. Do not activate profile `local` in Helm or the Dockerfile.

## Tests and coverage

`mvn clean verify` runs tests, writes JaCoCo HTML at `target/site/jacoco/index.html`, and enforces **LINE covered ratio 0.90** (`jacoco-check`), using the same package excludes as `sonar.coverage.exclusions`.

```text
mvn clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn clean verify -Psonar
```

`-Psonar` needs `SONAR_TOKEN` and uploads to SonarCloud. Local JaCoCo XML is the coverage input (`sonar.coverage.jacoco.xmlReportPaths`).

## Configuration

Services pull properties from Spring Cloud Config ([mosip/mosip-config](https://github.com/mosip/mosip-config/tree/master)). Use the tagged release that matches your platform:

- [application-default.properties](https://github.com/mosip/mosip-config/blob/master/application-default.properties)
- [pre-registration-default.properties](https://github.com/mosip/mosip-config/blob/master/pre-registration-default.properties)
- [registration-processor-default.properties](https://github.com/mosip/mosip-config/blob/master/registration-processor-default.properties) (registration pipeline; some docs also refer to `registration-default.properties`)

Packaged defaults: each service `src/main/resources/bootstrap.properties`.

### Environment-specific properties (typical)

**Database**

- `mosip.registration.processor.database.hostname` (default: `postgres-postgresql.postgres`)
- `mosip.registration.processor.database.port` (default: `5432`)
- `db.dbuser.password` (environment)

**IAM / Keycloak**

- `keycloak.internal.url`, `keycloak.external.url`
- `mosip.regproc.client.secret`

**Service URLs**

- `mosip.kernel.authmanager.url`
- `mosip.kernel.keymanager.url`
- `mosip.kernel.masterdata.url`
- `mosip.kernel.notification.url`
- `mosip.idrepo.identity.url`
- `mosip.api.internal.url`

Config-server setup: [MOSIP Config Server Setup Guide](https://docs.mosip.io/1.2.0/modules/registration-processor/registration-processor-developers-guide#environment-setup).

## Swagger UI (Authorize)

Booking and EIS expose Springdoc OpenAPI 3. Click **Authorize**, scheme **Authorization** (header apiKey), paste the token from authmanager. Try-it-out then sends that header on each request.

| Service | UI |
|---|---|
| pre-registration-booking-service | `http://localhost:9095/preregistration/v1/appointment/booking-service/swagger-ui.html` |
| registration-processor-external-integration-service | `http://localhost:8201/registrationprocessor/v1/eis/swagger-ui.html` |

## Docker

### Pull (demo)

```text
docker pull mosipid/pre-registration-booking-service:1.3.0
```

### Build locally

```text
cd <service-directory>
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
docker build -t <service-name> .
docker run -d -p <port>:<port> --name <service-name> <service-name>
docker ps
```

Booking `Dockerfile` is in `pre-registration-booking-service/`. EIS and external-stage have Dockerfiles under `registration-processor/<module>/`.

## Kubernetes / Helm

Sandbox: [Sandbox Deployment Guide](https://docs.mosip.io/1.2.0/deploymentnew/v3-installation).

Booking chart:

```text
kubectl create namespace prereg
helm repo add mosip https://mosip.github.io
helm -n prereg install my-release mosip/prereg-booking
```

Chart sources: [helm/prereg-booking](helm/prereg-booking).

## Documentation

**APIs**

- [Pre-Registration Booking Service](https://mosip.github.io/documentation/1.2.0/pre-registration-booking-service.html)
- [Registration Processor External Integration Service](https://mosip.github.io/documentation/1.2.0/registration-processor-external-integration-service.html)

**Product**

- [Registration Processor](https://docs.mosip.io/1.2.0/id-lifecycle-management/identity-issuance/registration-processor/overview)
- [Pre-Registration](https://docs.mosip.io/1.2.0/id-lifecycle-management/identity-issuance/pre-registration)
- [Keycloak](https://docs.mosip.io/1.2.0/id-lifecycle-management/supporting-components/keycloak)
- [Reference implementations](https://docs.mosip.io/1.2.0/setup/implementations/reference-implementations#common-components)

Booking SQL: [pre-registration db_scripts](https://github.com/mosip/pre-registration/tree/master/db_scripts).

External stage design:

- [External system integration](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_external_system_integration.md)
- [HTTP stage](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_http_integration.md)
- [Adding an external stage](https://github.com/mosip/registration/blob/master/design/registration-processor/External_System_Integration_Guide.md)

## Notices and licensing

This project is [Mozilla Public License 2.0](LICENSE).

Third-party attributions and the MOSIP matrix (**Compatible with MPL 2.0?** / **Use with MOSIP?**) are in:

- [NOTICE](NOTICE) — elected licenses and classpath exceptions
- [licenses/NOTICE](licenses/NOTICE) — full comments and dual-license elections
- [licenses/](licenses/) — Apache-2.0, MIT, BSD, CDDL, EPL, MPL, and matrix reference texts

Product runtime elects Use = Yes options (Apache-2.0, MIT, BSD, MPL-2.0, CDDL). Dual-licensed jars never elect EPL, GPL, AGPL, LGPLv3, or Creative Commons as the product license. JUnit / Logback / AspectJ / JaCoCo remain EPL or EPL-or-LGPL on the test, Boot-logger, or build path; see NOTICE.

## Contribution & community

- [Code contributions](https://docs.mosip.io/1.2.0/community/code-contributions)
- [MOSIP Community](https://community.mosip.io/)
- [GitHub issues](https://github.com/mosip/mosip-ref-impl/issues)
