package io.mosip.registration.processor.status.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.MappedSuperclass;

/**
 * Shadows MOSIP status-service-impl {@code BasePacketEntity}. Hibernate 7 rejects
 * {@code @MappedSuperclass} plus {@code @Inheritance}; Boot 4.1.1 uses Hibernate 7.
 * Fat-JAR {@code BOOT-INF/classes} is loaded before nested MOSIP jars.
 *
 * @param <C> embedded id type
 */
@MappedSuperclass
public class BasePacketEntity<C> {

	@EmbeddedId
	protected C id;

	/**
	 * @return composite id
	 */
	public C getId() {
		return id;
	}

	/**
	 * @param id composite id
	 */
	public void setId(C id) {
		this.id = id;
	}
}
