# registration-processor-external-stage

Vert.x `ExternalStage`. `EXTERNAL_STAGE_BUS_IN` → POST EIS → `EXTERNAL_STAGE_BUS_OUT`. Adapter in JAR. Pins in parent `registration-processor/pom.xml`.

```
registration-processor-external-stage/
├── pom.xml  Dockerfile  README.md  AGENTS.md  run-local.bat  run-local.sh
└── src/
    ├── main/
    │   ├── java/io/mosip/registrationprocessor/externalstage/
    │   │   ├── ExternalStageApplication.java
    │   │   ├── stage/ExternalStage.java
    │   │   ├── config/Externalconfig.java
    │   │   ├── entity/BaseRestRequestDTO.java  MessageRequestDTO.java
    │   │   └── utils/StatusMessage.java
    │   ├── java/io/mosip/registration/processor/status/entity/  BasePacketEntity  BaseRegistrationEntity (Hibernate 7)
    │   ├── java/org/springframework/boot/web/client/  RestTemplateBuilder  RestTemplateCustomizer
    │   └── resources/  bootstrap.properties  application-local.properties  hazelcast-local.xml  logback.xml
    └── test/java/.../externalstage/
        ├── ExternalStageApplicationTests.java
        └── stage/ExternalStageTest.java
```
