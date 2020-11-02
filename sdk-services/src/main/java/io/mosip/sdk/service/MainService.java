package io.mosip.sdk.service;

import io.mosip.kernel.biometrics.constant.BiometricType;
import io.mosip.kernel.biometrics.entities.BiometricRecord;
import io.mosip.kernel.biometrics.model.MatchDecision;
import io.mosip.kernel.biometrics.model.QualityCheck;
import io.mosip.kernel.biometrics.model.Response;
import io.mosip.kernel.biometrics.model.SDKInfo;

import java.util.List;
import java.util.Map;

public interface MainService {

    SDKInfo init(Map<String, String> initParams);

    Response<MatchDecision[]> match(BiometricRecord sample, BiometricRecord[] gallery,
                                              List<BiometricType> modalitiesToMatch, Map<String, String> flags);

    Response<QualityCheck> checkQuality(BiometricRecord sample, List<BiometricType> modalitiesToCheck, Map<String, String> flags);

    Response<BiometricRecord> extractTemplate(BiometricRecord sample, List<BiometricType> modalitiesToExtract, Map<String, String> flags);

    Response<BiometricRecord> segment(BiometricRecord sample, List<BiometricType> modalitiesToSegment, Map<String, String> flags);

    Response<BiometricRecord> convertFormat(BiometricRecord sample, String sourceFormat, String targetFormat, Map<String, String> sourceParams, Map<String, String> targetParams, List<BiometricType> modalitiesToConvert);
}
