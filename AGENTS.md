# CLAUDE.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

This is the **MOSIP Reference Implementation** (`mosip-ref-impl`) — a collection of country-deployable, pluggable implementations that extend the core MOSIP (Modular Open Source Identity Platform). It does **not** contain core platform logic; instead it provides concrete, replaceable implementations of interfaces defined upstream (in `mosip/mosip-platform`, `mosip/kernel`, etc.).

Each module in this repo is an independently buildable Maven project published to Maven Central (OSSRH). Downstream deployments wire these JARs in via Spring `spring.factories` auto-configuration or explicit `pom.xml` dependencies.

## Build Commands

Each module has its own `pom.xml`. There is **no root parent pom** — build each top-level directory independently:

```bash
# Build a top-level module (skip GPG and Javadoc for local dev)
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true

# Run tests for a specific module
mvn test -pl <module-path>

# Run a single test class
mvn test -Dtest=ClassName

# Run a single test method
mvn test -Dtest=ClassName#methodName

# Generate coverage report (output: target/site/jacoco/index.html)
mvn clean verify

# SonarCloud analysis
mvn clean verify -Psonar
```

**Prerequisites:** JDK 21.0.3, Maven 3.9.6. Tests use `--add-opens` JVM args (configured in each `pom.xml`) for Java 21 module compatibility.

## Module Map

```
mosip-ref-impl/
├── kernel/
│   ├── kernel-ref-idobjectvalidator/   # Reference ID Object Validator (JSON schema + masterdata validation)
│   ├── kernel-smsserviceprovider-msg91/ # SMS via MSG91 API
│   └── kernel-virusscanner-clamav/     # ClamAV virus scanner integration
├── cache-provider-hazelcast/           # Hazelcast cache provider (with health indicator)
├── cache-provider-redis/               # Redis cache provider
├── pre-registration-booking-service/   # Appointment booking service for pre-registration portal
├── registration-processor/
│   ├── registration-processor-external-stage/             # Custom Vert.x stage: delegates to EIS
│   └── registration-processor-external-integration-service/ # REST stub for the external stage to call
├── keycloak/                           # Keycloak theme + SPI customizations
└── helm/prereg-booking/                # Helm chart for pre-registration booking service
```

## Architecture

### Design Pattern

Every module implements a **SPI interface** defined in `mosip/kernel` or `mosip/registration-processor-core`. The interface is resolved at runtime via Spring `spring.factories` (for kernel SPIs) or `@Autowired` injection (for Spring Boot services). To replace an implementation, swap the JAR — no core platform changes required.

### Pre-Registration Booking Service

A standalone **Spring Boot 3.x** REST service (`BookingApplication`). Key characteristics:

- Entry point: `io.mosip.preregistration.booking.BookingApplication`
- All REST endpoints are in `BookingController` under `/appointment/**`
- Role-based access uses `@PreAuthorize("hasAnyRole(@authorizedRoles.get...())")` — roles are resolved from a Spring bean, not hardcoded strings
- Depends on upstream pre-registration core library (`io.mosip.preregistration:preregistration-core`) for DTOs and utilities
- Requires `kernel-auth-adapter.jar` on the classpath at runtime to inject MOSIP auth tokens on outbound REST calls
- Requires `kernel-ref-idobjectvalidator.jar` for ID schema validation
- Config files: `application-default.properties` and `pre-registration-default.properties` from `mosip/mosip-config`, served by a running Spring Cloud Config Server

### Registration Processor External Stage + Integration Service

These two modules work as a pair to enable **custom business logic hooks** inside the registration packet processing pipeline:

1. **`registration-processor-external-stage`** — a Vert.x verticle (`ExternalStage extends MosipVerticleAPIManager`) that sits in the packet pipeline. It:
   - Consumes from `EXTERNAL_STAGE_BUS_IN` Kafka topic
   - Makes a synchronous POST to the `EISERVICE` API endpoint (the External Integration Service below)
   - Forwards `true` (success) or `false` (failure) to update registration status
   - Produces to `EXTERNAL_STAGE_BUS_OUT`
   - Property prefix: `mosip.regproc.external.`

2. **`registration-processor-external-integration-service`** — a Spring Boot REST service that receives the POST from the external stage at `/registration-processor/external-integration-service/v1.0`. The bundled implementation is a **stub** that always returns `true` if the request body is non-null. Implementers replace this service with real country-specific business logic.

