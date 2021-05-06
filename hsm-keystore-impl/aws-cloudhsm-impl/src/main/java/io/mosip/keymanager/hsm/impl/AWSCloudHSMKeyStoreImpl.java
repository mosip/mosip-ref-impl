package io.mosip.keymanager.hsm.impl;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidAlgorithmParameterException;
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
import java.security.Security;
import java.security.UnrecoverableEntryException;
import java.security.UnrecoverableKeyException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.security.auth.x500.X500Principal;

import com.cavium.cfm2.CFM2Exception;
import com.cavium.cfm2.LoginManager;
import com.cavium.key.parameter.CaviumAESKeyGenParameterSpec;
import com.cavium.key.parameter.CaviumRSAKeyGenParameterSpec;
import com.cavium.provider.CaviumProvider;

import io.mosip.kernel.core.keymanager.exception.KeystoreProcessingException;
import io.mosip.kernel.core.keymanager.exception.NoSuchSecurityProviderException;
import io.mosip.kernel.core.keymanager.model.CertificateParameters;
import io.mosip.kernel.core.logger.spi.Logger;
import io.mosip.kernel.core.util.DateUtils;
import io.mosip.kernel.keygenerator.bouncycastle.constant.KeyGeneratorExceptionConstant;
import io.mosip.kernel.keymanager.hsm.constant.KeymanagerConstant;
import io.mosip.kernel.keymanager.hsm.constant.KeymanagerErrorCode;
import io.mosip.kernel.keymanager.hsm.util.CertificateUtility;
import io.mosip.kernel.keymanagerservice.logger.KeymanagerLogger;

/**
 * AWS CloudHSM Keymanager implementation based on MOSIP Keystore interface.
 * 
 * @author Mahammed Taheer
 * @since JCE
 *
 */
public class AWSCloudHSMKeyStoreImpl implements io.mosip.kernel.core.keymanager.spi.KeyStore {

	private static final Logger LOGGER = KeymanagerLogger.getLogger(AWSCloudHSMKeyStoreImpl.class);

	private static final int PROVIDER_ALLOWED_RELOAD_INTERVEL_IN_SECONDS = 60;

	private static final int NO_OF_RETRIES = 3;
	
	private static final BigInteger DEFAULT_PUBLIC_EXPONENT = new BigInteger("65537");
	private static final String PUBLIC_KEY_ALIAS_SUFFIX = ":public";

	private static final boolean KEY_EXTRACTABLE = false;

	private static final boolean KEY_PERSISTENT = true;

	private static final String KEYSTORE_TYPE = "keyStoreType";

	private static final String KEYSTORE_FILE_PATH = "keyStoreFile";

	private static final String LOCAL_KEYSTORE_PASSWORD = "localKeyStorePwd";

	private static final String PARITION_NAME = "partitionName";

	private static final String HSM_CU_USER_NAME = "cuUserName";

	private static final String HSM_CU_PASSWORD = "cuPassword";


