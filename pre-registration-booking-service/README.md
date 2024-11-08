# Pre-registration Booking Service

## Overview
This service details used by Pre-Registration portal to book an appointment by providing his/her basic appointment details

## Databases
Refer to [SQL scripts](https://github.com/mosip/pre-registration/tree/develop/db_scripts).

## Build & run (for developers)
The project requires JDK 21.0.3
and mvn version - 3.9.6

1. Build and install:
    ```
    $ cd pre-registration-booking-service
    $ mvn install -DskipTests=true -Dmaven.javadoc.skip=true -Dgpg.skip=true
    ```
2. Build Docker for a service:
    ```
    $ cd <service folder>
    $ docker build -f Dockerfile
    ```

### Remove the version-specific suffix (PostgreSQL95Dialect) from the Hibernate dialect configuration
   ```
   hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
   ```
This is for better compatibility with future PostgreSQL versions.

### Configure ANT Path Matcher for Spring Boot 3.x compatibility.
   ```
   spring.mvc.pathmatch.matching-strategy=ANT_PATH_MATCHER
   ```
This is to maintain compatibility with existing ANT-style path patterns.

### Add auth-adapter in a class-path to run a master-data service
   ```
   <dependency>
       <groupId>io.mosip.kernel</groupId>
       <artifactId>kernel-auth-adapter</artifactId>
       <version>${kernel.auth.adapter.version}</version>
   </dependency>
   ```

## Configuration files
Pre-registration Service uses the following configuration files:
```
application-default.properties
pre-registration-default.properties
```
Need to run the config-server along with the files mentioned above in order to run the master-data service.

## Configuration
[Configuration-Application](https://github.com/mosip/mosip-config/blob/develop/application-default.properties) and
[Configuration-Pre-registration](https://github.com/mosip/mosip-config/blob/develop/pre-registration-default.properties) defined here.

Refer [Module Configuration](https://docs.mosip.io/1.2.0/modules/module-configuration) for location of these files.

## Default context, path, port
Refer to [bootstrap properties](src/main/resources/bootstrap.properties)

## Deployment in K8 cluster with other MOSIP services:
### Pre-requisites
* Set KUBECONFIG variable to point to existing K8 cluster kubeconfig file:
    ```
    export KUBECONFIG=~/.kube/<k8s-cluster.config>
    ```
### Install
  ```
    $ cd deploy
    $ ./install.sh
   ```
### Delete
  ```
    $ cd deploy
    $ ./delete.sh
   ```
### Restart
  ```
    $ cd deploy
    $ ./restart.sh
   ```

## APIs
API documentation is available [here](https://mosip.github.io/documentation/).

## License
This project is licensed under the terms of [Mozilla Public License 2.0](LICENSE).