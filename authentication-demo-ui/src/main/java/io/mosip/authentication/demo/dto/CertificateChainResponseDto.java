package io.mosip.authentication.demo.dto;
import lombok.Data;

/**
 * Instantiates a new certificate chain response dto.
 * 
 * @author Md. Taheer
 * @author Loganathan Sekar
 */
@Data
public class CertificateChainResponseDto {
    
    /** The ca certificate. */
    String caCertificate;
    
    /** The inter certificate. */
    String interCertificate;
    
    /** The partner certificate. */
    String partnerCertificate;
}