	/**
	 * The type of keystore, e.g. Luna
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

	private Provider cloudHSMProvider = null;

	private char[] partitionPwdCharArr = null;

	private boolean enableKeyReferenceCache;

	private Map<String, PrivateKeyEntry> privateKeyReferenceCache;

	private Map<String, SecretKey> secretKeyReferenceCache;

	private LocalDateTime lastProviderLoadedTime;
	
	public AWSCloudHSMKeyStoreImpl(Map<String, String> params) throws Exception {
		this.keystoreType = params.get(KEYSTORE_TYPE);
		this.keyStoreFilePath = params.get(KEYSTORE_FILE_PATH);
		this.keystorePass = params.get(LOCAL_KEYSTORE_PASSWORD);

		this.symmetricKeyAlgorithm = params.get(KeymanagerConstant.SYM_KEY_ALGORITHM);
		this.symmetricKeyLength = Integer.valueOf(params.get(KeymanagerConstant.SYM_KEY_SIZE));
		this.asymmetricKeyAlgorithm = params.get(KeymanagerConstant.ASYM_KEY_ALGORITHM);
		this.asymmetricKeyLength = Integer.valueOf(params.get(KeymanagerConstant.ASYM_KEY_SIZE));
		this.signAlgorithm = params.get(KeymanagerConstant.CERT_SIGN_ALGORITHM);

		String partitionName = params.get(PARITION_NAME);
		String cuUserName = params.get(HSM_CU_USER_NAME);
		String cuPassword = params.get(HSM_CU_PASSWORD);
		
		initKeystore();
		loginHSM(partitionName, cuUserName, cuPassword);
		lastProviderLoadedTime = DateUtils.getUTCCurrentDateTime();
		this.enableKeyReferenceCache = Boolean.parseBoolean(params.get(KeymanagerConstant.FLAG_KEY_REF_CACHE));
		LOGGER.info("AWS-sessionId", "CloudHSM", "id", "Cloud HSM Keystore enableKeyReferenceCache flag: " + enableKeyReferenceCache);
		initKeyReferenceCache();
		LOGGER.info("AWS-sessionId", "CloudHSM", "id", "Cloud HSM Keystore initialization completed. Provider Name: " + cloudHSMProvider.getName());
	}

	private void initKeystore() {
		setupProvider();
		addProvider();
		partitionPwdCharArr = getKeystorePwd();
		this.keyStore = getKeystoreInstance();
	}

	private void setupProvider() {

		try {
			cloudHSMProvider = new CaviumProvider();
		} catch (IOException ioException) {
			throw new NoSuchSecurityProviderException(KeymanagerErrorCode.NO_SUCH_SECURITY_PROVIDER.getErrorCode(),
					KeymanagerErrorCode.NO_SUCH_SECURITY_PROVIDER.getErrorMessage(), ioException);
		}
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
		Security.removeProvider(cloudHSMProvider.getName());
		if (-1 == Security.addProvider(cloudHSMProvider)) {
			throw new NoSuchSecurityProviderException(KeymanagerErrorCode.NO_SUCH_SECURITY_PROVIDER.getErrorCode(),
					KeymanagerErrorCode.NO_SUCH_SECURITY_PROVIDER.getErrorMessage());
		}
	}

	private KeyStore getKeystoreInstance() {
		KeyStore caviumKeyStore = null;
		try {
			caviumKeyStore = KeyStore.getInstance(keystoreType, cloudHSMProvider.getName());
			Path path = Paths.get(keyStoreFilePath);
			// if file is not available, it will get created when new key get created.
			if (!Files.exists(path)) {
				caviumKeyStore.load(null, null);
			} else {
				InputStream ksStream = new FileInputStream(keyStoreFilePath);
				caviumKeyStore.load(ksStream, partitionPwdCharArr);
			}
		} catch (KeyStoreException | NoSuchAlgorithmException | CertificateException | IOException
				| NoSuchProviderException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);

		}
		return caviumKeyStore;
	}

	private void loginHSM(String partitionName, String cuUser, String cuPswd) {
		LoginManager loginMgr = LoginManager.getInstance();
        try {
            loginMgr.login(partitionName, cuUser, cuPswd);
			LOGGER.info("AWS-sessionId", "CloudHSM", "Cred", "Login Successful!!");
        } catch (CFM2Exception e) {
            if (CFM2Exception.isAuthenticationFailure(e)) {
				throw new KeystoreProcessingException(KeymanagerErrorCode.NOT_VALID_STORE_PASSWORD.getErrorCode(),
					KeymanagerErrorCode.NOT_VALID_STORE_PASSWORD.getErrorMessage() + "Invalid Credentials", e);
            }
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
        }
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
			key = keyStore.getKey(alias, partitionPwdCharArr);
		} catch (UnrecoverableKeyException | KeyStoreException | NoSuchAlgorithmException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
		}
		return key;
	}

	@SuppressWarnings("findsecbugs:HARD_CODE_PASSWORD")
	@Override
	public PrivateKeyEntry getAsymmetricKey(String alias) {
		PrivateKeyEntry privateKeyEntry = getPrivateKeyEntryFromCache(alias);
		if(privateKeyEntry != null)
			return privateKeyEntry;
		int i = 0;
		boolean isException = false;
		String expMessage = "";
		Exception exp = null;
		do {
			try {
				if (keyStore.entryInstanceOf(alias, PrivateKeyEntry.class)) {
					LOGGER.info("sessionId", "KeyStoreImpl", "getAsymmetricKey", "retry counter: " + i);
					ProtectionParameter password = getPasswordProtection();
					privateKeyEntry = (PrivateKeyEntry) keyStore.getEntry(alias, password);
					if (privateKeyEntry != null) {
						LOGGER.debug("sessionId", "KeyStoreImpl", "getAsymmetricKey", "privateKeyEntry is not null");
						break;
					}
					
				} else {
					throw new NoSuchSecurityProviderException(KeymanagerErrorCode.NO_SUCH_ALIAS.getErrorCode(),
							KeymanagerErrorCode.NO_SUCH_ALIAS.getErrorMessage() + alias);
				}
			} catch (NoSuchAlgorithmException | UnrecoverableEntryException e) {
				throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
						KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
			} catch (KeyStoreException kse) {
				isException = true;
				expMessage = kse.getMessage();
				exp = kse;
				LOGGER.debug("sessionId", "KeyStoreImpl", "getAsymmetricKey", expMessage);
			}
			if (isException) {
				reloadProvider();
				isException = false;
			}
		} while (i++ < NO_OF_RETRIES);
		if (Objects.isNull(privateKeyEntry)) {
			LOGGER.debug("sessionId", "KeyStoreImpl", "getAsymmetricKey", "privateKeyEntry is null");
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + expMessage, exp);
		}
		addPrivateKeyEntryToCache(alias, privateKeyEntry);
		return privateKeyEntry;
	}

	private synchronized void reloadProvider() {
		LOGGER.info("sessionId", "KeyStoreImpl", "KeyStoreImpl", "reloading provider");
		if(DateUtils.getUTCCurrentDateTime().isBefore(
				lastProviderLoadedTime.plusSeconds(PROVIDER_ALLOWED_RELOAD_INTERVEL_IN_SECONDS))) {
			LOGGER.warn("sessionId", "KeyStoreImpl", "reloadProvider", 
				"Last time successful reload done on " + lastProviderLoadedTime.toString() + 
					", so reloading not done before interval of " + 
					PROVIDER_ALLOWED_RELOAD_INTERVEL_IN_SECONDS + " sec");
			return;
		}
		setupProvider();
		addProvider();
		this.keyStore = getKeystoreInstance();
		lastProviderLoadedTime = DateUtils.getUTCCurrentDateTime();
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
		SecretKey secretKey = getSecretKeyFromCache(alias);
		if(secretKey != null)
			return secretKey;

		try {
			if (keyStore.entryInstanceOf(alias, SecretKeyEntry.class)) {
				ProtectionParameter password = getPasswordProtection();
				SecretKeyEntry retrivedSecret = (SecretKeyEntry) keyStore.getEntry(alias, password);
				secretKey = retrivedSecret.getSecretKey();
				addSecretKeyToCache(alias, secretKey);
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
			keyPair = generateKeyPair(alias); // To avoid key generation in HSM.
		} else {
			keyPair = generateKeyPair(alias);
			signPrivateKey = keyPair.getPrivate();
		}
		X509Certificate x509Cert = CertificateUtility.generateX509Certificate(signPrivateKey, keyPair.getPublic(),
				certParams, signerPrincipal, signAlgorithm, cloudHSMProvider.getName());
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
			KeyPairGenerator generator = KeyPairGenerator.getInstance(asymmetricKeyAlgorithm);
			CaviumRSAKeyGenParameterSpec caviumRSASpec = new CaviumRSAKeyGenParameterSpec(asymmetricKeyLength,
					DEFAULT_PUBLIC_EXPONENT, keyAlias + PUBLIC_KEY_ALIAS_SUFFIX, keyAlias, KEY_EXTRACTABLE,
					KEY_PERSISTENT);
			generator.initialize(caviumRSASpec);
			return generator.generateKeyPair();
		} catch (java.security.NoSuchAlgorithmException | InvalidAlgorithmParameterException e) {
			throw new io.mosip.kernel.core.exception.NoSuchAlgorithmException(
					KeyGeneratorExceptionConstant.MOSIP_NO_SUCH_ALGORITHM_EXCEPTION.getErrorCode(),
					KeyGeneratorExceptionConstant.MOSIP_NO_SUCH_ALGORITHM_EXCEPTION.getErrorMessage(), e);
		}
	}

	private SecretKey generateSymmetricKey(String keyAlias) {
		try {
			KeyGenerator generator = KeyGenerator.getInstance(symmetricKeyAlgorithm, cloudHSMProvider.getName());
			CaviumAESKeyGenParameterSpec caviumAESSpec = new CaviumAESKeyGenParameterSpec(symmetricKeyLength, keyAlias, 
								KEY_EXTRACTABLE, KEY_PERSISTENT);
			generator.init(caviumAESSpec);
			return generator.generateKey();
		} catch (java.security.NoSuchAlgorithmException | NoSuchProviderException
				| InvalidAlgorithmParameterException e) {
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
			return cloudHSMProvider.getName();
		}
		throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_NOT_INSTANTIATED.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_NOT_INSTANTIATED.getErrorMessage());
	}

	private PasswordProtection getPasswordProtection() {
		if (partitionPwdCharArr == null) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.NOT_VALID_STORE_PASSWORD.getErrorCode(),
					KeymanagerErrorCode.NOT_VALID_STORE_PASSWORD.getErrorMessage());
		}
		return new PasswordProtection(partitionPwdCharArr);
    }
    
    private void persistKeyInHSM(){
        try {
			FileOutputStream outStream = new FileOutputStream(keyStoreFilePath);
            keyStore.store(outStream, partitionPwdCharArr);
        } catch (KeyStoreException | NoSuchAlgorithmException | CertificateException | IOException e) {
			throw new KeystoreProcessingException(KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorCode(),
					KeymanagerErrorCode.KEYSTORE_PROCESSING_ERROR.getErrorMessage() + e.getMessage(), e);
		}
	}
	
	private void initKeyReferenceCache() {
		if(!enableKeyReferenceCache)
			return;
		this.privateKeyReferenceCache = new ConcurrentHashMap<>();
		this.secretKeyReferenceCache = new ConcurrentHashMap<>();
	}

	private void addPrivateKeyEntryToCache(String alias, PrivateKeyEntry privateKeyEntry) {
		if(!enableKeyReferenceCache)
			return;
		LOGGER.debug("sessionId", "KeyStoreImpl", "addPrivateKeyEntryToCache", 
			"Adding private key reference to map for alias " + alias);
		this.privateKeyReferenceCache.put(alias, privateKeyEntry);
	}

	private PrivateKeyEntry getPrivateKeyEntryFromCache(String alias) {
		if(!enableKeyReferenceCache)
			return null;
		return this.privateKeyReferenceCache.get(alias);
	}

	private void addSecretKeyToCache(String alias, SecretKey secretKey) {
		if(!enableKeyReferenceCache)
			return;
		LOGGER.debug("sessionId", "KeyStoreImpl", "addSecretKeyToCache", 
			"Adding secretKey reference to map for alias " + alias);
		this.secretKeyReferenceCache.put(alias, secretKey);
	}

	private SecretKey getSecretKeyFromCache(String alias) {
		if(!enableKeyReferenceCache)
			return null;
		return this.secretKeyReferenceCache.get(alias);
	}
}
