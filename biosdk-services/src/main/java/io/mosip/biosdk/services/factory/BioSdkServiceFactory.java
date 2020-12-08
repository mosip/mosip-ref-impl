package io.mosip.biosdk.services.factory;

import io.mosip.biosdk.services.exceptions.BioSDKException;
import io.mosip.biosdk.services.spi.BioSdkServiceProvider;
import io.mosip.biosdk.services.utils.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BioSdkServiceFactory {

    @Autowired
    private List<BioSdkServiceProvider> bioSdkServiceProviders;

    public BioSdkServiceProvider getBioSdkServiceProvider(String version){
        for(BioSdkServiceProvider provider : bioSdkServiceProviders) {
            if(provider.getSpecVersion().equals(version)){
                return provider;
            }
        }
        throw new BioSDKException(ErrorCode.NO_PROVIDERS.getErrorCode(), ErrorCode.NO_PROVIDERS.getErrorMessage());
    }
}
