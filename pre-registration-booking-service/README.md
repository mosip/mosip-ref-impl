# Pre-registration Booking Service

## Overview
This service details used by Pre-Registration portal to book an appointment by providing his/her basic appointment details

## Databases
Refer to the required released tagged version [SQL scripts](https://github.com/mosip/pre-registration/tree/master/db_scripts).

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

### Add auth-adapter in a class-path to run a master-data service
   ```
   <dependency>
       <groupId>io.mosip.kernel</groupId>
       <artifactId>kernel-auth-adapter</artifactId>
       <version>${kernel.auth.adapter.version}</version>
   </dependency>
   <dependency>
       <groupId>io.mosip.kernel</groupId>
       <artifactId>kernel-ref-idobjectvalidator</artifactId>
       <version>${kernel.ref.idobjectvalidator.version}</version>
   </dependency>
   ```

## Configuration files
Pre-registration Service uses the following configuration files:
[Configuration-Application](https://github.com/mosip/mosip-config/blob/master/application-default.properties) and
[Configuration-Pre-registration](https://github.com/mosip/mosip-config/blob/master/pre-registration-default.properties) defined here.
Refer to the required released tagged version.

Need to run the config-server along with the files mentioned above in order to run the pre-registration booking service.

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
This project is licensed under the terms of [Mozilla Public License 2.0](https://github.com/mosip/mosip-ref-impl/blob/master/LICENSE).