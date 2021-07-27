package io.mosip.demosdk.client.config;

import io.mosip.kernel.core.logger.spi.Logger;
import io.mosip.kernel.logger.logback.appender.RollingFileAppender;
import io.mosip.kernel.logger.logback.factory.Logfactory;

public final class LoggerConfig {

    /**
     * Instantiates a new pre-reg  logger.
     */
    private LoggerConfig() {

    }


    /** The mosip rolling file appender. */
    private static RollingFileAppender mosipRollingFileAppender;

    static {
        mosipRollingFileAppender = new RollingFileAppender();
        mosipRollingFileAppender.setAppend(true);
        mosipRollingFileAppender.setAppenderName("fileappender");
        mosipRollingFileAppender.setFileName("./logs/biosdk-client.log");
        mosipRollingFileAppender.setFileNamePattern("./logs/biosdk-client-%d{yyyy-MM-dd}-%i.log");
        mosipRollingFileAppender.setImmediateFlush(true);
        mosipRollingFileAppender.setMaxFileSize("50mb");
//		mosipRollingFileAppender.setMaxHistory(3);
        mosipRollingFileAppender.setPrudent(false);
//		mosipRollingFileAppender.setTotalCap("50mb");
    }

    public static Logger logConfig(Class<?> clazz) {
        return Logfactory.getDefaultRollingFileLogger(mosipRollingFileAppender, clazz);
    }

}
