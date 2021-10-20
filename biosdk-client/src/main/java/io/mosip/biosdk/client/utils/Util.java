package io.mosip.biosdk.client.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.mosip.biosdk.client.config.LoggerConfig;
import io.mosip.kernel.core.logger.spi.Logger;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.json.GsonHttpMessageConverter;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Map;

import static io.mosip.biosdk.client.constant.AppConstants.LOGGER_IDTYPE;
import static io.mosip.biosdk.client.constant.AppConstants.LOGGER_SESSIONID;

public class Util {

    private static final GsonHttpMessageConverter MESSAGE_CONVERTER;

	private static final RestTemplate REST_TEMPLATE;
	
	static {
		MESSAGE_CONVERTER = new GsonHttpMessageConverter();
		REST_TEMPLATE = new RestTemplate();
		REST_TEMPLATE.getMessageConverters().add(MESSAGE_CONVERTER);
	}

	private static final String debugRequestResponse = System.getenv("mosip_biosdk_request_response_debug");

    private static Logger utilLogger = LoggerConfig.logConfig(Util.class);

    public static ResponseEntity<?> restRequest(String url, HttpMethod httpMethodType, MediaType mediaType, Object body,
                                             Map<String, String> headersMap, Class<?> responseClass) {
        ResponseEntity<?> response = null;
        RestTemplate restTemplate = getRestTemplate();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            HttpEntity<?> request = null;
            if (headersMap != null) {
                headersMap.forEach((k, v) -> headers.add(k, v));
            }
            if (body != null) {
                request = new HttpEntity<>(body, headers);
            } else {
                request = new HttpEntity<>(headers);
            }

            if(debugRequestResponse != null && debugRequestResponse.equalsIgnoreCase("y")){
                Gson gson = new GsonBuilder().serializeNulls().disableHtmlEscaping().create();
                utilLogger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "Request: ", gson.toJson(request.getBody()));
            }

            response = restTemplate.exchange(url, httpMethodType, request, responseClass);

            if(debugRequestResponse != null && debugRequestResponse.equalsIgnoreCase("y")){
                utilLogger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE, "Response: ", response.getBody().toString());
            }
        } catch (RestClientException ex) {
            ex.printStackTrace();
            throw new RestClientException("rest call failed");
        }
        return response;

    }

    private static RestTemplate getRestTemplate() {
		return REST_TEMPLATE;
	}

//	public static RestTemplate createRestTemplate() throws KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
//
//        TrustStrategy acceptingTrustStrategy = (X509Certificate[] chain, String authType) -> true;
//
//        SSLContext sslContext = org.apache.http.ssl.SSLContexts.custom().loadTrustMaterial(null, acceptingTrustStrategy)
//                .build();
//
//        SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory(sslContext);
//
//        CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(csf).build();
//        HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
//
//        requestFactory.setHttpClient(httpClient);
//        return new RestTemplate(requestFactory);
//    }

    public static String base64Encode(String data){
        return Base64.getEncoder().encodeToString(data.getBytes());
    }
}
