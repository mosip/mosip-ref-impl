package io.mosip.commons.packet.cache.provider.hazelcast.config;

import java.lang.reflect.Method;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.health.contributor.AbstractHealthIndicator;
import org.springframework.boot.health.contributor.Health;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;

import com.hazelcast.core.HazelcastInstance;

/**
 * Actuator health check for the Hazelcast instance used by packet cache.
 * <p>
 * Registered when {@code packetmanager.hazelcast.disable.health.check} is unset or true
 * ({@code matchIfMissing = true}). Reports cluster name, local UUID, and member count.
 * Uses Boot 4 {@code org.springframework.boot.health.contributor} types.
 * </p>
 */
@Component
@ConditionalOnProperty(value = "packetmanager.hazelcast.disable.health.check", matchIfMissing = true)
public class HazelcastHealthIndicator extends AbstractHealthIndicator {

	/** Shared Hazelcast node injected by the host packet-manager application. */
	private final HazelcastInstance hazelcast;

	/**
	 * @param hazelcast running Hazelcast instance
	 */
	public HazelcastHealthIndicator(HazelcastInstance hazelcast) {
		super("Hazelcast health check failed");
		this.hazelcast = hazelcast;
	}

	/**
	 * Marks the component UP and attaches cluster diagnostics.
	 *
	 * @param builder Spring Boot health builder
	 */
	@Override
	protected void doHealthCheck(Health.Builder builder) {
		String uuid = extractUuid();
		builder.up()
				.withDetail("name", this.hazelcast.getName())
				.withDetail("uuid", uuid == null ? "" : uuid)
				.withDetail("members", this.hazelcast.getCluster().getMembers().size());
	}

	/**
	 * Resolves the local member UUID, including a fallback for older Hazelcast APIs.
	 *
	 * @return UUID string, empty-safe {@code null} if the API is missing or nested lookup fails
	 */
	private String extractUuid() {
		try {
			UUID uuid = this.hazelcast.getLocalEndpoint().getUuid();
			return uuid == null ? null : uuid.toString();
		} catch (NoSuchMethodError ex) {
			try {
				Method endpointAccessor = ReflectionUtils.findMethod(HazelcastInstance.class, "getLocalEndpoint");
				Object endpoint = ReflectionUtils.invokeMethod(endpointAccessor, this.hazelcast);
				Method uuidAccessor = ReflectionUtils.findMethod(endpoint.getClass(), "getUuid");
				Object uuid = ReflectionUtils.invokeMethod(uuidAccessor, endpoint);
				return uuid == null ? null : uuid.toString();
			} catch (RuntimeException | Error nested) {
				return null;
			}
		}
	}
}
