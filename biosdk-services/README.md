# Bio SDK services

This service provides implementation of IBioAPI over REST. Bio SDK client is used to provide java methods to connect with services. 

## Build
```bash
mvn clean install
```

## Build docker image
Run the Dockerfile by providing biosdk_jar_path argument where biosdk_jar_path is the path of Bio SDK jar that implements IBioApi interface methods

## Run docker image
Run the docker image by providing biosdk_class as environment variable where biosdk_class is the path of the class that implements IBioApi interface methods

```properties
mosip.sdk.biosdk.lib=<path of the class that implements IBioApi interface methods>
  ```

for example (in case of Mock SDK)
```properties
mosip.sdk.biosdk.lib=io.mosip.mock.sdk.impl.SampleSDK
```

## Swagger

<host>/swagger-ui.html