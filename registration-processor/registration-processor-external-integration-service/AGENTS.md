# registration-processor-external-integration-service

EIS stub. `POST .../v1.0` → `true` if body non-null. Swagger Authorize = `Authorization` apiKey (`SwaggerConfig`). Pins in parent `registration-processor/pom.xml`.

```
registration-processor-external-integration-service/
├── pom.xml  Dockerfile  README.md  AGENTS.md  run-local.bat  run-local.sh
└── src/
    ├── main/
    │   ├── java/io/mosip/registrationprocessor/eis/
    │   │   ├── ExternalIntegrationServiceApplication.java
    │   │   ├── controller/ExternalController.java
    │   │   ├── config/SwaggerConfig.java  OpenApiProperties.java
    │   │   └── entity/BaseRestRequestDTO.java  MessageRequestDTO.java
    │   └── resources/bootstrap.properties  application-local.properties
    └── test/
        ├── java/.../eis/
        │   ├── ExternalIntegrationControllerTest.java
        │   └── config/SwaggerConfigTest.java
        └── resources/application.properties
```
