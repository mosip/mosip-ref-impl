# cache-provider-hazelcast

MOSIP `PacketCacheProvider` SPI backed by Hazelcast, plus an Actuator health indicator.

Pins (Boot parent, Hazelcast, plugins, JaCoCo gate) live in [`pom.xml`](pom.xml) — not here.

- **Artifact**: `io.mosip.cacheprovider:cache-provider-hazelcast`
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

JaCoCo LINE covered ratio is gated in `pom.xml` (`target/site/jacoco/index.html`).

## Health

Property `packetmanager.hazelcast.disable.health.check` (`matchIfMissing = true`) controls whether the indicator is registered.

## License

[Mozilla Public License 2.0](../LICENSE) — [NOTICE](../NOTICE)
