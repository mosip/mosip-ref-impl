package io.mosip.keymanager.hsm.impl;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Key;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.KeyStore.PasswordProtection;
import java.security.KeyStore.PrivateKeyEntry;
import java.security.KeyStore.ProtectionParameter;
import java.security.KeyStore.SecretKeyEntry;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.Provider;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Security;
import java.security.UnrecoverableEntryException;
import java.security.UnrecoverableKeyException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.security.auth.x500.X500Principal;

import com.ncipher.km.nfkm.Module;
import com.ncipher.km.nfkm.SecurityWorld;
import com.ncipher.km.nfkm.Slot;
import com.ncipher.provider.km.nCipherKM;

import io.mosip.kernel.core.keymanager.exception.KeystoreProcessingException;
import io.mosip.kernel.core.keymanager.exception.NoSuchSecurityProviderException;
import io.mosip.kernel.core.keymanager.model.CertificateParameters;
import io.mosip.kernel.core.logger.spi.Logger;
import io.mosip.kernel.keygenerator.bouncycastle.constant.KeyGeneratorExceptionConstant;
import io.mosip.kernel.keymanager.hsm.constant.KeymanagerConstant;
import io.mosip.kernel.keymanager.hsm.constant.KeymanagerErrorCode;
import io.mosip.kernel.keymanager.hsm.util.CertificateUtility;
import io.mosip.kernel.keymanagerservice.logger.KeymanagerLogger;

/**
 * nCipher HSM Keymanager implementation based on MOSIP Keystore interface.
 * 
 * @author Mahammed Taheer
 * @since JCE
 *
 */
public class NCipherHSMKeyStoreImpl implements io.mosip.kernel.core.keymanager.spi.KeyStore {

	private static final Logger LOGGER = KeymanagerLogger.getLogger(NCipherHSMKeyStoreImpl.class);

	private static final String KEYSTORE_TYPE = "keyStoreType";

	private static final String CARD_PASSWORD = "cardProtection";

	private static final String KEYSTORE_FILE_PATH = "keyStoreFile";

	private static final String NFAST_PROTECT = "protect";

	/**
	 * Default nFast protection type to cardset.
	 */
	private static final String PROTECT_TYPE = "cardset";

	/**
	 * The type of keystore
	 */
	private String keystoreType;

	private String keyStoreFilePath;

	/**
	 * The passkey for partition
	 */
	private String keystorePass;

	/**
	 * Symmetric key algorithm Name
	 */
	private String symmetricKeyAlgorithm;

	/**
	 * Symmetric key length
	 */
	private int symmetricKeyLength;

	/**
	 * Asymmetric key algorithm Name
	 */
	private String asymmetricKeyAlgorithm;

	/**
	 * Asymmetric key length
	 */
	private int asymmetricKeyLength;

	/**
	 * Certificate Signing Algorithm
	 * 
	 */
	private String signAlgorithm;

	/**
	 * The Keystore instance
	 */
	private KeyStore keyStore;

	private Provider nCipherProvider = null;

	private char[] cardProtectionPwd = null;

	public NCipherHSMKeyStoreImpl(Map<String, String> params) throws Exception {
		this.keystoreType = params.get(KEYSTORE_TYPE);
		this.keyStoreFilePath = params.get(KEYSTORE_FILE_PATH);
		this.keystorePass = params.get(CARD_PASSWORD);

		this.symmetricKeyAlgorithm = params.get(KeymanagerConstant.SYM_KEY_ALGORITHM);
		this.symmetricKeyLength = Integer.valueOf(params.get(KeymanagerConstant.SYM_KEY_SIZE));
		this.asymmetricKeyAlgorithm = params.get(KeymanagerConstant.ASYM_KEY_ALGORITHM);
		this.asymmetricKeyLength = Integer.valueOf(params.get(KeymanagerConstant.ASYM_KEY_SIZE));
		this.signAlgorithm = params.get(KeymanagerConstant.CERT_SIGN_ALGORITHM);

		initKeystore();
		LOGGER.info("NCipher-sessionId", "nFastHSM", "id", "HSM Keystore initalized." );
	}

	private void initKeystore() {
		nCipherProvider = new nCipherKM();
		addProvider();
		cardProtectionPwd = getKeystorePwd();
		SecurityWorld secWorld = nCipherKM.getSW();
		loadFIPSAuth(secWorld);
		this.keyStore = getKeystoreInstance();
	}

