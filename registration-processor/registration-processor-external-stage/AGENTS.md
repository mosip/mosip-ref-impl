# registration-processor-external-stage

Vert.x `ExternalStage` → EIS POST. Adapter in JAR. Pins in parent `pom.xml`.

```
registration-processor-external-stage/
├── pom.xml  Dockerfile  README.md  AGENTS.md
└── src/
    ├── main/java/io/mosip/registrationprocessor/externalstage/
    │   ├── ExternalStageApplication.java
    │   ├── stage/ExternalStage.java
    │   ├── config/Externalconfig.java
    │   ├── entity/BaseRestRequestDTO.java  MessageRequestDTO.java
    │   └── utils/StatusMessage.java
    ├── main/resources/  bootstrap.properties  logback.xml
    └── test/java/.../ExternalStageApplicationTests.java
        test/java/.../stage/ExternalStageTest.java
```
