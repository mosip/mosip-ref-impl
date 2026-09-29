package io.mosip.commons.packet.cache.provider.redis.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import redis.clients.jedis.JedisPoolConfig;

/**
 * Unit tests for {@link RedisConfig} bean wiring (no live Redis).
 */
class RedisConfigTest {

	private RedisConfig redisConfig;

	@BeforeEach
	void setUp() {
		redisConfig = new RedisConfig();
		ReflectionTestUtils.setField(redisConfig, "hostname", "127.0.0.1");
		ReflectionTestUtils.setField(redisConfig, "password", "secret");
		ReflectionTestUtils.setField(redisConfig, "port", 6379);
		ReflectionTestUtils.setField(redisConfig, "database", 0);
		ReflectionTestUtils.setField(redisConfig, "sslEnabled", false);
		ReflectionTestUtils.setField(redisConfig, "maxTotal", 50);
		ReflectionTestUtils.setField(redisConfig, "maxIdle", 10);
		ReflectionTestUtils.setField(redisConfig, "minIdle", 2);
		ReflectionTestUtils.setField(redisConfig, "connectTimeout", 2000);
		ReflectionTestUtils.setField(redisConfig, "readTimeout", 3500);
		ReflectionTestUtils.setField(redisConfig, "maxWaitMs", 2000L);
		ReflectionTestUtils.setField(redisConfig, "testWhileIdle", true);
		ReflectionTestUtils.setField(redisConfig, "evictionRunIntervalMs", 60000L);
		ReflectionTestUtils.setField(redisConfig, "minEvictableIdleTimeMs", 300000L);
		ReflectionTestUtils.setField(redisConfig, "numTestsPerEvictionRun", 20);
		ReflectionTestUtils.setField(redisConfig, "testOnBorrow", false);
		ReflectionTestUtils.setField(redisConfig, "testOnCreate", false);
		ReflectionTestUtils.setField(redisConfig, "testOnReturn", false);
		ReflectionTestUtils.setField(redisConfig, "blockWhenExhausted", true);
		ReflectionTestUtils.setField(redisConfig, "jmxEnabled", false);
	}

	@Test
	void jedisPoolConfigAppliesThroughputSettings() {
		JedisPoolConfig pool = redisConfig.jedisPoolConfig();
		assertEquals(50, pool.getMaxTotal());
		assertEquals(10, pool.getMaxIdle());
		assertEquals(2, pool.getMinIdle());
		assertFalse(pool.getTestOnBorrow());
		assertTrue(pool.getTestWhileIdle());
		assertFalse(pool.getJmxEnabled());
	}

	@Test
	void jedisConnectionFactoryAndTemplateAreCreated() {
		JedisConnectionFactory factory = redisConfig.jedisConnectionFactory();
		assertNotNull(factory);
		RedisTemplate<String, Object> template = redisConfig.redisTemplate();
		assertNotNull(template);
	}

	@Test
	void jedisConnectionFactoryEnablesSslWhenConfigured() {
		ReflectionTestUtils.setField(redisConfig, "sslEnabled", true);
		JedisConnectionFactory factory = redisConfig.jedisConnectionFactory();
		assertNotNull(factory);
		assertTrue(factory.isUseSsl());
	}
}
