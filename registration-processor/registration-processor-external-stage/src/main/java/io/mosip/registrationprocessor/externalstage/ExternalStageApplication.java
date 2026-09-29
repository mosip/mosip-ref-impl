package io.mosip.registrationprocessor.externalstage;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import io.mosip.registration.processor.core.config.reader.ConfigPropertyReader;
import io.mosip.registrationprocessor.externalstage.stage.ExternalStage;

/**
 * Launches the external-stage Vert.x application via an annotation config context
 * (scans MOSIP core, status, rest-client, and this stage).
 */
public class ExternalStageApplication {

	/**
	 * Boots Spring, then deploys {@link ExternalStage}.
	 *
	 * @param args unused
	 */
	public static void main(String[] args) {
		AnnotationConfigApplicationContext configApplicationContext = new AnnotationConfigApplicationContext();
		configApplicationContext.scan("io.mosip.registration.processor.core.config",
				ConfigPropertyReader.getConfig("mosip.auth.adapter.impl.basepackage"),
				"io.mosip.registrationprocessor.externalstage.config", "io.mosip.registration.processor.core.config",
				"io.mosip.registration.processor.status.config", "io.mosip.registration.processor.core.kernel.beans",
				"io.mosip.registration.processor.rest.client.config");
		configApplicationContext.refresh();
		ExternalStage externalStage = (ExternalStage) configApplicationContext.getBean(ExternalStage.class);
		externalStage.deployVerticle();
	}

}