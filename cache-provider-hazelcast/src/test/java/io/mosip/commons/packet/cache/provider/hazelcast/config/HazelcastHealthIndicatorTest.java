package io.mosip.commons.packet.cache.provider.hazelcast.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.Status;

import com.hazelcast.cluster.Cluster;
import com.hazelcast.cluster.Endpoint;
import com.hazelcast.core.HazelcastInstance;

/**
 * Unit tests for {@link HazelcastHealthIndicator}.
 */
@ExtendWith(MockitoExtension.class)
class HazelcastHealthIndicatorTest {

	@Mock
	private HazelcastInstance hazelcast;

	@Mock
	private Cluster cluster;

	@Mock
	private Endpoint endpoint;

	@Test
	void healthReportsClusterDetails() {
		UUID uuid = UUID.fromString("11111111-1111-1111-1111-111111111111");
		when(hazelcast.getName()).thenReturn("packet-cache");
		when(hazelcast.getLocalEndpoint()).thenReturn(endpoint);
		when(endpoint.getUuid()).thenReturn(uuid);
		when(hazelcast.getCluster()).thenReturn(cluster);
		when(cluster.getMembers()).thenReturn(Set.of());

		Health health = new HazelcastHealthIndicator(hazelcast).health();

		assertEquals(Status.UP, health.getStatus());
		assertEquals("packet-cache", health.getDetails().get("name"));
		assertEquals(uuid.toString(), health.getDetails().get("uuid"));
		assertEquals(0, health.getDetails().get("members"));
	}

	@Test
	void healthUsesEmptyUuidWhenLocalUuidIsNull() {
		when(hazelcast.getName()).thenReturn("packet-cache");
		when(hazelcast.getLocalEndpoint()).thenReturn(endpoint);
		when(endpoint.getUuid()).thenReturn(null);
		when(hazelcast.getCluster()).thenReturn(cluster);
		when(cluster.getMembers()).thenReturn(Set.of());

		Health health = new HazelcastHealthIndicator(hazelcast).health();

		assertEquals(Status.UP, health.getStatus());
		assertEquals("", health.getDetails().get("uuid"));
	}

	@Test
	void healthFallsBackWhenUuidApiIsMissing() {
		UUID uuid = UUID.fromString("22222222-2222-2222-2222-222222222222");
		when(hazelcast.getName()).thenReturn("packet-cache");
		when(hazelcast.getLocalEndpoint()).thenReturn(endpoint);
		when(endpoint.getUuid()).thenThrow(new NoSuchMethodError("getUuid")).thenReturn(uuid);
		when(hazelcast.getCluster()).thenReturn(cluster);
		when(cluster.getMembers()).thenReturn(Set.of());

		Health health = new HazelcastHealthIndicator(hazelcast).health();

		assertEquals(Status.UP, health.getStatus());
		assertEquals(uuid.toString(), health.getDetails().get("uuid"));
	}

	@Test
	void healthUsesEmptyUuidWhenFallbackLookupReturnsNull() {
		when(hazelcast.getName()).thenReturn("packet-cache");
		when(hazelcast.getLocalEndpoint()).thenReturn(endpoint);
		when(endpoint.getUuid()).thenThrow(new NoSuchMethodError("getUuid")).thenReturn(null);
		when(hazelcast.getCluster()).thenReturn(cluster);
		when(cluster.getMembers()).thenReturn(Set.of());

		Health health = new HazelcastHealthIndicator(hazelcast).health();

		assertEquals(Status.UP, health.getStatus());
		assertEquals("", health.getDetails().get("uuid"));
	}

	@Test
	void healthUsesEmptyUuidWhenFallbackLookupAlsoFails() {
		when(hazelcast.getName()).thenReturn("packet-cache");
		when(hazelcast.getLocalEndpoint()).thenReturn(endpoint);
		when(endpoint.getUuid()).thenThrow(new NoSuchMethodError("getUuid"));
		when(hazelcast.getCluster()).thenReturn(cluster);
		when(cluster.getMembers()).thenReturn(Set.of());

		Health health = new HazelcastHealthIndicator(hazelcast).health();

		assertEquals(Status.UP, health.getStatus());
		assertEquals("", health.getDetails().get("uuid"));
	}
}
