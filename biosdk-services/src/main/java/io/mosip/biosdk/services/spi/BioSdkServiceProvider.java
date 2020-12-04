package io.mosip.biosdk.services.spi;

import io.mosip.biosdk.services.dto.RequestDto;

public interface BioSdkServiceProvider {
    String getSpecVersion();

    String init(RequestDto request);

    String checkQuality(RequestDto request);

    String match(RequestDto request);

    String extractTemplate(RequestDto request);

    String segment(RequestDto request);

    String convertFormat(RequestDto request);
}
