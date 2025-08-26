package io.mosip.commons.packet.cache.provider.redis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisClientConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import redis.clients.jedis.JedisPoolConfig;

import java.time.Duration;

@Configuration
public class RedisConfig {

    @Value("${redis.cache.hostname}")
    private String hostname;

    @Value("${redis.cache.password}")
    private String password;

    @Value("${redis.cache.port}")
    private int port;

    @Value("${redis.cache.max.total:500}")
    private int maxTotal;

    @Value("${redis.cache.max.idle:70}")
    private int maxIdle;

    @Value("${redis.cache.min.idle:10}")
    private int minIdle;

    @Value("${redis.cache.connect.timeout:2000}")
    private int connectTimeout;

    @Value("${redis.cache.read.timeout:3500}")
    private int readTimeout;

    /**
     * Creates a JedisConnectionFactory bean for Redis connection.
     *
     * @return JedisConnectionFactory
     */
    @Bean
    public JedisConnectionFactory jedisConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(hostname);
        redisConfig.setPort(port);
        redisConfig.setPassword(password);
        JedisPoolConfig jedisPoolConfig=new JedisPoolConfig();
        jedisPoolConfig.setMaxTotal(maxTotal);
        jedisPoolConfig.setMaxIdle(maxIdle);
        jedisPoolConfig.setMinIdle(minIdle);
        jedisPoolConfig.setTestOnBorrow(true);


        JedisClientConfiguration clientConfig = JedisClientConfiguration.builder()
                .usePooling()
                .poolConfig(jedisPoolConfig)
                .and()
                .connectTimeout(Duration.ofMillis(connectTimeout))
                .readTimeout(Duration.ofMillis(readTimeout))
                .build();
        return new JedisConnectionFactory(redisConfig, clientConfig);
    }


    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(jedisConnectionFactory());
        return template;
    }

}