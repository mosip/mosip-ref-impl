package io.mosip.biosdk.services.impl;

import com.google.gson.Gson;
import io.mosip.biosdk.services.config.LoggerConfig;
import io.mosip.biosdk.services.constants.ErrorMessages;
import io.mosip.biosdk.services.controller.MainController;
import io.mosip.biosdk.services.dto.ErrorDto;
import io.mosip.biosdk.services.dto.RequestDto;
import io.mosip.biosdk.services.dto.ResponseDto;
import io.mosip.biosdk.services.exceptions.BioSDKException;
import io.mosip.biosdk.services.factory.BioSdkServiceFactory;
import io.mosip.biosdk.services.spi.BioSdkServiceProvider;
import io.mosip.biosdk.services.utils.Utils;
import io.mosip.kernel.biometrics.model.SDKInfo;
import io.mosip.kernel.biometrics.spi.IBioApi;
import io.mosip.kernel.core.logger.spi.Logger;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class BioSdkServiceImpl {

    private Logger logger = LoggerConfig.logConfig(MainController.class);

    @Autowired
    private Utils serviceUtil;

    @Autowired
    private IBioApi iBioApi;

    @Autowired
    private BioSdkServiceFactory bioSdkServiceFactory;

    @Autowired
    private Gson gson;

    public String init(RequestDto requestDto){
        ResponseDto responseDto = generateResponseTemplate(requestDto.getVersion());
        responseDto.setVersion(requestDto.getVersion());
        BioSdkServiceProvider bioSdkServiceProviderImpl = null;
        bioSdkServiceProviderImpl = bioSdkServiceFactory.getBioSdkServiceProvider(requestDto.getVersion());
        responseDto.setResponse(bioSdkServiceProviderImpl.init(requestDto));
        return gson.toJson(responseDto);
    }

    public String checkQuality(RequestDto requestDto){
        ResponseDto responseDto = generateResponseTemplate(requestDto.getVersion());
        responseDto.setVersion(requestDto.getVersion());
        BioSdkServiceProvider bioSdkServiceProviderImpl = null;
        bioSdkServiceProviderImpl = bioSdkServiceFactory.getBioSdkServiceProvider(requestDto.getVersion());
        responseDto.setResponse(bioSdkServiceProviderImpl.init(requestDto));
        return gson.toJson(responseDto);
    }

    private ResponseDto generateResponseTemplate(String version){
        ResponseDto responseDto = new ResponseDto();
        responseDto.setVersion(version);
        responseDto.setResponsetime(serviceUtil.getCurrentResponseTime());
        responseDto.setErrors(new ArrayList<ErrorDto>());
        return responseDto;
    }

    private String getVersion(String request) throws BioSDKException{
        JSONParser parser = new JSONParser();
        try {
            JSONObject js = (JSONObject) parser.parse(request);
            return js.get("version").toString();
        } catch (ParseException e) {
            throw new BioSDKException(ErrorMessages.UNCHECKED_EXCEPTION.toString(), e.getMessage());
        }
    }
}
