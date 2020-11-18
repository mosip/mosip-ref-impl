package io.mosip.biosdk.client.dto;

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
public class ExtractTemplateRequestDto {
    private BiometricRecord sample;
    private List<BiometricType> modalitiesToExtract;
    private Map<String, String> flags;
}
