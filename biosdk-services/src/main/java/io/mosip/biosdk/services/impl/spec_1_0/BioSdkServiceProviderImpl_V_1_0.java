package io.mosip.biosdk.services.impl.spec_1_0;

import com.google.gson.Gson;
import io.mosip.biosdk.services.config.LoggerConfig;
import io.mosip.biosdk.services.controller.MainController;
import io.mosip.biosdk.services.dto.RequestDto;
import io.mosip.biosdk.services.dto.ResponseDto;
import io.mosip.biosdk.services.impl.spec_1_0.dto.request.InitRequestDto;
import io.mosip.biosdk.services.spi.BioSdkServiceProvider;
import io.mosip.biosdk.services.utils.Utils;
import io.mosip.kernel.biometrics.model.MatchDecision;
import io.mosip.kernel.biometrics.spi.IBioApi;
import io.mosip.kernel.core.logger.spi.Logger;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static io.mosip.biosdk.services.constants.AppConstants.LOGGER_IDTYPE;
import static io.mosip.biosdk.services.constants.AppConstants.LOGGER_SESSIONID;

@Component
public class BioSdkServiceProviderImpl_V_1_0 implements BioSdkServiceProvider {

    private Logger logger = LoggerConfig.logConfig(BioSdkServiceProviderImpl_V_1_0.class);

    private static final String BIOSDK_SERVICE_SPEC_VERSION = "1.0";
    private static final String BIOSDK_SPEC_VERSION = "0.9";
    private static final String publicKey = "";
    private static final String privateKey = "";

    @Autowired
    private IBioApi iBioApi;

    @Autowired
    private Utils serviceUtil;

    @Autowired
    private Gson gson;

    @Override
    public String getSpecVersion() {
        return BIOSDK_SERVICE_SPEC_VERSION;
    }

    public String init(RequestDto request){
        BioSdkServiceProvider bioSdkServiceProvider;
        ResponseDto response = new ResponseDto();
        response.setVersion(request.getVersion());
        response.setResponsetime(serviceUtil.getCurrentResponseTime());
        String decryptedRequest = decrypt(request.getRequest(), request.getSessionKey(), request.getHmac());
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"init: ", "decryption successful");
        InitRequestDto initRequestDto = gson.fromJson(decryptedRequest, InitRequestDto.class);
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"init: ", "json to dto successful");
        response.setResponse(iBioApi.init(initRequestDto.getInitParams()));
        return gson.toJson(response);
    }

    @Override
    public String checkQuality(RequestDto request) {
        return null;
    }

    @Override
    public String match(RequestDto request) {
        return null;
    }

    @Override
    public String extractTemplate(RequestDto request) {
        return null;
    }

    @Override
    public String segment(RequestDto request) {
        return null;
    }

    @Override
    public String convertFormat(RequestDto request) {
        return null;
    }

    private String decrypt(String data, String sessionKey, String hmac){
        return Utils.base64Decode(data);
    }

}
