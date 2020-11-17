package io.mosip.biosdk.services.config;

import io.mosip.kernel.biometrics.spi.IBioApi;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.env.Environment;

import javax.annotation.PostConstruct;

@Configuration
public class BioSdkLibConfig {
    private static final Logger logger = LoggerFactory.getLogger(BioSdkLibConfig.class);
    @Autowired
    private Environment env;

    public BioSdkLibConfig() {
    }

    @PostConstruct
    public void validateBioSdkLib() throws ClassNotFoundException {
        if (StringUtils.isNotBlank(this.env.getProperty("biosdk_class"))) {
            logger.debug("validating Bio SDK Class is present or not");
            Class.forName(this.env.getProperty("biosdk_class"));
        }

        logger.debug("validateBioSdkLib: Bio SDK Class is not provided");
    }

    @Bean
    @Lazy
    public IBioApi iBioApi() throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        if (StringUtils.isNotBlank(this.env.getProperty("biosdk_class"))) {
            logger.debug("instance of Bio SDK is created");
            return (IBioApi)Class.forName(this.env.getProperty("biosdk_class")).newInstance();
        } else {
            logger.debug("no Bio SDK is provided");
            throw new RuntimeException("No Bio SDK is provided");
        }
    }
}
