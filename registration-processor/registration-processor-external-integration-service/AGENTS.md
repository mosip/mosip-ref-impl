# registration-processor-external-integration-service

EIS stub REST. Authorize = `Authorization` (`SwaggerConfig`). Pins in parent `pom.xml`.

```
registration-processor-external-integration-service/
├── pom.xml  Dockerfile  README.md  AGENTS.md
└── src/
    ├── main/java/io/mosip/registrationprocessor/eis/
    │   ├── ExternalIntegrationServiceApplication.java
    │   ├── controller/ExternalController.java
    │   ├── config/SwaggerConfig.java  OpenApiProperties.java
    │   └── entity/BaseRestRequestDTO.java  MessageRequestDTO.java
    ├── main/resources/bootstrap.properties
    └── test/java/.../ExternalIntegrationControllerTest.java
        test/java/.../config/SwaggerConfigTest.java
        test/resources/application.properties
```
