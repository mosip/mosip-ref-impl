# Bio SDK services

This service provides implementation of IBioAPI over REST. Bio SDK client is used to provide java methods to connect with services. 

## Requirements:
* Java version = 11.X.X
* Maven version >= 3.6

## Run jar directly

### Build

Go to biosdk-services folder and run the below command, this will create a jar file in target folder
```text
mvn clean install
```

### Run jar

```text
java -Dloader.path=<biosdk jar provided by third-party vendors> -Dbiosdk_bioapi_impl=<classpath of class that implements IBioApi interface> -jar biosdk-services-<version>.jar
```

For example:
```text
java -Dloader.path=mock-sdk.jar -Dbiosdk_bioapi_impl=io.mosip.mock.sdk.impl.SampleSDK -jar biosdk-services-1.1.3.jar
```

### Check service status
```text
http://{host}:9099/biosdk-service

In case of localhost:
http://localhost:9099/biosdk-service
```
You will see response like 
```text
Service is running... Fri Jan 29 08:49:28 UTC 2021

```

## Run as docker

### Build docker image

Build the Dockerfile to create docker image

### Run docker image

Run the docker image by providing:
* biosdk_zip_url (environment variable), url for third-party biosdk library zip file 
* biosdk_bioapi_impl (environment variable) where biosdk_zip_url is the path of the class that implements IBioApi interface methods


### Check service status
```text
http://{host}:9099/biosdk-service

In case of localhost:
http://localhost:9099/biosdk-service
```
You will see response like 
```text
Service is running... Fri Jan 29 08:49:28 UTC 2021

```

## Swagger UI for exposed APIs
```text
http://{host}:9099/biosdk-service/swagger-ui.html

In case of localhost:
http://localhost:9099/biosdk-service/swagger-ui.html
```

## Specifications

### Spec 1.0
