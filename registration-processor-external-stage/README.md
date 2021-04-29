# registration-processor-external-stage

This stage integrates with external system for required external operations

## Design
[Design - Approach for External System Integration](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_external_system_integration.md)

[Design - Approach for Adding HTTP Stage](https://github.com/mosip/registration/blob/master/design/registration-processor/Approach_for_http_integration.md)

[Guideline for adding an External Stage](https://github.com/mosip/registration/blob/master/design/registration-processor/External_System_Integration_Guide.md)

## Default Context Path and Port
```
eventbus.port=5736
server.port=8095
server.servlet.path=/registrationprocessor/v1/externaleventbus.port=5736
```
## Configurable Properties from Config Server
```
EISERVICE=${mosip.base.url}/registrationprocessor/v1/eis/registration-processor/external-integration-service/v1.0
mosip.regproc.external.eventbus.kafka.commit.type=single
mosip.regproc.external.eventbus.kafka.max.poll.records=100
mosip.regproc.external.eventbus.kafka.poll.frequency=100
mosip.regproc.external.eventbus.kafka.group.id=external-stage
mosip.regproc.external.message.expiry-time-limit=${mosip.regproc.common.stage.message.expiry-time-limit}

mosip.regproc.external.eventbus.port=5736
mosip.regproc.external.server.port=8095
mosip.regproc.external.server.servlet.path=/registrationprocessor/v1/external
```
## Operations in External stage
External validation by sending requests to external integration system
