# MOSIP Reference Implementation

[![Maven Package upon a push](https://github.com/mosip/mosip-ref-impl/actions/workflows/push-trigger.yml/badge.svg?branch=master)](https://github.com/mosip/mosip-ref-impl/actions/workflows/push-trigger.yml)

## Overview
The MOSIP Reference Implementation (Ref Impl) repository contains country-specific customizations and implementations that extend the core MOSIP platform. It serves as a reference for how different countries can adapt and implement MOSIP according to their unique requirements and regulations.

## Services

The mosip-ref-impl contains the following services:

1. **[cache-provider-hazelcast](cache-provider-hazelcast)** : Hazelcast based cache provider Reference implementation
2. **[cache-provider-redis](cache-provider-redis)** : Redis based cache provider Reference implementation
3. **[kernel](kernel)** : Reference implementation for core libraries
   - **[kernel-ref-idobjectvalidator](kernel/kernel-ref-idobjectvalidator)** : Reference implementation for ID Object Validator
   - **[kernel-smsserviceprovider-msg91](kernel/kernel-smsserviceprovider-msg91)** : Reference implementation for msg91 SMS Service Provider
   - **[kernel-virusscanner-clamav](kernel/kernel-virusscanner-clamav)** : Reference implementation for clamv Virus Scanner
4. **[keycloak](keycloak)** : Reference implementation for keycloak
5. **[pre-registration-booking-service](pre-registration-booking-service)** : Reference implementation for pre-registration booking service.
6. **[registration-processor](registration-processor)** : Reference implementation for registration processor external integration.
   - **[registration-processor-external-integration-service](registration-processor/registration-processor-external-integration-service)** : Reference implementation for external integration service.
   - **[registration-processor-external-stage](registration-processor/registration-processor-external-stage)** : Reference implementation for external stage.

## Local Setup

The project can be set up in two ways:

1. [Local Setup (for Development or Contribution)](#local-setup-for-development-or-contribution)
2. [Local Setup with Docker (Easy Setup for Demos)](#local-setup-with-docker-easy-setup-for-demos)

### Prerequisites

Before you begin, ensure you have the following installed:

- **JDK**: 21.0.3
- **Maven**: 3.9.6
- **Docker**: Latest stable version
- **PostgreSQL**: 16.0
- **Keycloak**: [Check here](https://github.com/mosip/keycloak/tree/master)

### Runtime Dependencies

Add the below dependencies to the classpath, or include it as a Maven dependency in your `pom.xml`.
- `kernel-auth-adapter.jar`
- `kernel-ref-idobjectvalidator.jar`

### Configuration

- This module uses the following configuration files that are accessible in this [mosip-config repository](https://github.com/mosip/mosip-config/tree/master).
  Please refer to the required released tagged version for configuration:
  - [Configuration-registration](https://github.com/mosip/mosip-config/blob/master/registration-default.properties),
    [Configuration-pre-registration](https://github.com/mosip/mosip-config/blob/master/pre-registration-default.properties) and
    [Configuration-Application](https://github.com/mosip/mosip-config/blob/master/application-default.properties) are defined here. You need to run the config-server along with the files mentioned above.

#### Required Configuration Properties

The following properties must be configured with your environment-specific values before deployment:

**Database Configuration:**
- `mosip.registration.processor.database.hostname` - Database hostname (default: postgres-postgresql.postgres)
- `mosip.registration.processor.database.port` - Database port (default: 5432)
- `db.dbuser.password` - Database user password (passed as environment variable)

**IAM/Keycloak Configuration:**
- `keycloak.internal.url` - Internal Keycloak URL (passed as environment variable)
- `keycloak.external.url` - External Keycloak URL (passed as environment variable)
- `mosip.regproc.client.secret` - Registration processor client secret (passed as environment variable)

**Service URLs:**
- `mosip.kernel.authmanager.url` - Auth manager service URL
- `mosip.kernel.keymanager.url` - Key manager service URL
- `mosip.kernel.masterdata.url` - Masterdata service URL
- `mosip.kernel.notification.url` - Notification service URL
- `mosip.idrepo.identity.url` - ID repository identity service URL
- `mosip.api.internal.url` - Internal API base URL

## Installation

### Local Setup (for Development or Contribution)

1. Make sure the config server is running. For detailed instructions on setting up and running the config server, refer to the [MOSIP Config Server Setup Guide](https://docs.mosip.io/1.2.0/modules/registration-processor/registration-processor-developers-guide#environment-setup).

**Note**: Refer to the MOSIP Config Server Setup Guide for setup, and ensure the properties mentioned above in the configuration section are taken care of. Replace the properties with your own configurations (e.g., DB credentials, IAM credentials, URL).

2. Clone the repository:

```text
git clone <repo-url>
cd <service-name>
```

3. Build the project:

```text
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

4. Start the application:
    - Click the Run button in your IDE, or
    - Run via command: `java -jar target/specific-service:<$version>.jar`

5. Verify Swagger is accessible.

### Local Setup with Docker (Easy Setup for Demos)

#### Option 1: Pull from Docker Hub

Recommended for users who want a quick, ready-to-use setup — testers, students, and external users.

Pull the latest pre-built images from Docker Hub using the following commands:

```text
docker pull mosipid/pre-registration-booking-service:1.3.0
```

#### Option 2: Build Docker Images Locally

Recommended for contributors or developers who want to modify or build the services from source.

1. Clone and build the project:

```text
git clone <repo-url>
cd <service-name>
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

2. Navigate to each service directory and build the Docker image:

```text
cd <service-name>/<service-directory>
docker build -t <service-name> .
```

#### Running the Services

Start each service using Docker:

```text
docker run -d -p <port>:<port> --name <service-name> <service-name>
```

#### Verify Installation

Check that all containers are running:

```text
docker ps
```

Access the services at `http://localhost:<port>` using the port mappings listed above.

## Deployment

### Kubernetes

To deploy mosip ref impl services on a Kubernetes cluster, refer to the [Sandbox Deployment Guide](https://docs.mosip.io/1.2.0/deploymentnew/v3-installation).

## Usage

### Pre-reg UI

For the complete Pre-reg UI implementation and usage instructions, refer to the [Prereg UI GitHub repository](https://github.com/mosip/pre-registration-ui).

## Documentation

For more detailed documents check below links:
- [Registration Processor](https://docs.mosip.io/1.2.0/id-lifecycle-management/identity-issuance/registration-processor/overview)
- [Pre-Registration](https://docs.mosip.io/1.2.0/id-lifecycle-management/identity-issuance/pre-registration)
- [keycloak](https://docs.mosip.io/1.2.0/id-lifecycle-management/supporting-components/keycloak)
- [Common components](https://docs.mosip.io/1.2.0/setup/implementations/reference-implementations#common-components)

### API Documentation

API endpoints, base URL, and mock server details are available via Stoplight and Swagger documentation: [MOSIP Pre-Registration Service API Documentation](https://mosip.github.io/documentation/1.2.0/pre-registration-booking-service.html).

### Product Documentation

To learn more about pre-reg services from a functional perspective and use case scenarios, refer to our main documentation: [Click here](https://docs.mosip.io/1.2.0/modules/pre-registration).

## Contribution & Community

• To learn how you can contribute code to this application, [click here](https://docs.mosip.io/1.2.0/community/code-contributions).

• If you have questions or encounter issues, visit the [MOSIP Community](https://community.mosip.io/) for support.

• For any GitHub issues: [Report here](https://github.com/mosip/mosip-ref-impl/issues)

## License

This project is licensed under the [Mozilla Public License 2.0](LICENSE).
