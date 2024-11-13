# registration-processor-external-stage

## Overview
This stage integrates with external system for required external operations

## Design
[Design - Approach for External System Integration](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_external_system_integration.md)

[Design - Approach for Adding HTTP Stage](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_http_integration.md)

[Guideline for adding an External Stage](https://github.com/mosip/registration/blob/master/design/registration-processor/External_System_Integration_Guide.md)

## Default Context Path and Port
```
eventbus.port=5736
server.port=8095
server.servlet.path=/registrationprocessor/v1/externaleventbus.port=5736
```
## Configurable Properties from Config Server
```
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
## Operations in External stage
External validation by sending requests to external integration system

## Build & run (for developers)
The project requires JDK 21.0.3
and mvn version - 3.9.6

1. Build and install:
    ```
    $ cd registration-processor\registration-processor-external-stage
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
   ```

## Configuration files
Registration processor external stage uses the following configuration files:
[Configuration-Application](https://github.com/mosip/mosip-config/blob/master/application-default.properties) and
[Configuration-Registration-processor](https://github.com/mosip/mosip-config/blob/master/registration-processor-default.properties) defined here.
 Refer to the required released tagged version.

Need to run the config-server along with the files mentioned above in order to run the registration processor external stage service.

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

## License
This project is licensed under the terms of [Mozilla Public License 2.0](https://github.com/mosip/mosip-ref-impl/blob/master/LICENSE).