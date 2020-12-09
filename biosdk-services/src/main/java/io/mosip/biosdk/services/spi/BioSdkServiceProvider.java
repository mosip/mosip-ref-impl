package io.mosip.biosdk.services.spi;

import io.mosip.biosdk.services.dto.RequestDto;

public interface BioSdkServiceProvider {
    Object getSpecVersion();

    Object init(RequestDto request);

    Object checkQuality(RequestDto request);

    Object match(RequestDto request);

    Object extractTemplate(RequestDto request);

    Object segment(RequestDto request);

    Object convertFormat(RequestDto request);
}
