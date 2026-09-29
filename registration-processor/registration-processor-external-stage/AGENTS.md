# registration-processor-external-stage

Vert.x `ExternalStage`. `EXTERNAL_STAGE_BUS_IN` → POST EIS → `EXTERNAL_STAGE_BUS_OUT`. Adapter in JAR. Pins in parent `pom.xml`.

```
registration-processor-external-stage/
├── pom.xml  Dockerfile  README.md  AGENTS.md
└── src/
    ├── main/
    │   ├── java/io/mosip/registrationprocessor/externalstage/
    │   │   ├── ExternalStageApplication.java
    │   │   ├── stage/ExternalStage.java
    │   │   ├── config/Externalconfig.java
    │   │   ├── entity/BaseRestRequestDTO.java  MessageRequestDTO.java
    │   │   └── utils/StatusMessage.java
    │   └── resources/  bootstrap.properties  logback.xml
    └── test/java/.../externalstage/
        ├── ExternalStageApplicationTests.java
        └── stage/ExternalStageTest.java
```
