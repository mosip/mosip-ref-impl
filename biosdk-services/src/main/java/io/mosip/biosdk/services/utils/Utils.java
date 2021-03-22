package io.mosip.biosdk.services.utils;

import com.google.gson.Gson;
import io.mosip.biosdk.services.dto.RequestDto;
import io.mosip.kernel.core.util.DateUtils;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

@Component
public class Utils {
    @Autowired
    private Gson gson;

    private String utcDateTimePattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

    public String getCurrentResponseTime() {
        return DateUtils.formatDate(new Date(System.currentTimeMillis()), utcDateTimePattern);
    }

    public RequestDto getRequestInfo(String request) throws ParseException {
        return gson.fromJson(request, RequestDto.class);
    }

    public static String base64Decode(String data){
        return new String(Base64.getDecoder().decode(data), StandardCharsets.UTF_8);
    }
}
