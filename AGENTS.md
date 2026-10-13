# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

This is the **MOSIP Reference Implementation** (`mosip-ref-impl`) — a collection of country-deployable, pluggable implementations that extend the core MOSIP (Modular Open Source Identity Platform). It does **not** contain core platform logic; instead it provides concrete, replaceable implementations of interfaces defined upstream (in `mosip/commons`, `mosip/kernel`, `mosip/registration`, `mosip/pre-registration`, etc.).

Each top-level directory is an independently buildable Maven project published to Maven Central (OSSRH). Downstream deployments wire these JARs in via Spring `spring.factories` auto-configuration, the Spring Boot `loader.path` (additional JARs), or explicit `pom.xml` dependencies.

The current line is **1.3.x** (`release-1.3.x`).

## Build Commands

There is **no root pom**. Build each top-level directory independently:

- `kernel/` has an aggregator parent pom (`io.mosip.kernel:kernel-ref-parent`) that builds all three kernel modules together.
- `registration-processor/` has **no** aggregator; each sub-module is built on its own (both inherit from upstream `io.mosip.registrationprocessor:pre-processor`).
- `cache-provider-hazelcast`, `cache-provider-redis` and `pre-registration-booking-service` are standalone poms.

```bash
# Build a module (skip GPG and Javadoc for local dev)
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true

# Build all kernel modules at once
cd kernel && mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true

# Run tests for one kernel sub-module from kernel/
mvn test -pl kernel-ref-idobjectvalidator

# Run a single test class / method
mvn test -Dtest=ClassName
mvn test -Dtest=ClassName#methodName

# Generate coverage report (output: target/site/jacoco/index.html)
mvn clean verify

# SonarCloud analysis
mvn clean verify -Psonar

# Generate OpenAPI docs (pre-registration-booking-service only)
mvn verify -Popenapi-doc-generate-profile
```

**Prerequisites:** JDK 21 (`maven.compiler.source=21` everywhere), Maven 3.9.x. Tests use `--add-opens` JVM args (configured in each `pom.xml`) for Java 21 module compatibility.

## Module Versions

| Module | groupId:artifactId | Version | Key upstream deps |
|--------|-------------------|---------|-------------------|
| `kernel/` (parent) | `io.mosip.kernel:kernel-ref-parent` | 1.3.1 | `kernel-core` 1.3.1 |
| `kernel/kernel-ref-idobjectvalidator` | `kernel-ref-idobjectvalidator` | 1.3.1 | `kernel-bom` 1.3.1, `kernel-logger-logback` 1.3.1 |
| `kernel/kernel-smsserviceprovider-msg91` | `kernel-smsserviceprovider-msg91` | 1.3.1 | `kernel-core` 1.3.1, `kernel-auth-adapter` 1.3.0 |
| `kernel/kernel-virusscanner-clamav` | `kernel-virusscanner-clamav` | 1.3.1 | `clamav-client` 1.0.4 |
| `cache-provider-hazelcast` | `cache-provider-hazelcast` | 1.3.1 | `kernel-bom` 1.3.1, Hazelcast 3.12.12 |
| `cache-provider-redis` | `cache-provider-redis` | 1.3.1 | `kernel-bom` 1.3.1, `spring-boot-starter-data-redis` (Jedis) |
| `pre-registration-booking-service` | `io.mosip.preregistration:pre-registration-booking-service` | **1.3.2-SNAPSHOT** | `pre-registration-core` **1.3.1-SNAPSHOT**, `kernel-core` 1.3.1, `kernel-bom` 1.3.1, Spring Boot 3.2.3 |
| `registration-processor/registration-processor-external-stage` | `registration-processor-external-stage` | 1.3.1 | parent `pre-processor` 1.3.1, `registration-processor-core`, `-registration-status-service-impl`, `-rest-client` |
| `registration-processor/registration-processor-external-integration-service` | `registration-processor-external-integration-service` | 1.3.1 | parent `pre-processor` 1.3.1, Spring Boot 3.2.3 |
| `helm/prereg-booking` | Helm chart `prereg-booking` | **1.3.2-develop** | Bitnami `common` 1.x.x |

When bumping a release, keep the booking service pom version, its `pre.registration.core.version`, the Helm `Chart.yaml` `version` and the `values.yaml` image tag in sync.

## Module Map

```
mosip-ref-impl/
├── kernel/                                   # Aggregator parent pom (kernel-ref-parent)
│   ├── kernel-ref-idobjectvalidator/         # Reference ID Object Validator (JSON schema + masterdata validation)
│   ├── kernel-smsserviceprovider-msg91/      # SMS via MSG91 API
│   └── kernel-virusscanner-clamav/           # ClamAV virus scanner integration
├── cache-provider-hazelcast/                 # Hazelcast health indicator for packet cache
├── cache-provider-redis/                     # Redis (Jedis) connection/template config for packet cache
├── pre-registration-booking-service/         # Appointment booking service for pre-registration portal
├── registration-processor/
│   ├── registration-processor-external-stage/              # Custom Vert.x stage: delegates to EIS
│   └── registration-processor-external-integration-service/ # REST stub for the external stage to call
├── keycloak/
│   ├── standalone/deployments/spi-keycloak-1.0.jar         # Prebuilt Keycloak SPI
│   └── theme/base/login/register.ftl                       # Customized registration page
├── helm/prereg-booking/                      # Helm chart for pre-registration booking service
├── deploy.sh                                 # Deploys every pom under a dir whose version matches an argument
└── directoryAngularFiles                     # Legacy file list (not part of the build)
```

