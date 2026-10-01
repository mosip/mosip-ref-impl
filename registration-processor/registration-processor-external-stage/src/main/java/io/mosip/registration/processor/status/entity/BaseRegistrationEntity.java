package io.mosip.registration.processor.status.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.MappedSuperclass;

/**
 * Shadows MOSIP status-service-impl {@code BaseRegistrationEntity}. Same Hibernate 7
 * {@code @MappedSuperclass} / {@code @Inheritance} restriction as {@link BasePacketEntity}.
 *
 * @param <C> embedded id type
 */
@MappedSuperclass
public class BaseRegistrationEntity<C> {

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
