package io.mosip.biosdk.services.utils;

import io.mosip.kernel.core.util.DateUtils;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class Utils {
    private String utcDateTimePattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

    public String getCurrentResponseTime() {
        return DateUtils.formatDate(new Date(System.currentTimeMillis()), utcDateTimePattern);
    }
}