## Architecture

### Design Pattern

Every module implements an **SPI interface** or supplies configuration for a component defined upstream (`mosip/kernel`, `mosip/commons`, `mosip/registration`). Kernel SPIs are resolved at runtime via Spring `spring.factories` (`EnableAutoConfiguration`) or by placing the JAR on the Spring Boot `loader.path`. To replace an implementation, swap the JAR — no core platform changes required.

### Pre-Registration Booking Service

A standalone **Spring Boot 3.2.x** REST service. Key characteristics:

- Entry point: `io.mosip.preregistration.booking.BookingApplication`
- Port `9095`, context path `/preregistration/v1` (from `bootstrap.properties`); `spring.cloud.config.name=pre-registration`
- All REST endpoints are in `BookingController`:
  - `GET  /appointment/availability/{registrationCenterId}`
  - `POST /appointment/{preRegistrationId}`, `POST /appointment` (multi-booking)
  - `GET  /appointment/{preRegistrationId}`, `PUT /appointment/{preRegistrationId}` (cancel)
  - `PUT  /batch/appointment/{preRegistrationId}` (batch cancel)
  - `DELETE /appointment`
  - `GET  /appointment/preRegistrationId/{registrationCenterId}`, `GET /appointment/registrationCenterId/{registrationCenterId}`
- Swagger UI: `/appointment/booking-service/swagger-ui.html`; API docs: `/appointment/booking-service/v3/api-docs`
- Role-based access uses `@PreAuthorize("hasAnyRole(@authorizedRoles.get...())")` — roles are resolved from a Spring bean, not hardcoded strings
- Layers: `controller` → `service` (`BookingService`, `BookingServiceUtil`, `BookingLock`) → `repository` (`BookingDAO`, JPA repositories for availability/demographic/booking)
- Depends on upstream `io.mosip.preregistration:pre-registration-core` for DTOs and utilities
- Requires `kernel-auth-adapter.jar` and `kernel-ref-idobjectvalidator.jar` at runtime; the Docker image (`eclipse-temurin:21-jre-alpine`, ZGC) downloads both into `loader.path` (`/home/mosip/additional_jars/`) at container start from `iam_adapter_url` / `artifactory_url`
- Config: `application-default.properties` and `pre-registration-default.properties` from `mosip/mosip-config`, served by Spring Cloud Config Server

### Registration Processor External Stage + Integration Service

These two modules work as a pair to enable **custom business logic hooks** inside the registration packet processing pipeline:

1. **`registration-processor-external-stage`** — a Vert.x verticle (`ExternalStage extends MosipVerticleAPIManager`) that sits in the packet pipeline. It:
   - Consumes from `EXTERNAL_STAGE_BUS_IN`
   - Makes a synchronous POST to the `ApiName.EISERVICE` endpoint (the External Integration Service below)
   - Forwards `true` (success) or `false` (failure) to update registration status
   - Produces to `EXTERNAL_STAGE_BUS_OUT`
   - Property prefix: `mosip.regproc.external.`

2. **`registration-processor-external-integration-service`** — a Spring Boot REST service (`ExternalIntegrationServiceApplication`) whose `ExternalController` receives the POST at `/registration-processor/external-integration-service/v1.0`. The bundled implementation is a **stub** that always returns `true` if the request body is non-null. Implementers replace this service with real country-specific business logic.

The stage follows the standard MOSIP stage pattern: extend `MosipVerticleAPIManager`, implement `process(MessageDTO)`, override `getPropertyPrefix()`.

### Kernel Reference Implementations

| Module | SPI Implemented | Key Config |
|--------|----------------|------------|
| `kernel-ref-idobjectvalidator` | `IdObjectValidator` (`IdObjectReferenceValidator`) | Validates identity JSON against a JSON Schema; fetches masterdata values (document types, locations, languages) from the Masterdata Service; configurable cron-based cache refresh via `mosip.idobjectvalidator.scheduler.reset-cache.cron-job-pattern`. Loaded via `loader.path`, not `spring.factories` |
| `kernel-smsserviceprovider-msg91` | SMS SPI (`SMSServiceProviderImpl`) | Calls MSG91 REST API; `SMSServiceProviderImpl` and `ApiExceptionHandler` loaded via `spring.factories` |
| `kernel-virusscanner-clamav` | `VirusScanner<Boolean, InputStream>` (`VirusScannerImpl`) | Connects to a running ClamAV daemon; configured via `mosip.kernel.virus-scanner.host` and `mosip.kernel.virus-scanner.port`; loaded via `spring.factories` |

### Cache Providers

Both modules live under `io.mosip.commons.packet.cache.provider.*` and supply configuration consumed by MOSIP's packet manager cache; they contain no `PacketCacheProvider` implementation of their own.

