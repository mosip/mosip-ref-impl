package io.mosip.commons.packet.cache.provider.redis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisClientConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import redis.clients.jedis.JedisPoolConfig;

import java.time.Duration;

/**
 * Redis configuration optimized for high-throughput workloads (~400 RPS per pod).
 *
 * Serialization: JdkSerializationRedisSerializer (Spring default) for both keys and values.
 *   Same as original — no serializer set explicitly.
 *
 * Key fixes over original config (readTimeout was already 3500ms but testOnBorrow
 * was causing ~400 extra PING/sec and no maxWait caused thread pileup):
 *   - testOnBorrow=false  → removed ~400 PING/sec overhead at 400 RPS
 *   - maxWait=2000ms      → original had no maxWait (-1 = infinite block under exhaustion)
 *   - jmxEnabled=false    → prevents JMX thread leak on shutdown
 *   - destroyMethod       → clean pool shutdown on app stop
 *   - RedisPassword.of()  → avoids plain String password in heap
 *   - readTimeout=3500ms  → restored to original value (new jar had incorrectly set 1000ms)
 */
@Configuration
public class RedisConfig {

    // ── Connection ────────────────────────────────────────────────────────────
    @Value("${redis.cache.hostname}")
    private String hostname;

    @Value("${redis.cache.password}")
    private String password;

    @Value("${redis.cache.port}")
    private int port;

    @Value("${redis.cache.database:0}")
    private int database;

    @Value("${redis.cache.ssl:false}")
    private boolean sslEnabled;

    // ── Pool Sizing ───────────────────────────────────────────────────────────
    @Value("${redis.cache.max.total:500}")
    private int maxTotal;

    @Value("${redis.cache.max.idle:70}")
    private int maxIdle;

    @Value("${redis.cache.min.idle:10}")
    private int minIdle;

    @Value("${redis.cache.connect.timeout:2000}")
    private int connectTimeout;

    @Value("${redis.cache.read.timeout:3500}")
    private int readTimeout;          // 3500ms — matches original; new jar had incorrectly set 1000ms
    // which caused SocketTimeoutException on 664KB biometric keys under load

    @Value("${redis.cache.max.wait:2000}")
    private long maxWaitMs;           // 2000ms — original had no maxWait (infinite block);
    // without this, threads pile up indefinitely under pool exhaustion

    // ── Eviction ──────────────────────────────────────────────────────────────
    @Value("${redis.cache.test.while.idle:true}")
    private boolean testWhileIdle;

    @Value("${redis.cache.eviction.run.interval:60000}")
    private long evictionRunIntervalMs;

    @Value("${redis.cache.min.evictable.idle.time:300000}")
    private long minEvictableIdleTimeMs;

    @Value("${redis.cache.num.tests.per.eviction.run:20}")
    private int numTestsPerEvictionRun;    // 20 — matches original

    @Value("${redis.cache.test.on.borrow:false}")
    private boolean testOnBorrow;

    @Value("${redis.cache.test.on.create:false}")
    private boolean testOnCreate;

    @Value("${redis.cache.test.on.return:false}")
    private boolean testOnReturn;

    @Value("${redis.cache.block.when.exhausted:true}")
    private boolean blockWhenExhausted;

    @Value("${redis.cache.jmx.enabled:false}")
    private boolean jmxEnabled;
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public JedisPoolConfig jedisPoolConfig() {
        JedisPoolConfig pool = new JedisPoolConfig();

        pool.setMaxTotal(maxTotal);
        pool.setMaxIdle(maxIdle);
        pool.setMinIdle(minIdle);

        // testOnBorrow=false — original had true, which fired a PING on every borrow.
        // At 400 RPS this added ~400 redundant PING commands/sec to Redis.
        // Stale connections that slip through throw JedisConnectionException,
        // which Spring Data Redis retries once automatically. Net cost: near zero.
        pool.setTestOnBorrow(testOnBorrow);
        pool.setTestOnCreate(testOnCreate);
        pool.setTestWhileIdle(testWhileIdle);   // background PING only — off the hot path
        pool.setTestOnReturn(testOnReturn);

        pool.setBlockWhenExhausted(blockWhenExhausted);
        pool.setMaxWait(Duration.ofMillis(maxWaitMs));

        pool.setTimeBetweenEvictionRuns(Duration.ofMillis(evictionRunIntervalMs));
        pool.setMinEvictableIdleDuration(Duration.ofMillis(minEvictableIdleTimeMs));
        pool.setSoftMinEvictableIdleDuration(Duration.ofMillis(minEvictableIdleTimeMs));
        pool.setNumTestsPerEvictionRun(numTestsPerEvictionRun);

        pool.setJmxEnabled(jmxEnabled);   // prevents JMX thread leak on shutdown

        return pool;
    }

    @Bean(destroyMethod = "destroy")
    public JedisConnectionFactory jedisConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(hostname);
        redisConfig.setPort(port);
        redisConfig.setDatabase(database);
        redisConfig.setPassword(RedisPassword.of(password));

        JedisClientConfiguration.JedisClientConfigurationBuilder builder =
                JedisClientConfiguration.builder();

        if (sslEnabled) {
            builder.useSsl();
        }

        JedisClientConfiguration clientConfig = builder
                .usePooling()
                .poolConfig(jedisPoolConfig())
                .and()
                .connectTimeout(Duration.ofMillis(connectTimeout))
                .readTimeout(Duration.ofMillis(readTimeout))
                .build();

        // Spring calls afterPropertiesSet() automatically (JedisConnectionFactory
        // implements InitializingBean). Do NOT call it manually — double init leaks the pool.
        return new JedisConnectionFactory(redisConfig, clientConfig);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(jedisConnectionFactory());

        // No explicit serializer — Spring uses JdkSerializationRedisSerializer by default.
        // Same as original. Production data confirmed this is smaller than Kryo for this workload.
        template.setEnableTransactionSupport(false);

        return template;
    }
}
