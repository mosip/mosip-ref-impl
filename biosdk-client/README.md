# Bio SDK client

This library provides methods to connect with SDK serivces for Bio SDK related functionality. It can be used by registration client and ID authentication services to perform 1:N match, segmentation, extraction etc.

## Configuration
```properties
mosip.sdk.biosdk.host=<Bio SDK services host url>
```

for example
```properties
mosip.sdk.biosdk.host=http://localhost:9099/
```

## Build
```bash
mvn clean install
```

## Deployment

* Build the jar using maven.
* Push the jar to artifactory.
* While building ID auth related modules, use the jar artifactory url to download the image during runtime.