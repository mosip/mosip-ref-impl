# cache-provider-redis

MOSIP `PacketCacheProvider` SPI backed by Redis (Jedis; Lettuce excluded).

Pins (Boot parent, plugins, JaCoCo gate) and the module description live in [`pom.xml`](pom.xml) — not here.

- **Artifact**: `io.mosip.cacheprovider:cache-provider-redis`
- **Config**: `RedisConfig` (`redis.cache.hostname`, `port`, `password`, pool timeouts)
- **Git info**: `service-git.properties`

## Build

```text
cd cache-provider-redis
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

Drop the JAR on the packet-manager classpath.

```text
mvn clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio is gated in `pom.xml` (`target/site/jacoco/index.html`). Redis: `redis.cache.hostname`, `port`, `password`, pool timeouts (see `RedisConfig`). Lettuce is excluded in favor of Jedis.

## License

[Mozilla Public License 2.0](../LICENSE) — [NOTICE](../NOTICE)
