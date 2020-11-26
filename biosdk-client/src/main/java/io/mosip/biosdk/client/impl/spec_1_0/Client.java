package io.mosip.biosdk.client.impl.spec_1_0;

import com.google.gson.Gson;
import io.mosip.biosdk.client.dto.*;
import io.mosip.biosdk.client.utils.Util;
import io.mosip.kernel.biometrics.constant.BiometricType;
import io.mosip.kernel.biometrics.entities.BiometricRecord;
import io.mosip.kernel.biometrics.model.MatchDecision;
import io.mosip.kernel.biometrics.model.QualityCheck;
import io.mosip.kernel.biometrics.model.Response;
import io.mosip.kernel.biometrics.model.SDKInfo;
import io.mosip.kernel.biometrics.spi.IBioApi;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;

/**
 * The Class BioApiImpl.
 * 
 * @author Sanjay Murali
 * @author Manoj SP
 * 
 */
public class Client implements IBioApi {

	Logger LOGGER = LoggerFactory.getLogger(Client.class);

	private static final String VERSION = "1.0";
	private static final String BIOSDK_SPEC_VERSION = "0.9";
	private static final boolean rest = true;

	/* "http://localhost:9099/biosdk-service" */
	private static final String host = System.getenv("mosip_biosdk_service");

	@Override
	public SDKInfo init(Map<String, String> initParams) {

		InitRequestDto initRequestDto = new InitRequestDto();
		initRequestDto.setInitParams(initParams);

		RequestDto requestDto = generateNewRequestDto(initRequestDto);
		ResponseEntity<?> responseEntity = Util.restRequest(host+"/init", HttpMethod.POST, MediaType.APPLICATION_JSON, requestDto, null, String.class);
		String responseBody = responseEntity.getBody().toString();
		SDKInfo sdkInfo = null;
		try {
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);
			Gson gson = new Gson();
			sdkInfo = gson.fromJson(js.get("response").toString(), SDKInfo.class);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		return sdkInfo;
	}

	@Override
	public Response<QualityCheck> checkQuality(BiometricRecord sample, List<BiometricType> modalitiesToCheck, Map<String, String> flags) {
		Response<QualityCheck> response = new Response<>();
		response.setStatusCode(200);
		CheckQualityRequestDto checkQualityRequestDto = new CheckQualityRequestDto();
		checkQualityRequestDto.setSample(sample);
		checkQualityRequestDto.setModalitiesToCheck(modalitiesToCheck);
		checkQualityRequestDto.setFlags(flags);

		ResponseEntity<?> responseEntity = Util.restRequest(host+"/check-quality", HttpMethod.POST, MediaType.APPLICATION_JSON, checkQualityRequestDto, null, String.class);
		String responseBody = responseEntity.getBody().toString();
		QualityCheck qualityCheck = null;
		try {
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);
			Gson gson = new Gson();
			qualityCheck = gson.fromJson(js.get("response").toString(), QualityCheck.class);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		response.setResponse(qualityCheck);
		return response;
	}

	@Override
	public Response<MatchDecision[]> match(BiometricRecord sample, BiometricRecord[] gallery,
										   List<BiometricType> modalitiesToMatch, Map<String, String> flags) {
		Response<MatchDecision[]> response = new Response<>();
		response.setStatusCode(200);
		MatchRequestDto matchRequestDto = new MatchRequestDto();
		matchRequestDto.setSample(sample);
		matchRequestDto.setGallery(gallery);
		matchRequestDto.setModalitiesToMatch(modalitiesToMatch);
		matchRequestDto.setFlags(flags);

		ResponseEntity<?> responseEntity = Util.restRequest(host+"/match", HttpMethod.POST, MediaType.APPLICATION_JSON, matchRequestDto, null, String.class);
		String responseBody = responseEntity.getBody().toString();
		MatchDecision[] matchDescisions = new MatchDecision[0];
		try {
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);
			Gson gson = new Gson();
			matchDescisions = gson.fromJson(js.get("response").toString(), MatchDecision[].class);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		response.setResponse(matchDescisions);
		return response;
	}

