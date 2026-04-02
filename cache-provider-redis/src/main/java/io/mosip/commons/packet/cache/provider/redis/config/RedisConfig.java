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
 * Redis Configuration for MOSIP Packet Cache optimized for high-throughput workloads.
 * <p>
 * This configuration is tuned for approximately 400 requests per second (RPS) per pod,
 * with careful attention to connection pooling, timeout settings, and performance overhead.
 * </p>
 *
 * <h2>Key Optimizations:</h2>
 * <ul>
 *   <li>{@code testOnBorrow=false} - Eliminates ~400 redundant PING commands per second under load</li>
 *   <li>{@code maxWait=2000ms} - Prevents indefinite thread blocking when pool is exhausted</li>
 *   <li>{@code jmxEnabled=false} - Avoids JMX thread leaks during application shutdown</li>
 *   <li>{@code readTimeout=3500ms} - Restored to safe value for large objects (e.g., 664KB biometric data)</li>
 *   <li>Proper pool destruction via {@code destroyMethod="destroy"}</li>
 *   <li>Secure password handling using {@link RedisPassword#of(String)}</li>
 * </ul>
 *
 * <p><b>Serialization Strategy:</b> Uses Spring's default {@code JdkSerializationRedisSerializer}
 * for both keys and values (no custom serializer configured). This was validated to be
 * more efficient than Kryo for the current workload.</p>
 *
 * @author MOSIP Commons Team
 * @since 1.0
 */
@Configuration
public class RedisConfig {

    // ─────────────────────────────────────────────────────────────────────────
    // Connection Properties
    // ─────────────────────────────────────────────────────────────────────────

    /** Redis server hostname */
    @Value("${redis.cache.hostname}")
    private String hostname;

    /** Redis authentication password */
    @Value("${redis.cache.password}")
    private String password;

    /** Redis server port */
    @Value("${redis.cache.port}")
    private int port;

    /** Redis database index (default: 0) */
    @Value("${redis.cache.database:0}")
    private int database;

    /** Enable SSL/TLS for Redis connection */
    @Value("${redis.cache.ssl:false}")
    private boolean sslEnabled;

    // ─────────────────────────────────────────────────────────────────────────
    // Pool Configuration
    // ─────────────────────────────────────────────────────────────────────────

    /** Maximum number of connections in the pool */
    @Value("${redis.cache.max.total:500}")
    private int maxTotal;

    /** Maximum number of idle connections in the pool */
    @Value("${redis.cache.max.idle:70}")
    private int maxIdle;

    /** Minimum number of idle connections to maintain */
    @Value("${redis.cache.min.idle:10}")
    private int minIdle;

    /** Connection establishment timeout in milliseconds */
    @Value("${redis.cache.connect.timeout:2000}")
    private int connectTimeout;

    /**
     * Socket read timeout in milliseconds.
     * Increased to 3500ms to handle large objects (e.g., biometric data ~664KB)
     * without triggering SocketTimeoutException under load.
     */
    @Value("${redis.cache.read.timeout:3500}")
    private int readTimeout;

    /**
     * Maximum time to wait for a connection from the pool when exhausted.
     * Prevents threads from blocking indefinitely (original default was -1 = infinite).
     */
    @Value("${redis.cache.max.wait:2000}")
    private long maxWaitMs;

    // ─────────────────────────────────────────────────────────────────────────
    // Eviction & Health Check Settings
    // ─────────────────────────────────────────────────────────────────────────

    /** Test connection while idle using background PING */
    @Value("${redis.cache.test.while.idle:true}")
    private boolean testWhileIdle;

    /** Time between eviction runs in milliseconds */
    @Value("${redis.cache.eviction.run.interval:60000}")
    private long evictionRunIntervalMs;

    /** Minimum idle time before a connection can be evicted */
    @Value("${redis.cache.min.evictable.idle.time:300000}")
    private long minEvictableIdleTimeMs;

    /** Number of idle connections to test per eviction run */
    @Value("${redis.cache.num.tests.per.eviction.run:20}")
    private int numTestsPerEvictionRun;

    /** Test connection on borrow (disabled to reduce PING overhead) */
    @Value("${redis.cache.test.on.borrow:false}")
    private boolean testOnBorrow;

    /** Test connection on create */
    @Value("${redis.cache.test.on.create:false}")
    private boolean testOnCreate;

    /** Test connection on return to pool */
    @Value("${redis.cache.test.on.return:false}")
    private boolean testOnReturn;

    /** Block thread when pool is exhausted until a connection becomes available */
    @Value("${redis.cache.block.when.exhausted:true}")
    private boolean blockWhenExhausted;

    /** Enable JMX monitoring (disabled to prevent thread leaks on shutdown) */
    @Value("${redis.cache.jmx.enabled:false}")
    private boolean jmxEnabled;

    // ─────────────────────────────────────────────────────────────────────────
    // Bean Definitions
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates and configures the Jedis pool configuration optimized for high throughput.
     *
     * @return configured {@link JedisPoolConfig}
     */
    @Bean
    public JedisPoolConfig jedisPoolConfig() {
        JedisPoolConfig pool = new JedisPoolConfig();

        pool.setMaxTotal(maxTotal);
        pool.setMaxIdle(maxIdle);
        pool.setMinIdle(minIdle);

        pool.setTestOnBorrow(testOnBorrow);      // false = avoids PING on every borrow
        pool.setTestOnCreate(testOnCreate);
        pool.setTestWhileIdle(testWhileIdle);    // background validation only
        pool.setTestOnReturn(testOnReturn);

        pool.setBlockWhenExhausted(blockWhenExhausted);
        pool.setMaxWait(Duration.ofMillis(maxWaitMs));

        pool.setTimeBetweenEvictionRuns(Duration.ofMillis(evictionRunIntervalMs));
        pool.setMinEvictableIdleDuration(Duration.ofMillis(minEvictableIdleTimeMs));
        pool.setSoftMinEvictableIdleDuration(Duration.ofMillis(minEvictableIdleTimeMs));
        pool.setNumTestsPerEvictionRun(numTestsPerEvictionRun);

        pool.setJmxEnabled(jmxEnabled); // Prevents JMX thread leak during shutdown

        return pool;
    }

    /**
     * Creates the Jedis-based connection factory with standalone Redis configuration.
     * <p>
     * Note: Do not call {@code afterPropertiesSet()} manually. Spring handles it
     * automatically as {@link JedisConnectionFactory} implements {@code InitializingBean}.
     * Manual invocation can cause pool leaks.
     * </p>
     *
     * @return configured {@link JedisConnectionFactory}
     */
    @Bean(destroyMethod = "destroy")
    public JedisConnectionFactory jedisConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(hostname);
        redisConfig.setPort(port);
        redisConfig.setDatabase(database);
        redisConfig.setPassword(RedisPassword.of(password)); // Secure password handling

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

        return new JedisConnectionFactory(redisConfig, clientConfig);
    }

    /**
     * Creates the RedisTemplate for interacting with Redis.
     * <p>
     * Uses Spring's default serializer ({@code JdkSerializationRedisSerializer})
     * for both keys and values. No custom serializers are set to maintain
     * compatibility with existing MOSIP packet cache behavior.
     * </p>
     *
     * @return configured {@link RedisTemplate}
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(jedisConnectionFactory());
        template.setEnableTransactionSupport(false);

        // No explicit serializer set → defaults to JdkSerializationRedisSerializer
        // (Confirmed optimal for this workload compared to Kryo)

        return template;
    }
}