package io.mosip.biosdk.services;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
    "io.mosip.biosdk.*",
    "${mosip.auth.adapter.impl.basepackage}",
})
public class SdkApplication {
    public static void main(String[] args) {
        SpringApplication.run(SdkApplication.class, args);
    }
}
