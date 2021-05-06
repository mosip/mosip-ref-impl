# Bio SDK client

This library provides methods to connect with SDK serivces for Bio SDK related functionality. It can be used by ID authentication & ID repo services to perform 1:N match, segmentation, extraction etc.

It is used by:
* authentication-internal-service
* authentication-kyc-service
* authentication-service
* idrepo-bioextractor-service

## Requirements:
* Java version = 11.X.X
* Maven version >= 3.6

## Configuration
```properties
mosip_biosdk_service=<Bio SDK service url>
```

for example
```properties
mosip_biosdk_service=http://localhost:9099/biosdk-service/
```

### Build

Go to biosdk-client folder and run the below command, this will create a jar file in target folder
```text
mvn clean install
```

## Deployment

There are multiple ways to deploy biosdk-client with mosip-services. According to mosip-infra 1.1.3, it can be deployed via following steps.

### Create install script

Create a bash script file and save it as "install.sh", sample is given below:

```text
#!/bin/bash

#installs the Bio-SDK
set -e

echo "Installating Mock Bio-SDK.."

export work_dir_env=/

cp biosdk-client-*.jar $work_dir_env

export loader_path_env=biosdk-client-1.1.3-jar-with-dependencies.jar

echo "Installating Mock Bio-SDK completed."
```

### Prepare biosdk.zip

* Keep both biosdk-client-x.x.x-jar-with-dependencies.jar & install.sh in same folder, then create a zip file, name as "biosdk.zip"
* Put the biosdk.zip to the artifactory docker

** For info on deployment, follow [https://github.com/mosip/mosip-infra](https://github.com/mosip/mosip-infra).

** Remember we have to pass "mosip_biosdk_service" as environment variable while running the dockers that use biosdk-client.