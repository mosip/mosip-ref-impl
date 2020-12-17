package io.mosip.biosdk.services.impl.spec_1_0.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class InitRequestDto {

    private Map<String, String> initParams;
}