- **`cache-provider-hazelcast`** — only `HazelcastHealthIndicator`, a Spring Boot Actuator health indicator for the `HazelcastInstance`. It is `@ConditionalOnProperty("packetmanager.hazelcast.disable.health.check", matchIfMissing = true)`, so it is active by default and turned off by setting that property to `false`.
- **`cache-provider-redis`** — `RedisConfig` defines `JedisPoolConfig`, `JedisConnectionFactory` and `RedisTemplate<String, Object>` (default JDK serialization), tuned for ~400 RPS per pod. Properties use the `redis.cache.*` prefix: required `hostname`, `password`, `port`; optional `database` (0), `ssl` (false), pool sizing (`max.total` 500, `max.idle` 70, `min.idle` 10), timeouts (`connect.timeout` 2000, `read.timeout` 3500, `max.wait` 2000 ms), eviction and `test.on.*` flags (`test.on.borrow` false), `jmx.enabled` (false).

## Runtime Configuration

All runtime properties are externalized to a **Spring Cloud Config Server** (from `mosip/mosip-config`). Each service bootstraps with `spring.cloud.config.uri` pointing to that server (Docker images pass it via `spring_config_url_env`, plus `spring_config_label_env` and `active_profile_env`). Key property files:

- `application-default.properties` — platform-wide settings (DB, IAM/Keycloak URLs, service URLs)
- `pre-registration-default.properties` — pre-registration specific overrides
- `registration-processor-default.properties` — registration processor overrides

The External Stage needs `mosip.regproc.external.message.expiry-time-limit` (seconds), `vertx.cluster.configuration`, `server.port` and `worker.pool.size`.

## Helm Chart (`helm/prereg-booking`)

- Chart `prereg-booking`, version `1.3.2-develop`, depends on Bitnami `common` 1.x.x
- Default image: `docker.io/mosipqa/pre-registration-booking-service:1.3.x` (`pullPolicy: Always`)
- `springServicePort: 9095`; startup/liveness/readiness probes hit `/preregistration/v1/actuator/health`
- Default resources: CPU limit `500m`, `javaOpts: "-Xms1125M -Xmx1875M"`
- Templates: deployment, service, service-account, servicemonitor, Istio virtualservice, extra-list

## ID Lifecycle Context

This repository implements pluggable components for MOSIP's **ID Lifecycle Management** — the full pipeline from identity enrollment to UIN issuance:

1. **Pre-Registration** — residents book appointments at registration centers; `pre-registration-booking-service` manages slot availability, booking, cancellation, and batch operations
2. **Registration Processor** — packets from Registration Client travel through a SEDA pipeline (Kafka-connected Vert.x stages) for validation, deduplication (ABIS), authentication, and UIN generation; the external stage and EIS allow country-specific hooks between standard stages
3. **ID Repository** — stores finalized identity records (not in this repo — upstream dependency)

External systems integrated by these modules: ClamAV (virus scanning), MSG91 (SMS notifications), Hazelcast/Redis (packet caching), Keycloak (IAM), ABIS (biometric deduplication via queues).

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **`push-trigger.yml`** — on push to `release*`, `master`, `1.*`, `develop*`, `MOSIP*`, on PRs, releases and manual dispatch; uses reusable `mosip/kattu@master-java21` workflows:
  1. Maven build for `kernel`, `pre-registration-booking-service`, both `registration-processor/*` modules, and both cache providers
  2. Docker image build/push for `pre-registration-booking-service`, `registration-processor-external-stage`, `registration-processor-external-integration-service`
  3. Publish to Maven Central (OSSRH) for `kernel`, `pre-registration-booking-service`, `cache-provider-hazelcast`, `cache-provider-redis` — skipped on `master` and PRs
  4. SonarCloud analysis (skipped on PRs) for `kernel` (`mosip_kernel-ref-idobjectvalidator`) and `pre-registration-booking-service` (`mosip_pre-registration-booking-service`)
- **`chart-lint-publish.yml`** — lints and publishes Helm charts under `helm/` to `mosip/mosip-helm` (`gh-pages`) on changes to `helm/**`
- **`use-pr-linker.yml`** — PR linking helper

## Testing

- Tests use JUnit 4 (`org.junit.Test`, run via the vintage engine), Mockito, and Vert.x unit test utilities; no JUnit 5 Jupiter tests exist
- Test sources exist in all kernel modules, `pre-registration-booking-service`, and both registration-processor modules; the cache providers have no tests
- `--add-opens` JVM flags are required and are already configured in each module's Surefire `argLine`
- `kernel-ref-idobjectvalidator` and `pre-registration-booking-service` also pass `--enable-preview`; in `kernel-ref-idobjectvalidator` the JaCoCo arg line property is `jacocoArgLine` (not `argLine`)

## API Documentation

- Pre-Registration Booking Service: https://mosip.github.io/documentation/1.2.0/pre-registration-booking-service.html
- Registration Processor External Integration Service: https://mosip.github.io/documentation/1.2.0/registration-processor-external-integration-service.html
- Product docs: https://docs.mosip.io/1.2.0/id-lifecycle-management
