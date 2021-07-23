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

/**
 * The Class SignatureUtil.
 *  @author Md. Taheer
 *  @author Loganathan Sekar
 */
@Component
public class SignatureUtil {
	
	/** The Constant SIGN_ALGO. */
	private static final String SIGN_ALGO = "RS256";
	
	/** The key mgr util. */
	@Autowired
	private KeyMgrUtil keyMgrUtil;
	
	/**
	 * Sign.
	 *
	 * @param dataToSign the data to sign
	 * @param includePayload the include payload
	 * @param includeCertificate the include certificate
	 * @param includeCertHash the include cert hash
	 * @param certificateUrl the certificate url
	 * @param dirPath the dir path
	 * @param partnerId the partner id
	 * @return the string
	 * @throws JoseException the jose exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws UnrecoverableEntryException the unrecoverable entry exception
	 * @throws KeyStoreException the key store exception
	 * @throws CertificateException the certificate exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws OperatorCreationException the operator creation exception
	 */
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