	private char[] getKeystorePwd() {
		if (keystorePass.trim().length() == 0) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.NOT_VALID_STORE_PASSWORD.getErrorCode(),
					KeymanagerErrorCode.NOT_VALID_STORE_PASSWORD.getErrorMessage());
		}
		return keystorePass.toCharArray();
	}

	private void addProvider() {
		// removing the provider before adding to providers list to avoid collusion.
		Security.removeProvider(nCipherProvider.getName());
		if (-1 == Security.addProvider(nCipherProvider)) {
			throw new NoSuchSecurityProviderException(KeymanagerErrorCode.NO_SUCH_SECURITY_PROVIDER.getErrorCode(),
					KeymanagerErrorCode.NO_SUCH_SECURITY_PROVIDER.getErrorMessage());
		}
	}

	private void loadFIPSAuth(SecurityWorld secWorld) {
		try {
			Module[] modules = secWorld.getModules();
		    for (int n = 0; n < modules.length; n++) {
				Slot slot = modules[n].getSlot(0);
			    if (slot == null) {
					continue;
			  	}
			  	secWorld.loadFipsAuth(slot);
		   	}
		} catch (Exception e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage());
		}
	}

	private KeyStore getKeystoreInstance() {
		KeyStore nCipherKeyStore = null;
		try {
			System.setProperty(NFAST_PROTECT, PROTECT_TYPE);
			nCipherKeyStore = KeyStore.getInstance(keystoreType, nCipherProvider.getName());
			Path path = Paths.get(keyStoreFilePath);
			// if file is not available, it will get created when new key get created.
			if (!Files.exists(path)) {
				nCipherKeyStore.load(null, cardProtectionPwd);
			} else {
				InputStream ksStream = new FileInputStream(keyStoreFilePath);
				nCipherKeyStore.load(ksStream, cardProtectionPwd);
			}
		} catch (KeyStoreException | NoSuchAlgorithmException | CertificateException | IOException
				| NoSuchProviderException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);

		}
		return nCipherKeyStore;
	}

	@Override
	public List<String> getAllAlias() {
		Enumeration<String> enumeration = null;
		try {
			enumeration = keyStore.aliases();
		} catch (KeyStoreException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
		}
		return Collections.list(enumeration);
	}

	@Override
	public Key getKey(String alias) {
		Key key = null;
		try {
			key = keyStore.getKey(alias, cardProtectionPwd);
		} catch (UnrecoverableKeyException | KeyStoreException | NoSuchAlgorithmException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
		}
		return key;
	}

	@SuppressWarnings("findsecbugs:HARD_CODE_PASSWORD")
	@Override
	public PrivateKeyEntry getAsymmetricKey(String alias) {
		try {
            if (keyStore.entryInstanceOf(alias, PrivateKeyEntry.class)) {
                LOGGER.debug("sessionId", "KeyStoreImpl", "getAsymmetricKey", "alias is instanceof privatekeyentry");
                ProtectionParameter password = getPasswordProtection();
                return (PrivateKeyEntry) keyStore.getEntry(alias, password);
            } else {
                throw new NoSuchSecurityProviderException(KeymanagerErrorCode.NO_SUCH_ALIAS.getErrorCode(),
                        KeymanagerErrorCode.NO_SUCH_ALIAS.getErrorMessage() + alias);
            }
        } catch (NoSuchAlgorithmException | UnrecoverableEntryException | KeyStoreException e) {
            throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
                    KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
        }
	}

	@Override
	public PrivateKey getPrivateKey(String alias) {
		PrivateKeyEntry privateKeyEntry = getAsymmetricKey(alias);
		return privateKeyEntry.getPrivateKey();
	}

	@Override
	public PublicKey getPublicKey(String alias) {
		PrivateKeyEntry privateKeyEntry = getAsymmetricKey(alias);
		Certificate[] certificates = privateKeyEntry.getCertificateChain();
		return certificates[0].getPublicKey();
	}

	@Override
	public X509Certificate getCertificate(String alias) {
		PrivateKeyEntry privateKeyEntry = getAsymmetricKey(alias);
		X509Certificate[] certificates = (X509Certificate[]) privateKeyEntry.getCertificateChain();
		return certificates[0];
	}

	@SuppressWarnings("findsecbugs:HARD_CODE_PASSWORD")
	@Override
	public SecretKey getSymmetricKey(String alias) {
		try {
			if (keyStore.entryInstanceOf(alias, SecretKeyEntry.class)) {
				ProtectionParameter password = getPasswordProtection();
				SecretKeyEntry retrivedSecret = (SecretKeyEntry) keyStore.getEntry(alias, password);
				return retrivedSecret.getSecretKey();
			} else {
				throw new NoSuchSecurityProviderException(KeymanagerErrorCode.NO_SUCH_ALIAS.getErrorCode(),
						KeymanagerErrorCode.NO_SUCH_ALIAS.getErrorMessage() + alias);
			}
		} catch (NoSuchAlgorithmException | UnrecoverableEntryException | KeyStoreException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
		}
	}

	@Override
	public void deleteKey(String alias) {
		try {
			keyStore.deleteEntry(alias);
		} catch (KeyStoreException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
		}
	}

	@SuppressWarnings("findsecbugs:HARD_CODE_PASSWORD")
	@Override
	public void generateAndStoreAsymmetricKey(String alias, String signKeyAlias, CertificateParameters certParams) {
		KeyPair keyPair = null;
		PrivateKey signPrivateKey = null;
		X500Principal signerPrincipal = null;
		if (Objects.nonNull(signKeyAlias)) {
			PrivateKeyEntry signKeyEntry = getAsymmetricKey(signKeyAlias);
			signPrivateKey = signKeyEntry.getPrivateKey();
			X509Certificate signCert = (X509Certificate) signKeyEntry.getCertificate();
			signerPrincipal = signCert.getSubjectX500Principal();
			keyPair = generateKeyPair(alias);
		} else {
			keyPair = generateKeyPair(alias);
			signPrivateKey = keyPair.getPrivate();
		}
		X509Certificate x509Cert = CertificateUtility.generateX509Certificate(signPrivateKey, keyPair.getPublic(),
				certParams, signerPrincipal, signAlgorithm, nCipherProvider.getName());
		X509Certificate[] chain = new X509Certificate[] { x509Cert };
		storeCertificate(alias, chain, keyPair.getPrivate());
	}

	private void storeCertificate(String alias, Certificate[] chain, PrivateKey privateKey) {
		PrivateKeyEntry privateKeyEntry = new PrivateKeyEntry(privateKey, chain);
		ProtectionParameter password = getPasswordProtection();
		try {
			keyStore.setEntry(alias, privateKeyEntry, password);
			persistKeyInHSM();
		} catch (KeyStoreException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage());
		}

	}

	@SuppressWarnings("findsecbugs:HARD_CODE_PASSWORD")
	@Override
	public void generateAndStoreSymmetricKey(String alias) {
		SecretKey secretKey = generateSymmetricKey(alias);
		SecretKeyEntry secret = new SecretKeyEntry(secretKey);
		ProtectionParameter password = getPasswordProtection();
		try {
			keyStore.setEntry(alias, secret, password);
			persistKeyInHSM();
		} catch (KeyStoreException e) {
			e.printStackTrace();
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
		}
	}

	private KeyPair generateKeyPair(String keyAlias) {
		try {
			KeyPairGenerator generator = KeyPairGenerator.getInstance(asymmetricKeyAlgorithm, nCipherProvider.getName());
			SecureRandom random = new SecureRandom();
			generator.initialize(asymmetricKeyLength, random);
			return generator.generateKeyPair();
		} catch (java.security.NoSuchAlgorithmException | NoSuchProviderException e) {
			throw new io.mosip.kernel.core.exception.NoSuchAlgorithmException(
					KeyGeneratorExceptionConstant.MOSIP_NO_SUCH_ALGORITHM_EXCEPTION.getErrorCode(),
					KeyGeneratorExceptionConstant.MOSIP_NO_SUCH_ALGORITHM_EXCEPTION.getErrorMessage(), e);
		}
	}

	private SecretKey generateSymmetricKey(String keyAlias) {
		try {
			KeyGenerator generator = KeyGenerator.getInstance(symmetricKeyAlgorithm, nCipherProvider.getName());
			SecureRandom random = new SecureRandom();
			generator.init(symmetricKeyLength, random);
			return generator.generateKey();
		} catch (java.security.NoSuchAlgorithmException | NoSuchProviderException e) {
			throw new io.mosip.kernel.core.exception.NoSuchAlgorithmException(
					KeyGeneratorExceptionConstant.MOSIP_NO_SUCH_ALGORITHM_EXCEPTION.getErrorCode(),
					KeyGeneratorExceptionConstant.MOSIP_NO_SUCH_ALGORITHM_EXCEPTION.getErrorMessage(), e);
		}
	}

	@Override
	public void storeCertificate(String alias, PrivateKey privateKey, Certificate certificate) {
		try {
			PrivateKeyEntry privateKeyEntry = new PrivateKeyEntry(privateKey, new Certificate[] {certificate});
			ProtectionParameter password = getPasswordProtection();
            keyStore.setEntry(alias, privateKeyEntry, password);
            persistKeyInHSM();
		} catch (KeyStoreException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
		}
	}

	@Override
	public String getKeystoreProviderName() {
		if (Objects.nonNull(keyStore)) {
			return nCipherProvider.getName();
		}
		throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_NOT_INSTANTIATED.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_NOT_INSTANTIATED.getErrorMessage());
	}

	private PasswordProtection getPasswordProtection() {
		if (cardProtectionPwd == null) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.NOT_VALID_STORE_PASSWORD.getErrorCode(),
					KeymanagerErrorCode.NOT_VALID_STORE_PASSWORD.getErrorMessage());
		}
		return new PasswordProtection(cardProtectionPwd);
    }
    
    private void persistKeyInHSM(){
        try {
			FileOutputStream outStream = new FileOutputStream(keyStoreFilePath);
            keyStore.store(outStream, cardProtectionPwd);
        } catch (KeyStoreException | NoSuchAlgorithmException | CertificateException | IOException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
		}
	}
}
