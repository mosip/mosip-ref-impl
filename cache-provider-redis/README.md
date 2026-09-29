# cache-provider-redis

MOSIP `PacketCacheProvider` SPI backed by Redis (Jedis; Lettuce excluded).

- **Artifact**: `io.mosip.cacheprovider:cache-provider-redis:1.4.1-SNAPSHOT`
- **Parent**: `spring-boot-starter-parent` **4.1.1**
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

JaCoCo LINE covered ratio **0.90** (`target/site/jacoco/index.html`). Redis: `redis.cache.hostname`, `port`, `password`, pool timeouts (see `RedisConfig`). Lettuce is excluded in favor of Jedis.

## License

[Mozilla Public License 2.0](../LICENSE) — [NOTICE](../NOTICE)
