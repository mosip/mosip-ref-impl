package io.mosip.authentication.demo.service.util;

import java.io.IOException;
import java.security.KeyStore.PrivateKeyEntry;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.UnrecoverableEntryException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Objects;

import org.bouncycastle.operator.OperatorCreationException;
import org.jose4j.jws.JsonWebSignature;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SignatureUtil {
	
	private static final String SIGN_ALGO = "RS256";
	
	@Autowired
	private KeyMgrUtil keyMgrUtil;
	
	public String sign(String dataToSign, boolean includePayload,
			boolean includeCertificate, boolean includeCertHash, String certificateUrl, String dirPath, String partnerId) throws JoseException, NoSuchAlgorithmException, UnrecoverableEntryException, 
			KeyStoreException, CertificateException, IOException, OperatorCreationException {

		JsonWebSignature jwSign = new JsonWebSignature();
		PrivateKeyEntry keyEntry = keyMgrUtil.getKeyEntry(dirPath, partnerId);
		if (Objects.isNull(keyEntry)) {
			throw new KeyStoreException("Key file not available for partner type: " + partnerId);
		}
		
		PrivateKey privateKey = keyEntry.getPrivateKey();
		
		X509Certificate x509Certificate = keyMgrUtil.getCertificateEntry(dirPath, partnerId);
		
		if(x509Certificate == null) {
			x509Certificate = (X509Certificate) keyEntry.getCertificate();
		}
		
		if (includeCertificate)
			jwSign.setCertificateChainHeaderValue(new X509Certificate[] { x509Certificate });

		if (includeCertHash)
			jwSign.setX509CertSha256ThumbprintHeaderValue(x509Certificate);

		if (Objects.nonNull(certificateUrl))
			jwSign.setHeader("x5u", certificateUrl);

		jwSign.setPayload(dataToSign);
		jwSign.setAlgorithmHeaderValue(SIGN_ALGO);
		jwSign.setKey(privateKey);
		jwSign.setDoKeyValidation(false);
		if (includePayload)
			return jwSign.getCompactSerialization();

		return jwSign.getDetachedContentCompactSerialization();
		
	}

}