The stage follows the standard MOSIP stage pattern: extend `MosipVerticleAPIManager`, implement `process(MessageDTO)`, override `getPropertyPrefix()`.

### Kernel Reference Implementations

| Module | SPI Implemented | Key Config |
|--------|----------------|------------|
| `kernel-ref-idobjectvalidator` | `IdObjectValidator` | Validates identity JSON against a JSON Schema; fetches masterdata values (document types, locations, languages) from the Masterdata Service; configurable cron-based cache refresh via `mosip.idobjectvalidator.scheduler.reset-cache.cron-job-pattern` |
| `kernel-smsserviceprovider-msg91` | SMS SPI | Calls MSG91 REST API; loaded via `spring.factories` |
| `kernel-virusscanner-clamav` | `VirusScanner<Boolean, InputStream>` | Connects to a running ClamAV daemon; configured via `mosip.kernel.virus-scanner.host` and `mosip.kernel.virus-scanner.port`; loaded via `spring.factories` |

### Cache Providers

Both `cache-provider-hazelcast` and `cache-provider-redis` implement MOSIP's `PacketCacheProvider` SPI. The Hazelcast provider includes a custom Spring Boot Actuator health indicator (`HazelcastHealthIndicator`), disabled via `packetmanager.hazelcast.disable.health.check=false`.

## Runtime Configuration

All runtime properties are externalized to a **Spring Cloud Config Server** (from `mosip/mosip-config`). Each service bootstraps with `spring.cloud.config.uri` pointing to that server. Key property files:

- `application-default.properties` — platform-wide settings (DB, IAM/Keycloak URLs, service URLs)
- `pre-registration-default.properties` — pre-registration specific overrides
- `registration-processor-default.properties` — registration processor overrides

The External Stage needs `mosip.regproc.external.message.expiry-time-limit` (seconds) and Vert.x cluster config (`vertx.cluster.configuration`).

## ID Lifecycle Context

This repository implements pluggable components for MOSIP's **ID Lifecycle Management** — the full pipeline from identity enrollment to UIN issuance:

1. **Pre-Registration** — residents book appointments at registration centers; `pre-registration-booking-service` manages slot availability, booking, cancellation, and batch operations
2. **Registration Processor** — packets from Registration Client travel through a SEDA pipeline (Kafka-connected Vert.x stages) for validation, deduplication (ABIS), authentication, and UIN generation; the external stage and EIS allow country-specific hooks between standard stages
3. **ID Repository** — stores finalized identity records (not in this repo — upstream dependency)

External systems integrated by these modules: ClamAV (virus scanning), MSG91 (SMS notifications), Hazelcast/Redis (packet caching), Keycloak (IAM), ABIS (biometric deduplication via queues).

## CI/CD

GitHub Actions (`.github/workflows/push-trigger.yml`) triggers on push to `develop`, `master`, `release*`, and `MOSIP*` branches via the reusable `mosip/kattu@master-java21` workflow:

1. Maven build (Java 21)
2. Docker image build and push to Docker Hub (for `pre-registration-booking-service`, `registration-processor-external-stage`, `registration-processor-external-integration-service`)
3. Publish to Maven Central (OSSRH) — skipped on `master` and PRs
4. SonarCloud analysis (skipped on PRs) — project key per module (e.g., `mosip_kernel-ref-idobjectvalidator`, `mosip_pre-registration-booking-service`)

Kubernetes deployment uses Helm chart in `helm/prereg-booking/`.

## Testing

- Tests use JUnit 4 (vintage engine), Mockito, and Vert.x unit test utilities
- `--add-opens` JVM flags are required and are already configured in each module's `pom.xml` Surefire configuration
- The `kernel-ref-idobjectvalidator` tests use `--enable-preview`; the property name for the JaCoCo arg line is `jacocoArgLine` (not `argLine`) in that module

## API Documentation

- Pre-Registration Booking Service: https://mosip.github.io/documentation/1.2.0/pre-registration-booking-service.html
- Registration Processor External Integration Service: https://mosip.github.io/documentation/1.2.0/registration-processor-external-integration-service.html
- Product docs: https://docs.mosip.io/1.2.0/id-lifecycle-management
