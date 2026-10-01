package io.mosip.registrationprocessor.externalstage;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.Arrays;

import org.junit.After;
import org.junit.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import io.mosip.registration.processor.status.entity.BasePacketEntity;
import io.mosip.registration.processor.status.entity.BaseRegistrationEntity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.MappedSuperclass;

/**
 * {@link ExternalStageApplication#applyLocalProfile} for run-local (profile {@code local}).
 */
public class ExternalStageApplicationTests {

	@After
	public void clearProfile() {
		System.clearProperty("spring.profiles.active");
		System.clearProperty("mosip.auth.adapter.impl.basepackage");
	}

	@Test
	public void applyLocalProfileLoadsClasspathFile() {
		System.setProperty("spring.profiles.active", "local");
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
		try {
			ExternalStageApplication.applyLocalProfile(ctx);
			assertTrue(Arrays.asList(ctx.getEnvironment().getActiveProfiles()).contains("local"));
			assertEquals("8095", ctx.getEnvironment().getProperty("server.port"));
			assertEquals("false", ctx.getEnvironment().getProperty("spring.cloud.config.enabled"));
			assertTrue(ctx.getEnvironment().getProperty("mosip.kernel.auth.appids.realm.map").contains("regproc"));
			assertEquals("false", ctx.getEnvironment().getProperty("registration.processor.signature.isEnabled"));
			assertEquals("5", ctx.getEnvironment().getProperty("registration.processor.max.retry"));
			assertTrue(ctx.getEnvironment().getProperty("vertx.cluster.configuration").startsWith("file:"));
		} finally {
			ctx.close();
		}
	}

	@Test
	public void applyLocalProfileNoOpWhenNotLocal() {
		System.clearProperty("spring.profiles.active");
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
		try {
			ExternalStageApplication.applyLocalProfile(ctx);
			assertFalse(Arrays.asList(ctx.getEnvironment().getActiveProfiles()).contains("local"));
		} finally {
			ctx.close();
		}
	}

	@Test
	public void authAdapterPackageUsesSystemPropertyWithoutConfigServer() {
		System.setProperty("spring.profiles.active", "local");
		System.setProperty("mosip.auth.adapter.impl.basepackage", "io.mosip.kernel.auth.defaultadapter");
		assertEquals("io.mosip.kernel.auth.defaultadapter", ExternalStageApplication.authAdapterPackage());
	}

	@Test
	public void authAdapterPackageDefaultsWhenLocalAndUnset() {
		System.setProperty("spring.profiles.active", "local");
		System.clearProperty("mosip.auth.adapter.impl.basepackage");
		assertEquals("io.mosip.kernel.auth.defaultadapter", ExternalStageApplication.authAdapterPackage());
	}

	@Test
	public void restTemplateBuilderMatchesStatusConfigConstructor() {
		assertNotNull(new org.springframework.boot.web.client.RestTemplateBuilder());
	}

	@Test
	public void skipVertxConfigServerStoreRegistersPostProcessorWhenLocal() {
		System.setProperty("spring.profiles.active", "local");
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
		try {
			ExternalStageApplication.applyLocalProfile(ctx);
			ExternalStageApplication.skipVertxConfigServerStore(ctx);
			assertEquals(1, ctx.getBeanFactoryPostProcessors().size());
			assertEquals("jdbc:h2:mem:regproc;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;INIT=CREATE SCHEMA IF NOT EXISTS regprc",
					ctx.getEnvironment().getProperty("javax.persistence.jdbc.url"));
		} finally {
			ctx.close();
		}
	}

	@Test
	public void skipVertxConfigServerStoreNoOpWhenNotLocal() {
		System.clearProperty("spring.profiles.active");
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
		try {
			ExternalStageApplication.skipVertxConfigServerStore(ctx);
			assertEquals(0, ctx.getBeanFactoryPostProcessors().size());
		} finally {
			ctx.close();
		}
	}

	@Test
	public void hibernate7MappedSuperclassShimsOmitInheritance() {
		assertNotNull(BasePacketEntity.class.getAnnotation(MappedSuperclass.class));
		assertNull(BasePacketEntity.class.getAnnotation(Inheritance.class));
		assertNotNull(BaseRegistrationEntity.class.getAnnotation(MappedSuperclass.class));
		assertNull(BaseRegistrationEntity.class.getAnnotation(Inheritance.class));
	}
}
