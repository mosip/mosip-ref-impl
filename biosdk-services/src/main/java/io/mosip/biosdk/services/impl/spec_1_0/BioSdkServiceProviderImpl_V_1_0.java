package io.mosip.biosdk.services.impl.spec_1_0;

import com.google.gson.Gson;
import io.mosip.biosdk.services.config.LoggerConfig;
import io.mosip.biosdk.services.constants.ErrorMessages;
import io.mosip.biosdk.services.dto.ErrorDto;
import io.mosip.biosdk.services.dto.RequestDto;
import io.mosip.biosdk.services.dto.ResponseDto;
import io.mosip.biosdk.services.exceptions.BioSDKException;
import io.mosip.biosdk.services.impl.spec_1_0.dto.request.*;
import io.mosip.biosdk.services.spi.BioSdkServiceProvider;
import io.mosip.biosdk.services.utils.Utils;
import io.mosip.kernel.biometrics.entities.BiometricRecord;
import io.mosip.kernel.biometrics.model.Response;
import io.mosip.kernel.biometrics.model.SDKInfo;
import io.mosip.kernel.biometrics.spi.IBioApi;
import io.mosip.kernel.core.logger.spi.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

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

    @Override
    public Object init(RequestDto request){
        SDKInfo sdkInfo = null;
        String decryptedRequest = decrypt(request.getRequest(), request.getSessionKey(), request.getHmac());
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"init: ", "decoding successful");
        InitRequestDto initRequestDto = gson.fromJson(decryptedRequest, InitRequestDto.class);
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"init: ", "json to dto successful");
        try {
            sdkInfo = iBioApi.init(initRequestDto.getInitParams());
        } catch (RuntimeException e){
            e.printStackTrace();
            logger.error(LOGGER_SESSIONID, LOGGER_IDTYPE,"init: ", e.toString()+" "+e.getMessage());
            throw new BioSDKException(ErrorMessages.BIOSDK_LIB_EXCEPTION.toString(), ErrorMessages.BIOSDK_LIB_EXCEPTION.getMessage()+": "+e.getMessage());
        }
        return sdkInfo;
    }

    @Override
    public Object checkQuality(RequestDto request) {
        Response response;
        String decryptedRequest = decrypt(request.getRequest(), request.getSessionKey(), request.getHmac());
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"checkQuality: ", "decoding successful");
        CheckQualityRequestDto checkQualityRequestDto = gson.fromJson(decryptedRequest, CheckQualityRequestDto.class);
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"checkQuality: ", "json to dto successful");
        try {
            response = iBioApi.checkQuality(
                    checkQualityRequestDto.getSample(),
                    checkQualityRequestDto.getModalitiesToCheck(),
                    checkQualityRequestDto.getFlags()
            );
        } catch (RuntimeException e){
            e.printStackTrace();
            logger.error(LOGGER_SESSIONID, LOGGER_IDTYPE,"checkQuality: ", e.toString()+" "+e.getMessage());
            throw new BioSDKException(ErrorMessages.BIOSDK_LIB_EXCEPTION.toString(), ErrorMessages.BIOSDK_LIB_EXCEPTION.getMessage()+": "+e.toString()+" "+e.getMessage());
        }
        return response;
    }

    @Override
    public Object match(RequestDto request) {
        Response response;
        String decryptedRequest = decrypt(request.getRequest(), request.getSessionKey(), request.getHmac());
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"match: ", "decoding successful");
        MatchRequestDto matchRequestDto = gson.fromJson(decryptedRequest, MatchRequestDto.class);
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"match: ", "json to dto successful");
        try {
            response = iBioApi.match(
                    matchRequestDto.getSample(),
                    matchRequestDto.getGallery(),
                    matchRequestDto.getModalitiesToMatch(),
                    matchRequestDto.getFlags()
            );
        } catch (RuntimeException e){
            e.printStackTrace();
            logger.error(LOGGER_SESSIONID, LOGGER_IDTYPE,"match: ", e.toString()+" "+e.getMessage());
            throw new BioSDKException(ErrorMessages.BIOSDK_LIB_EXCEPTION.toString(), ErrorMessages.BIOSDK_LIB_EXCEPTION.getMessage()+": "+e.toString()+" "+e.getMessage());
        }
        return response;
    }

    @Override
    public Object extractTemplate(RequestDto request) {
        Response response;
        String decryptedRequest = decrypt(request.getRequest(), request.getSessionKey(), request.getHmac());
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"extractTemplate: ", "decoding successful");
        ExtractTemplateRequestDto matchRequestDto = gson.fromJson(decryptedRequest, ExtractTemplateRequestDto.class);
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"extractTemplate: ", "json to dto successful");
        try {
            response = iBioApi.extractTemplate(
                    matchRequestDto.getSample(),
                    matchRequestDto.getModalitiesToExtract(),
                    matchRequestDto.getFlags()
            );
        } catch (RuntimeException e){
            e.printStackTrace();
            logger.error(LOGGER_SESSIONID, LOGGER_IDTYPE,"match: ", e.toString()+" "+e.getMessage());
            throw new BioSDKException(ErrorMessages.BIOSDK_LIB_EXCEPTION.toString(), ErrorMessages.BIOSDK_LIB_EXCEPTION.getMessage()+": "+e.toString()+" "+e.getMessage());
        }
        return response;
    }

    @Override
    public Object segment(RequestDto request) {
        Response response;
        String decryptedRequest = decrypt(request.getRequest(), request.getSessionKey(), request.getHmac());
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"init: ", "decoding successful");
        SegmentRequestDto matchRequestDto = gson.fromJson(decryptedRequest, SegmentRequestDto.class);
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"init: ", "json to dto successful");
        try {
            response = iBioApi.segment(
                    matchRequestDto.getSample(),
                    matchRequestDto.getModalitiesToSegment(),
                    matchRequestDto.getFlags()
            );
        } catch (RuntimeException e){
            e.printStackTrace();
            logger.error(LOGGER_SESSIONID, LOGGER_IDTYPE,"match: ", e.toString()+" "+e.getMessage());
            throw new BioSDKException(ErrorMessages.BIOSDK_LIB_EXCEPTION.toString(), ErrorMessages.BIOSDK_LIB_EXCEPTION.getMessage()+": "+e.toString()+" "+e.getMessage());
        }
        return response;
    }

    @Override
    public Object convertFormat(RequestDto request) {
        BiometricRecord biometricRecord;
        String decryptedRequest = decrypt(request.getRequest(), request.getSessionKey(), request.getHmac());
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"init: ", "decoding successful");
        ConvertFormatRequestDto matchRequestDto = gson.fromJson(decryptedRequest, ConvertFormatRequestDto.class);
        logger.debug(LOGGER_SESSIONID, LOGGER_IDTYPE,"init: ", "json to dto successful");
        try {
            biometricRecord = iBioApi.convertFormat(
                    matchRequestDto.getSample(),
                    matchRequestDto.getSourceFormat(),
                    matchRequestDto.getTargetFormat(),
                    matchRequestDto.getSourceParams(),
                    matchRequestDto.getTargetParams(),
                    matchRequestDto.getModalitiesToConvert()
            );
        } catch (RuntimeException e){
            e.printStackTrace();
            logger.error(LOGGER_SESSIONID, LOGGER_IDTYPE,"match: ", e.toString()+" "+e.getMessage());
            throw new BioSDKException(ErrorMessages.BIOSDK_LIB_EXCEPTION.toString(), ErrorMessages.BIOSDK_LIB_EXCEPTION.getMessage()+": "+e.toString()+" "+e.getMessage());
        }
        return biometricRecord;
    }

    private String decrypt(String data, String sessionKey, String hmac){
        return Utils.base64Decode(data);
    }

    private ResponseDto generateResponseTemplate(RequestDto requestDto){
        ResponseDto responseDto = new ResponseDto();
        responseDto.setVersion(requestDto.getVersion());
        responseDto.setResponsetime(serviceUtil.getCurrentResponseTime());
        responseDto.setErrors(new ArrayList<ErrorDto>());
        return responseDto;
    }
}
