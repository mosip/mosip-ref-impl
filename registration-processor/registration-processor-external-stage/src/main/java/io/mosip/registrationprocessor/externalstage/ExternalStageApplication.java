package io.mosip.registrationprocessor.externalstage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ClassPathBeanDefinitionScanner;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.io.support.ResourcePropertySource;
import org.springframework.core.type.filter.RegexPatternTypeFilter;

import io.mosip.registration.processor.core.config.reader.ConfigPropertyReader;
import io.mosip.registrationprocessor.externalstage.stage.ExternalStage;

/**
 * Launches the external-stage Vert.x application via an annotation config context
 * (scans MOSIP core, status, rest-client, and this stage).
 */
public class ExternalStageApplication {

	private static final String LOCAL = "local";

	private static final String DEFAULT_AUTH_ADAPTER = "io.mosip.kernel.auth.defaultadapter";

	/** Vert.x config-server store under core.config; skipped for profile {@code local}. */
	private static final Pattern CONFIG_SERVER_LOADER = Pattern
			.compile("io\\.mosip\\.registration\\.processor\\.core\\.config\\.configserverloader\\..*");

	/**
	 * Boots Spring, then deploys {@link ExternalStage}.
	 *
	 * @param args unused
	 */
	public static void main(String[] args) {
		AnnotationConfigApplicationContext configApplicationContext = new AnnotationConfigApplicationContext();
		applyLocalProfile(configApplicationContext);
		try {
			scanStage(configApplicationContext);
			skipVertxConfigServerStore(configApplicationContext);
			configApplicationContext.refresh();
			ExternalStage externalStage = (ExternalStage) configApplicationContext.getBean(ExternalStage.class);
			externalStage.deployVerticle();
			System.out.println("Started ExternalStageApplication");
		} catch (Exception e) {
			System.out.println("EXTERNAL_STAGE_STARTUP_FAILED");
			System.err.println("EXTERNAL_STAGE_STARTUP_FAILED");
			Throwable root = e;
			while (root.getCause() != null && root.getCause() != root) {
				root = root.getCause();
			}
			System.err.println(root.toString());
			e.printStackTrace();
			System.exit(1);
		}
	}

	/**
	 * Loads {@code application-local.properties} when {@code spring.profiles.active=local}.
	 * Vert.x stages do not use {@code SpringApplication}, so Boot would otherwise skip that file.
	 *
	 * @param ctx annotation config context before {@code scan}
	 */
	static void applyLocalProfile(AnnotationConfigApplicationContext ctx) {
		if (!localProfile()) {
			return;
		}
		ctx.getEnvironment().setActiveProfiles(LOCAL);
		try {
			ctx.getEnvironment().getPropertySources()
					.addFirst(new ResourcePropertySource("application-local", "classpath:application-local.properties"));
			installLocalHazelcastXml(ctx);
		} catch (IOException e) {
			throw new IllegalStateException("Failed to load application-local.properties", e);
		}
	}

	/**
	 * MOSIP {@code MosipVerticleManager#getEventBus} loads Hazelcast via
	 * {@code UrlXmlConfig}. {@code localhost} is not an absolute URI (see
	 * {@code URI is not absolute} on deploy). Profile {@code local} writes
	 * {@code hazelcast-local.xml} and sets {@code vertx.cluster.configuration}
	 * to its {@code file:} URI.
	 *
	 * @param ctx context after application-local was added
	 * @throws IOException if the XML cannot be copied
	 */
	static void installLocalHazelcastXml(AnnotationConfigApplicationContext ctx) throws IOException {
		Path dest = Path.of(System.getProperty("user.dir"), ".local", "hazelcast-local.xml");
		Files.createDirectories(dest.getParent());
		try (InputStream in = ExternalStageApplication.class.getResourceAsStream("/hazelcast-local.xml")) {
			if (in == null) {
				throw new IllegalStateException("classpath hazelcast-local.xml is missing");
			}
			Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
		}
		Map<String, Object> props = new HashMap<>();
		props.put("vertx.cluster.configuration", dest.toUri().toString());
		ctx.getEnvironment().getPropertySources().addFirst(new MapPropertySource("local-hazelcast", props));
	}

	static boolean localProfile() {
		return LOCAL.equals(System.getProperty("spring.profiles.active", ""));
	}

	/**
	 * {@code CoreConfigBean} is still scanned (TokenValidator, MosipRouter, event bus).
	 * Its {@code getPropertiesFromConfigServer} @Bean talks to Vert.x
	 * {@code SpringConfigServerStore} using bootstrap {@code spring.cloud.config.uri=localhost}
	 * (no scheme). That URL is invalid; the exception is logged and JDBC keys never load.
	 * {@code KernelConfig#getCbeffUtil} constructs {@code CbeffImpl}, whose
	 * {@code @PostConstruct} opens {@code mosip.kernel.xsdstorage-uri} + xsd file
	 * (config-server). External-stage does not use CBEFF. Profile {@code local}
	 * drops both beans before refresh.
	 *
	 * @param ctx context after {@link #scanStage}
	 */
	static void skipVertxConfigServerStore(AnnotationConfigApplicationContext ctx) {
		if (!localProfile()) {
			return;
		}
		ctx.addBeanFactoryPostProcessor(beanFactory -> {
			if (!(beanFactory instanceof BeanDefinitionRegistry registry)) {
				return;
			}
			for (String name : beanFactory.getBeanDefinitionNames()) {
				BeanDefinition bd = beanFactory.getBeanDefinition(name);
				String factory = bd.getFactoryMethodName();
				if ("getPropertiesFromConfigServer".equals(factory) || "getCbeffUtil".equals(factory)) {
					registry.removeBeanDefinition(name);
				}
			}
		});
	}

	/**
	 * Auth adapter package. Profile {@code local} never calls {@link ConfigPropertyReader}
	 * (that boots Vert.x SpringConfigServerStore against bootstrap {@code localhost}).
	 *
	 * @return scan base package for kernel-auth-adapter
	 */
	static String authAdapterPackage() {
		String fromSys = System.getProperty("mosip.auth.adapter.impl.basepackage");
		if (fromSys != null && !fromSys.isBlank()) {
			return fromSys;
		}
		if (localProfile()) {
			return DEFAULT_AUTH_ADAPTER;
		}
		return ConfigPropertyReader.getConfig("mosip.auth.adapter.impl.basepackage");
	}

	static void scanStage(AnnotationConfigApplicationContext ctx) {
		String adapter = authAdapterPackage();
		if (localProfile()) {
			ClassPathBeanDefinitionScanner scanner = new ClassPathBeanDefinitionScanner(ctx);
			scanner.addExcludeFilter(new RegexPatternTypeFilter(CONFIG_SERVER_LOADER));
			scanner.scan("io.mosip.registration.processor.core.config", adapter,
					"io.mosip.registrationprocessor.externalstage.config",
					"io.mosip.registration.processor.status.config",
					"io.mosip.registration.processor.core.kernel.beans",
					"io.mosip.registration.processor.rest.client.config");
			return;
		}
		ctx.scan("io.mosip.registration.processor.core.config", adapter,
				"io.mosip.registrationprocessor.externalstage.config", "io.mosip.registration.processor.core.config",
				"io.mosip.registration.processor.status.config", "io.mosip.registration.processor.core.kernel.beans",
				"io.mosip.registration.processor.rest.client.config");
	}

}
