# cache-provider-hazelcast

`PacketCacheProvider` + Boot 4 health. Standalone pom. Pins in `pom.xml`.

```
cache-provider-hazelcast/
├── pom.xml  README.md  AGENTS.md
├── src/main/java/io/mosip/commons/packet/cache/provider/hazelcast/config/
│   └── HazelcastHealthIndicator.java    # packetmanager.hazelcast.disable.health.check
└── src/test/java/.../config/
    └── HazelcastHealthIndicatorTest.java
```
