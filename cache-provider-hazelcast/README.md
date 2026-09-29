# cache-provider-hazelcast

MOSIP `PacketCacheProvider` SPI backed by Hazelcast, plus an Actuator health indicator.

- **Artifact**: `io.mosip.cacheprovider:cache-provider-hazelcast:1.4.1-SNAPSHOT`
- **Parent**: `spring-boot-starter-parent` **4.1.1**
- **Hazelcast**: 5.7.0
- **Health**: `HazelcastHealthIndicator` (`org.springframework.boot.health.contributor` — Boot 4)
- **Git info**: `service-git.properties`

## Build

```text
cd cache-provider-hazelcast
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

Drop the JAR on the packet-manager classpath (scope of `spring-boot-starter` / actuator is `provided`).

```text
mvn clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio **0.90** (`target/site/jacoco/index.html`).

## Health

Property `packetmanager.hazelcast.disable.health.check` (`matchIfMissing = true`) controls whether the indicator is registered.

## License

[Mozilla Public License 2.0](../LICENSE) — [NOTICE](../NOTICE)
