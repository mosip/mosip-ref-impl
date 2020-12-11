package io.mosip.biosdk.services.config;

import io.mosip.kernel.core.logger.spi.Logger;
import io.mosip.kernel.logger.logback.appender.RollingFileAppender;
import io.mosip.kernel.logger.logback.factory.Logfactory;

public final class LoggerConfig {
	
	/**
	 * Instantiates a new biosdk service  logger.
	 */
	private LoggerConfig() {

	}

	
	/** The mosip rolling file appender. */
	private final static RollingFileAppender MOSIP_ROLLING_APPENDER = new RollingFileAppender();
	
	static {
        MOSIP_ROLLING_APPENDER.setAppend(true);
        MOSIP_ROLLING_APPENDER.setAppenderName("org.apache.log4j.RollingFileAppender");
        MOSIP_ROLLING_APPENDER.setFileName("./logs/biosdk-service.log");
        MOSIP_ROLLING_APPENDER.setFileNamePattern("./logs/biosdk-service-%d{yyyy-MM-dd}-%i.log");
        MOSIP_ROLLING_APPENDER.setImmediateFlush(true);
        MOSIP_ROLLING_APPENDER.setMaxFileSize("50mb");
//		mosipRollingFileAppender.setMaxHistory(3);
        MOSIP_ROLLING_APPENDER.setPrudent(false);
//		mosipRollingFileAppender.setTotalCap("50mb");
	}
	
	public static Logger logConfig(Class<?> clazz) {
		return Logfactory.getDefaultRollingFileLogger(MOSIP_ROLLING_APPENDER, clazz);
	}

}
