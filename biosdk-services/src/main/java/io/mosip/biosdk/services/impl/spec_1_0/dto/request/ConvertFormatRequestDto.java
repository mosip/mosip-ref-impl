package io.mosip.biosdk.services.impl.spec_1_0.dto.request;

import io.mosip.kernel.biometrics.constant.BiometricType;
import io.mosip.kernel.biometrics.entities.BiometricRecord;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ConvertFormatRequestDto {
    private BiometricRecord sample;
    private String sourceFormat;
    private String targetFormat;
    private Map<String, String> sourceParams;
    private Map<String, String> targetParams;
    private List<BiometricType> modalitiesToConvert;
}