	@Override
	public Response<BiometricRecord> extractTemplate(BiometricRecord sample, List<BiometricType> modalitiesToExtract, Map<String, String> flags) {
		Response<BiometricRecord> response = new Response<>();
		response.setStatusCode(200);
		ExtractTemplateRequestDto extractTemplateRequestDto = new ExtractTemplateRequestDto();
		extractTemplateRequestDto.setSample(sample);
		extractTemplateRequestDto.setModalitiesToExtract(modalitiesToExtract);
		extractTemplateRequestDto.setFlags(flags);
		ResponseEntity<?> responseEntity = Util.restRequest(host+"/extract-template", HttpMethod.POST, MediaType.APPLICATION_JSON, extractTemplateRequestDto, null, String.class);
		String responseBody = responseEntity.getBody().toString();
		BiometricRecord resBiometricRecord = null;
		try {
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);
			Gson gson = new Gson();
			resBiometricRecord = gson.fromJson(js.get("response").toString(), BiometricRecord.class);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		response.setResponse(resBiometricRecord);
		return response;
	}

	@Override
	public Response<BiometricRecord> segment(BiometricRecord biometricRecord, List<BiometricType> modalitiesToSegment, Map<String, String> flags) {
		Response<BiometricRecord> response = new Response<>();
		response.setStatusCode(200);
		SegmentRequestDto segmentRequestDto = new SegmentRequestDto();
		segmentRequestDto.setSample(biometricRecord);
		segmentRequestDto.setModalitiesToSegment(modalitiesToSegment);
		segmentRequestDto.setFlags(flags);

		ResponseEntity<?> responseEntity = Util.restRequest(host+"/segment", HttpMethod.POST, MediaType.APPLICATION_JSON, segmentRequestDto, null, String.class);
		String responseBody = responseEntity.getBody().toString();
		BiometricRecord resBiometricRecord = null;
		try {
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);
			Gson gson = new Gson();
			resBiometricRecord = gson.fromJson(js.get("response").toString(), BiometricRecord.class);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		response.setResponse(resBiometricRecord);
		return response;
	}

	@Override
	public BiometricRecord convertFormat(BiometricRecord sample, String sourceFormat, String targetFormat,
			Map<String, String> sourceParams, Map<String, String> targetParams, List<BiometricType> modalitiesToConvert) {
		ConvertFormatRequestDto convertFormatRequestDto = new ConvertFormatRequestDto();
		convertFormatRequestDto.setSample(sample);
		convertFormatRequestDto.setSourceFormat(sourceFormat);
		convertFormatRequestDto.setTargetFormat(targetFormat);
		convertFormatRequestDto.setSourceParams(sourceParams);
		convertFormatRequestDto.setTargetParams(targetParams);
		convertFormatRequestDto.setModalitiesToConvert(modalitiesToConvert);

		ResponseEntity<?> responseEntity = Util.restRequest(host+"/convert-format", HttpMethod.POST, MediaType.APPLICATION_JSON, convertFormatRequestDto, null, String.class);
		String responseBody = responseEntity.getBody().toString();
		BiometricRecord resBiometricRecord = null;
		try {
			JSONParser parser = new JSONParser();
			JSONObject js = (JSONObject) parser.parse(responseBody);
			Gson gson = new Gson();
			resBiometricRecord = gson.fromJson(js.get("response").toString(), BiometricRecord.class);
		} catch (ParseException e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		}
		return resBiometricRecord;
	}

	private RequestDto generateNewRequestDto(Object body){
		Gson gson = new Gson();
		RequestDto requestDto = new RequestDto();
		requestDto.setVersion(VERSION);
		requestDto.setBiosdkSpecVersion(BIOSDK_SPEC_VERSION);
		requestDto.setRequest(Util.base64Encode(gson.toJson(body)));
		return requestDto;
	}


}