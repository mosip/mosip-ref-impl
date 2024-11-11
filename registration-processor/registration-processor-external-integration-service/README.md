# registration-processor-external-integration-service

## Overview
This service details used by Registration service for external integration service.

## Design
[Design - Approach for External System Integration](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_external_system_integration.md)

[Design - Approach for Adding HTTP Stage](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_http_integration.md)

## Default Context-path and Port
```
server.port=8201
server.servlet.path=/registrationprocessor/v1/eis
```

## Operations done by the Service
1. It returns boolean value true for every non-null requests

## Build & run (for developers)
The project requires JDK 21.0.3
and mvn version - 3.9.6

1. Build and install:
    ```
    $ cd registration-processor\registration-processor-external-integration-service
    $ mvn install -DskipTests=true -Dmaven.javadoc.skip=true -Dgpg.skip=true
    ```
2. Build Docker for a service:
    ```
    $ cd <service folder>
    $ docker build -f Dockerfile
    ```

## Configuration files
Registration processor external integration Service uses the following configuration files:
[Configuration-Application](https://github.com/mosip/mosip-config/blob/master/application-default.properties) and
[Configuration-Registration-processor](https://github.com/mosip/mosip-config/blob/master/registration-processor-default.properties) defined here.

Need to run the config-server along with the files mentioned above in order to run the registration processor external integration service.

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