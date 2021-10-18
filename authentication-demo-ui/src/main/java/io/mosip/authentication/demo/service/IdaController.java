package io.mosip.authentication.demo.service;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStore.PrivateKeyEntry;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.UnrecoverableEntryException;
import java.security.cert.Certificate;
import java.security.cert.CertificateEncodingException;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.MGF1ParameterSpec;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TimeZone;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.annotation.PostConstruct;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource.PSpecified;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.bouncycastle.operator.OperatorCreationException;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import io.mosip.authentication.demo.dto.AuthRequestDTO;
import io.mosip.authentication.demo.dto.CryptomanagerRequestDto;
import io.mosip.authentication.demo.dto.EncryptionRequestDto;
import io.mosip.authentication.demo.dto.EncryptionResponseDto;
import io.mosip.authentication.demo.dto.OtpRequestDTO;
import io.mosip.authentication.demo.dto.RequestDTO;
import io.mosip.authentication.demo.helper.CryptoUtility;
import io.mosip.authentication.demo.service.util.KeyMgrUtil;
import io.mosip.authentication.demo.service.util.SignatureUtil;
import io.mosip.kernel.core.http.RequestWrapper;
import io.mosip.kernel.core.util.CryptoUtil;
import io.mosip.kernel.core.util.DateUtils;
import io.mosip.kernel.core.util.HMACUtils2;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonBar;
import javafx.scene.control.ButtonType;
import javafx.scene.control.CheckBox;
import javafx.scene.control.ComboBox;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.image.ImageView;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.GridPane;
import javafx.scene.text.Font;
import javafx.stage.Modality;
import javafx.stage.Stage;

/**
 * The Class IdaController.
 * 
 * @author Sanjay Murali
 */
@Component
public class IdaController {

	private static final String DEFAULT_SUBID = "0";

	@Autowired
	private Environment env;

	/** The sign refid. */
	@Value("${mosip.sign.refid:SIGN}")
	private String signRefid;

	private static final String SSL = "SSL";

	ObjectMapper mapper = new ObjectMapper();
	
	@FXML
	private GridPane parent;

	@FXML
	ComboBox<String> irisCount;

	@FXML
	ComboBox<String> fingerCount;

	@FXML
	private TextField idValue;

	@FXML
	private CheckBox fingerAuthType;

	@FXML
	private CheckBox irisAuthType;

	@FXML
	private CheckBox faceAuthType;

	@FXML
	private CheckBox otpAuthType;

	@FXML
	private CheckBox demoAuthType;

	@FXML
	private CheckBox eKyc;

	@FXML
	private TextArea demoInputData;

	@FXML
	private ComboBox<String> idTypebox;

	@FXML
	private TextField otpValue;

	@FXML
	private AnchorPane otpAnchorPane;

	@FXML
	private AnchorPane bioAnchorPane;

	@FXML
	private TextField responsetextField;

	@FXML
	private ImageView img;

	@FXML
	private Button requestOtp;

	@FXML
	private Button sendAuthRequest;

	@FXML
	private Button ekycResponse;

	private String capture;

	private String previousHash;

	private ObjectMapper objectMapper = new ObjectMapper();

	@Autowired
	private SignatureUtil signatureUtil;

	@Autowired
	private KeyMgrUtil keyMgrUtil;
	
	Stage dialog;
	
	private String ekycResponseText;

	@PostConstruct
	public void postConstruct() throws NoSuchAlgorithmException, UnrecoverableEntryException, KeyStoreException,
			CertificateException, OperatorCreationException, IOException {
		initializeKeysAndCerts();
	}

	private void initializeKeysAndCerts() throws NoSuchAlgorithmException, UnrecoverableEntryException,
			KeyStoreException, CertificateException, IOException, OperatorCreationException {
		String partnerId = env.getProperty("partnerId");
		String organization = env.getProperty("partnerOrg", env.getProperty("partnerId"));
		String dirPath = keyMgrUtil.getKeysDirPath();
		// Check if partner private (<partnerId>.p12) key is present in keys dir
		PrivateKeyEntry keyEntry = keyMgrUtil.getKeyEntry(dirPath, partnerId);
		if (keyEntry == null) {
			System.out.println("Initializing parnter keys and certificates..");
			keyMgrUtil.getPartnerCertificates(partnerId, organization, dirPath);
			System.out.println("Completed initializing parnter keys and certificates. Location: " + dirPath);
		} else {
			System.out.println("Parnter keys and certificates already available.");
		}
	}

	@FXML
	private void initialize() {
		responsetextField.setText(null);

		ObservableList<String> idTypeChoices = FXCollections.observableArrayList("UIN", "VID", "USERID");
		ObservableList<String> fingerCountChoices = FXCollections.observableArrayList("1", "2", "3", "4", "5", "6", "7",
				"8", "9", "10");
		fingerCount.setItems(fingerCountChoices);
		fingerCount.getSelectionModel().select(0);

		ObservableList<String> irisCountChoices = FXCollections.observableArrayList("Left Iris", "Right Iris",
				"Both Iris");
		irisCount.setItems(irisCountChoices);
		irisCount.getSelectionModel().select(0);

		idTypebox.setItems(idTypeChoices);
		idTypebox.setValue("UIN");
		otpAnchorPane.setDisable(true);
		bioAnchorPane.setDisable(true);
		responsetextField.setDisable(true);
		requestOtp.setDisable(true);
		sendAuthRequest.setDisable(true);
		demoInputData.setDisable(true);
		ekycResponse.setVisible(false);
		ekycResponse.setOnAction(event -> {
			displayDialog(ekycResponseText);
		});
		idValue.textProperty().addListener((observable, oldValue, newValue) -> {
			updateSendButton();
		});

		otpValue.textProperty().addListener((observable, oldValue, newValue) -> {
			updateSendButton();
		});
	}

	private void displayDialog(String data) {
		if(dialog ==  null || ekycTextArea == null) {
			ekycTextArea = new TextArea();
			
			dialog = new Stage();
			dialog.initModality(Modality.NONE);
			AnchorPane dialogVbox = new AnchorPane();
			AnchorPane.setTopAnchor(ekycTextArea, 0.0);
			AnchorPane.setBottomAnchor(ekycTextArea, 0.0);
			AnchorPane.setLeftAnchor(ekycTextArea, 0.0);
			AnchorPane.setRightAnchor(ekycTextArea, 0.0);
			ekycTextArea.setEditable(false);
			dialogVbox.getChildren().add(ekycTextArea);
			Scene dialogScene = new Scene(dialogVbox);
			dialog.setScene(dialogScene);
			dialog.setTitle("eKYC");
			
		} 
		
		ekycTextArea.setText(data);
		dialog.setAlwaysOnTop(true);
		dialog.show();
	}

	@FXML
	private void onFingerPrintAuth() {
		updateBioCapture();
	}

	private void updateBioCapture() {
		capture = null;
		previousHash = null;
		updateBioPane();
		updateSendButton();
	}

	@FXML
	private void onIrisAuth() {
		updateBioCapture();
	}

	@FXML
	private void onFaceAuth() {
		updateBioCapture();
	}

	private void updateSendButton() {
		if (idValue.getText() == null || idValue.getText().trim().isEmpty()) {
			sendAuthRequest.setDisable(true);
			requestOtp.setDisable(true);
			return;
		}
		
		requestOtp.setDisable(!otpAuthType.isSelected());

		if (otpAuthType.isSelected()) {
			if (otpValue.getText().trim().isEmpty()) {
				sendAuthRequest.setDisable(true);
				return;
			}
		}

		if (isBioAuthType()) {
			if (capture == null) {
				sendAuthRequest.setDisable(true);
				return;
			}
		}

		sendAuthRequest.setDisable(!(demoAuthType.isSelected() || isBioAuthType() || otpAuthType.isSelected()));

	}

	private void updateBioPane() {
		if (isBioAuthType()) {
			bioAnchorPane.setDisable(false);
		} else {
			bioAnchorPane.setDisable(true);
		}
		irisCount.setDisable(!irisAuthType.isSelected());
		fingerCount.setDisable(!fingerAuthType.isSelected());
	}

	@FXML
	private void onOTPAuth() {
		responsetextField.setText(null);
		otpAnchorPane.setDisable(!otpAnchorPane.isDisable());
		updateSendButton();
	}

	@FXML
	private void onIdTypeChange() {
		responsetextField.setText(null);
	}

	@FXML
	private void onSubTypeSelection() {
		responsetextField.setText(null);
	}

	@FXML
	private void onCapture() throws Exception {
		responsetextField.setFont(Font.font("Times New Roman", javafx.scene.text.FontWeight.EXTRA_BOLD, 20));
		previousHash = null;
		List<String> bioCaptures = new ArrayList<>();

		String faceCapture;
		if (faceAuthType.isSelected()) {
			faceCapture = captureFace();
			if (!faceCapture.contains("\"biometrics\"")) {
				updateSendButton();
				return;
			}
			bioCaptures.add(faceCapture);
		}

		String fingerCapture;
		if (fingerAuthType.isSelected()) {
			fingerCapture = captureFingerprint();
			if (!fingerCapture.contains("\"biometrics\"")) {
				updateSendButton();
				return;
			}
			bioCaptures.add(fingerCapture);
		}

		String irisCapture;
		if (irisAuthType.isSelected()) {
			irisCapture = captureIris();
			if (!irisCapture.contains("\"biometrics\"")) {
				updateSendButton();
				return;
			}
			bioCaptures.add(irisCapture);
		}

		capture = combineCaptures(bioCaptures);

		updateSendButton();
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	private String combineCaptures(List<String> bioCaptures) {
		List<String> captures = bioCaptures.stream().filter(obj -> obj != null)
				.filter(str -> str.contains("\"biometrics\"")).collect(Collectors.toList());

		if (captures.isEmpty()) {
			return null;
		}

		if (captures.size() == 1) {
			return captures.get(0);
		}

		LinkedHashMap<String, Object> identity = new LinkedHashMap<String, Object>();
		List<Map<String, Object>> biometricsList = captures.stream().map(obj -> {
			try {
				return objectMapper.readValue(obj, Map.class);
			} catch (IOException e) {
				e.printStackTrace();
			}
			return null;
		}).map(map -> map.get("biometrics")).filter(obj -> obj instanceof List).map(obj -> (List<Map>) obj)
				.flatMap(list -> list.stream()).filter(obj -> obj instanceof Map).map(obj -> (Map<String, Object>) obj)
				.collect(Collectors.toList());

		identity.put("biometrics", biometricsList);

		try {
			return objectMapper.writeValueAsString(identity);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}

		return null;

	}

	/**
	 * 
	 * @return
	 */
	private String getCaptureRequestTemplate() {
		String requestBody = new String(
				cryptoUtil.decodeBase64(env.getProperty("ida.request.captureRequest.template")));
		System.out.println(requestBody);
		return requestBody;
	}

	private String captureFingerprint() throws Exception {
		responsetextField.setText("Capturing Fingerprint...");
		responsetextField.setStyle("-fx-text-fill: black; -fx-font-size: 20px; -fx-font-weight: bold");

		String requestBody = getCaptureRequestTemplate();

		requestBody = requestBody.replace("$timeout", env.getProperty("ida.request.captureFinger.timeout"))
				.replace("$count", String.valueOf(getFingerCount()))
				.replace("$deviceId", env.getProperty("ida.request.captureFinger.deviceId"))
				.replace("$domainUri", env.getProperty("ida.request.captureFinger.domainUri"))
				.replace("$deviceSubId", getFingerDeviceSubId()).replace("$captureTime", getCaptureTime())
				.replace("$previousHash", getPreviousHash())
				.replace("$requestedScore", env.getProperty("ida.request.captureFinger.requestedScore"))
				.replace("$type", env.getProperty("ida.request.captureFinger.type"))
				.replace("$bioSubType",
						getBioSubTypeString(getFingerCount(), env.getProperty("ida.request.captureFinger.bioSubType")))
				.replace("$name", env.getProperty("ida.request.captureFinger.name"))
				.replace("$value", env.getProperty("ida.request.captureFinger.value"))
				.replace("$env", env.getProperty("ida.request.captureFinger.env"));

		return capturebiometrics(requestBody);
	}

	private String getFingerDeviceSubId() {
		return env.getProperty("finger.device.subid", DEFAULT_SUBID);
	}

	private String getIrisDeviceSubId() {
		String irisSubId = env.getProperty("iris.device.subid");
		if (irisSubId == null) {
			if (irisCount.getSelectionModel().getSelectedIndex() == 0) {
				irisSubId = String.valueOf(1);
			} else if (irisCount.getSelectionModel().getSelectedIndex() == 1) {
				irisSubId = String.valueOf(2);
			} else {
				irisSubId = String.valueOf(3);
			}
		}
		return irisSubId;
	}

	private String getFaceDeviceSubId() {
		return env.getProperty("face.device.subid", DEFAULT_SUBID);
	}

	private String captureIris() throws Exception {
		responsetextField.setText("Capturing Iris...");
		responsetextField.setStyle("-fx-text-fill: black; -fx-font-size: 20px; -fx-font-weight: bold");

		String requestBody = getCaptureRequestTemplate();

		String irisSubtype = getIrisSubType(getIrisCount());
		String bioSubType = getBioSubTypeString(getIrisCount(), irisSubtype);
		requestBody = requestBody.replace("$timeout", env.getProperty("ida.request.captureIris.timeout"))
				.replace("$count", String.valueOf(getIrisCount()))
				.replace("$deviceId", env.getProperty("ida.request.captureIris.deviceId"))
				.replace("$domainUri", env.getProperty("ida.request.captureIris.domainUri"))
				.replace("$deviceSubId", getIrisDeviceSubId()).replace("$captureTime", getCaptureTime())
				.replace("$previousHash", getPreviousHash())
				.replace("$requestedScore", env.getProperty("ida.request.captureIris.requestedScore"))
				.replace("$type", env.getProperty("ida.request.captureIris.type"))
				.replace("$bioSubType",	bioSubType)
				.replace("$name", env.getProperty("ida.request.captureIris.name"))
				.replace("$value", env.getProperty("ida.request.captureIris.value"))
				.replace("$env", env.getProperty("ida.request.captureIris.env"));

		return capturebiometrics(requestBody);
	}

	private String getIrisSubType(int count) {
		return env.getProperty("ida.request.captureIris.bioSubType");
	}

	private String captureFace() throws Exception {
		responsetextField.setText("Capturing Face...");
		responsetextField.setStyle("-fx-text-fill: black; -fx-font-size: 20px; -fx-font-weight: bold");

		String requestBody = getCaptureRequestTemplate();

		requestBody = requestBody.replace("$timeout", env.getProperty("ida.request.captureFace.timeout"))
				.replace("$count", String.valueOf(getFaceCount()))
				.replace("$deviceId", env.getProperty("ida.request.captureFace.deviceId"))
				.replace("$domainUri", env.getProperty("ida.request.captureFace.domainUri"))
				.replace("$deviceSubId", getFaceDeviceSubId()).replace("$captureTime", getCaptureTime())
				.replace("$previousHash", getPreviousHash())
				.replace("$requestedScore", env.getProperty("ida.request.captureFace.requestedScore"))
				.replace("$type", env.getProperty("ida.request.captureFace.type"))
				.replace("$bioSubType",
						getBioSubTypeString(getFaceCount(), env.getProperty("ida.request.captureFace.bioSubType")))
				.replace("$name", env.getProperty("ida.request.captureFace.name"))
				.replace("$value", env.getProperty("ida.request.captureFace.value"))
				.replace("$env", env.getProperty("ida.request.captureFace.env"));

		return capturebiometrics(requestBody);
	}

	private String getPreviousHash() {
		return previousHash == null ? "" : previousHash;
	}

	private int getFingerCount() {
		return fingerCount.getValue() == null ? 1 : Integer.parseInt(fingerCount.getValue());
	}

	private String getBioSubTypeString(int count, String bioValue) {
		if (count == 1) {
			return "\"" + bioValue + "\"";
		}
		String finalStr = "\"" + bioValue + "\"";
		for (int i = 2; i <= count; i++) {
			finalStr = finalStr + "," + "\"" + bioValue + "\"";
		}

		return finalStr;
	}

	private int getIrisCount() {
		return irisCount.getSelectionModel().getSelectedIndex() == 2 ? 2 : 1;
	}

	private int getFaceCount() {
		return 1;
	}

	private String getCaptureTime() {
		TimeZone tz = TimeZone.getTimeZone("UTC");
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"); // Quoted "Z" to indicate UTC, no timezone
																			// offset
		df.setTimeZone(tz);
		String nowAsISO = df.format(new Date());
		return nowAsISO;
	}

	@SuppressWarnings("rawtypes")
	private String capturebiometrics(String requestBody) throws Exception {
		System.out.println("Capture request:\n" + requestBody);
		CloseableHttpClient client = HttpClients.createDefault();
		StringEntity requestEntity = new StringEntity(requestBody, ContentType.APPLICATION_JSON);
		HttpUriRequest request = RequestBuilder.create("CAPTURE").setUri(env.getProperty("ida.captureRequest.uri"))
				.setEntity(requestEntity).build();
		CloseableHttpResponse response;
		StringBuilder stringBuilder = new StringBuilder();
		try {
			response = client.execute(request);

			InputStream inputStram = response.getEntity().getContent();
			BufferedReader bR = new BufferedReader(new InputStreamReader(inputStram));
			String line = null;
			while ((line = bR.readLine()) != null) {
				stringBuilder.append(line);
			}
			bR.close();
		} catch (IOException e) {
			responsetextField.setText("Device connectivity failed....");
			responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
			e.printStackTrace();
		}
		String result = stringBuilder.toString();
		String error = null;

		List data = (List) objectMapper.readValue(result.getBytes(), Map.class).get("biometrics");
		if (data == null) {
			responsetextField.setText(result);
			responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
		}

		for (int j = 0; j < data.size(); j++) {
			Map e = (Map) data.get(j);
			Map errorMap = (Map) e.get("error");
			error = errorMap.get("errorCode").toString();
			if (error.equals(DEFAULT_SUBID) || error.equals("100")) {
				responsetextField.setText("Capture Success");
				responsetextField.setStyle("-fx-text-fill: green; -fx-font-size: 20px; -fx-font-weight: bold");
				ObjectMapper objectMapper = new ObjectMapper();
				List dataList = (List) objectMapper.readValue(result.getBytes(), Map.class).get("biometrics");
				for (int i = 0; i < dataList.size(); i++) {
					Map b = (Map) dataList.get(i);
					String dataJws = (String) b.get("data");
					Map dataMap = objectMapper.readValue(CryptoUtil.decodeURLSafeBase64(dataJws.split("\\.")[1]), Map.class);
					System.out.println((i + 1) + " Bio-type: " + dataMap.get("bioType") + " Bio-sub-type: "
							+ dataMap.get("bioSubType"));
					previousHash = (String) b.get("hash");
				}
			} else {
				responsetextField.setText("Capture Failed");
				responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
				break;
			}
		}

		System.out.println(result);
		return result;
	}

	@SuppressWarnings("rawtypes")
	@FXML
	private void onRequestOtp() {
		responsetextField.setText(null);
		OtpRequestDTO otpRequestDTO = new OtpRequestDTO();
		otpRequestDTO.setId("mosip.identity.otp");
		otpRequestDTO.setIndividualId(idValue.getText());
		otpRequestDTO.setIndividualIdType(idTypebox.getValue());
		otpRequestDTO.setOtpChannel(Collections.singletonList("email"));
		otpRequestDTO.setRequestTime(getUTCCurrentDateTimeISOString());
		otpRequestDTO.setTransactionID(getTransactionID());
		otpRequestDTO.setVersion("1.0");

		try {
			RestTemplate restTemplate = createTemplate();
			String reqJson = mapper.writeValueAsString(otpRequestDTO);
			HttpHeaders httpHeaders = new HttpHeaders();
			httpHeaders.add("signature", getSignature(reqJson));
			httpHeaders.add("Content-type", MediaType.APPLICATION_JSON_VALUE);
			HttpEntity<String> httpEntity = new HttpEntity<>(reqJson, httpHeaders);
			String url = env.getProperty("ida.otp.url");
			System.out.println("OTP Request URL: " + url);
			System.out.println("OTP Request Body: " + reqJson);
			ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, httpEntity, Map.class);
			System.out.println(response);

			if (response.getStatusCode().is2xxSuccessful()) {
				List errors = ((List) response.getBody().get("errors"));
				boolean status = errors == null || errors.isEmpty();
				String responseText = status ? "OTP Request Success" : "OTP Request Failed";
				if (status) {
					responsetextField.setStyle("-fx-text-fill: green; -fx-font-size: 20px; -fx-font-weight: bold");
				} else {
					responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
				}
				responsetextField.setText(responseText);
			} else {
				responsetextField.setText("OTP Request Failed with Error");
				responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
			}

		} catch (KeyManagementException | NoSuchAlgorithmException | IOException | UnrecoverableEntryException
				| KeyStoreException | CertificateException | OperatorCreationException | JoseException e) {
			e.printStackTrace();
		}
	}

	private String getSignature(String reqJson)
			throws KeyManagementException, NoSuchAlgorithmException, UnrecoverableEntryException, KeyStoreException,
			CertificateException, OperatorCreationException, JoseException, IOException {
		return sign(reqJson, false);
	}

	public String sign(String data, boolean isPayloadRequired)
			throws KeyManagementException, NoSuchAlgorithmException, UnrecoverableEntryException, KeyStoreException,
			CertificateException, OperatorCreationException, JoseException, IOException {
		return signatureUtil.sign(data, false, true, false, null, keyMgrUtil.getKeysDirPath(), env.getProperty("partnerId"));
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@FXML
	private void onSendAuthRequest() throws Exception {
		responsetextField.setText(null);
		responsetextField.setStyle("-fx-text-fill: black; -fx-font-size: 20px; -fx-font-weight: bold");
		responsetextField.setText("Preparing Auth Request...");
		AuthRequestDTO authRequestDTO = new AuthRequestDTO();
//		// Set Auth Type
//		AuthTypeDTO authTypeDTO = new AuthTypeDTO();
//		authTypeDTO.setBio(isBioAuthType());
//		authTypeDTO.setOtp(isOtpAuthType());
//		authTypeDTO.setDemo(isDemoAuthType());
//		authRequestDTO.setRequestedAuth(authTypeDTO);
		// set Individual Id
		authRequestDTO.setIndividualId(idValue.getText());
		// Set Individual Id type
		//authRequestDTO.setIndividualIdType(idTypebox.getValue());
		authRequestDTO.setEnv(env.getProperty("ida.request.captureFinger.env"));
		authRequestDTO.setDomainUri(env.getProperty("ida.request.captureFinger.domainUri"));
		RequestDTO requestDTO = new RequestDTO();
		requestDTO.setTimestamp(getUTCCurrentDateTimeISOString());

		if (isOtpAuthType()) {
			requestDTO.setOtp(otpValue.getText());
		}

		Map<String, Object> identityBlock = mapper.convertValue(requestDTO, Map.class);
		if (isBioAuthType()) {
			identityBlock.put("biometrics", mapper.readValue(capture, Map.class).get("biometrics"));
		}
		if (isDemoAuthType()) {
			String input = StringUtils.isBlank(demoInputData.getText()) ? "{}" : demoInputData.getText();
			identityBlock.put("demographics", mapper.readValue(input, Map.class));
		}
		responsetextField.setText("Encrypting Auth Request...");
		System.out.println("******* Request before encryption ************ \n\n");
		System.out.println(mapper.writeValueAsString(identityBlock));
		EncryptionRequestDto encryptionRequestDto = new EncryptionRequestDto();
		encryptionRequestDto.setIdentityRequest(identityBlock);
		EncryptionResponseDto kernelEncrypt = null;
		try {
			kernelEncrypt = kernelEncrypt(encryptionRequestDto, false);
		} catch (Exception e) {
			e.printStackTrace();
			responsetextField.setText("Encryption of Auth Request Failed");
			return;
		}

		responsetextField.setText("Authenticating...");
		// Set request block
		authRequestDTO.setRequest(requestDTO);

		authRequestDTO.setTransactionID(getTransactionID());
		authRequestDTO.setRequestTime(getUTCCurrentDateTimeISOString());
		authRequestDTO.setConsentObtained(true);
		authRequestDTO.setId(getAuthRequestId());
		authRequestDTO.setVersion("1.0");
		authRequestDTO.setThumbprint(kernelEncrypt.getThumbprint());

		Map<String, Object> authRequestMap = mapper.convertValue(authRequestDTO, Map.class);
		authRequestMap.replace("request", kernelEncrypt.getEncryptedIdentity());
		authRequestMap.replace("requestSessionKey", kernelEncrypt.getEncryptedSessionKey());
		authRequestMap.replace("requestHMAC", kernelEncrypt.getRequestHMAC());
		RestTemplate restTemplate = createTemplate();

		String reqJson = mapper.writeValueAsString(authRequestMap);
		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.add("signature", getSignature(reqJson));
		httpHeaders.add("Content-type", MediaType.APPLICATION_JSON_VALUE);
		HttpEntity<String> httpEntity = new HttpEntity<>(reqJson, httpHeaders);

		String url = getUrl();
		System.out.println("Auth URL: " + url);
		System.out.println("Auth Request : \n" + new ObjectMapper().writeValueAsString(authRequestMap));
		try {
			ResponseEntity<Map> authResponse = restTemplate.exchange(url, HttpMethod.POST, httpEntity, Map.class);
			System.out.println("Auth Response : \n" + new ObjectMapper().writeValueAsString(authResponse));
			System.out.println(authResponse.getBody());
			if (authResponse.getStatusCode().is2xxSuccessful()) {
				Map<String, Object> responseMap = (Map<String, Object>) authResponse.getBody().get("response");
				boolean status = Objects.nonNull(responseMap)
						? (boolean) responseMap.get(isEkycAuthType() ? "kycStatus" : "authStatus")
						: false;
				String response = status ? "Authentication Success" : "Authentication Failed";
				if (status) {
					if (isEkycAuthType()) {
						ekycResponse.setVisible(true);
						decryptEkycResponse(authResponse);
						displayDialog(ekycResponseText);
					}
					responsetextField.setStyle("-fx-text-fill: green; -fx-font-size: 20px; -fx-font-weight: bold");
				} else {
					responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
				}
				responsetextField.setText(response);
			} else {
				responsetextField.setText("Authentication Failed with Error");
				responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
			}

		} catch (Exception e) {
			e.printStackTrace();
			responsetextField.setText("Authentication Failed with Error");
			responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
		}
	}

	@SuppressWarnings("rawtypes")
	private void decryptEkycResponse(ResponseEntity<Map> authResponse) throws Exception {
		String partnerId = env.getProperty("partnerId");
		PrivateKeyEntry ekycKey = keyMgrUtil.getKeyEntry(keyMgrUtil.getKeysDirPath(), partnerId);
		Map ekycResponseData = (Map) authResponse.getBody().get("response");
		String identity = (String) ekycResponseData.get("identity");
		
		String sessionKey = (String) ekycResponseData.get("sessionKey");

		byte[] encSecKey;
		byte[] encKycData;
		if(sessionKey == null) {
			Map<String, String> encryptedData = this.splitEncryptedData(identity);
			encSecKey = CryptoUtil.decodeURLSafeBase64(encryptedData.get("encryptedSessionKey"));
			encKycData = CryptoUtil.decodeURLSafeBase64(encryptedData.get("encryptedData"));
		} else {
			encSecKey = CryptoUtil.decodeURLSafeBase64(sessionKey);
			encKycData = CryptoUtil.decodeURLSafeBase64(identity);
		}
		
		byte[] decSecKey = decryptSecretKey(ekycKey.getPrivateKey(), encSecKey);
	    Cipher cipher = Cipher.getInstance("AES/GCM/PKCS5Padding"); //NoPadding
	    byte[] nonce = Arrays.copyOfRange(encKycData, encKycData.length - cipher.getBlockSize(), encKycData.length);
	    byte[] encryptedKycData = Arrays.copyOf(encKycData, encKycData.length - cipher.getBlockSize());
		
		SecretKey secretKey =  new SecretKeySpec(decSecKey, 0, decSecKey.length, "AES");
		GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(128, nonce); 
		cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmParameterSpec);

		ekycResponseText = mapper.writerWithDefaultPrettyPrinter()
				.writeValueAsString(mapper.readValue(cipher.doFinal(encryptedKycData), Object.class));
	}
	
	public Map<String, String> splitEncryptedData(@RequestBody String data) {
		byte[] dataBytes = CryptoUtil.decodeURLSafeBase64(data);
		byte[][] splits = splitAtFirstOccurance(dataBytes, env.getRequiredProperty("mosip.kernel.data-key-splitter").getBytes());
		return Map.of("encryptedSessionKey", CryptoUtil.encodeToURLSafeBase64(splits[0]), "encryptedData", CryptoUtil.encodeToURLSafeBase64(splits[1]));
	}
	
	private static byte[][] splitAtFirstOccurance(byte[] strBytes, byte[] sepBytes) {
		int index = findIndex(strBytes, sepBytes);
		if (index >= 0) {
			byte[] bytes1 = new byte[index];
			byte[] bytes2 = new byte[strBytes.length - (bytes1.length + sepBytes.length)];
			System.arraycopy(strBytes, 0, bytes1, 0, bytes1.length);
			System.arraycopy(strBytes, (bytes1.length + sepBytes.length), bytes2, 0, bytes2.length);
			return new byte[][] { bytes1, bytes2 };
		} else {
			return new byte[][] { strBytes, new byte[0] };
		}
	}
	
	private static int findIndex(byte arr[], byte[] subarr) {
		int len = arr.length;
		int subArrayLen = subarr.length;
		return IntStream.range(0, len).filter(currentIndex -> {
			if ((currentIndex + subArrayLen) <= len) {
				byte[] sArray = new byte[subArrayLen];
				System.arraycopy(arr, currentIndex, sArray, 0, subArrayLen);
				return Arrays.equals(sArray, subarr);
			}
			return false;
		}).findFirst() // first occurence
				.orElse(-1); // No element found
	}
	
	private byte[] decryptSecretKey(PrivateKey privKey, byte[] encKey)
			throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException,
			InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException {
		Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWITHSHA-256ANDMGF1PADDING");
		OAEPParameterSpec oaepParams = new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256,
				PSpecified.DEFAULT);
		cipher.init(Cipher.DECRYPT_MODE, privKey, oaepParams);
		return cipher.doFinal(encKey, 0, encKey.length);
	}

	private String getAuthRequestId() {
		if (isEkycAuthType())
			return env.getProperty("authRequestId", "mosip.identity.kyc");
		else
			return env.getProperty("authRequestId", "mosip.identity.auth");
	}

	private boolean isOtpAuthType() {
		return otpAuthType.isSelected();
	}

	private String getUrl() {
		if (isEkycAuthType())
			return env.getProperty("ida.ekyc.url");
		else
			return env.getProperty("ida.auth.url");
	}

	private boolean isBioAuthType() {
		return fingerAuthType.isSelected() || irisAuthType.isSelected() || faceAuthType.isSelected();
	}

	private EncryptionResponseDto kernelEncrypt(EncryptionRequestDto encryptionRequestDto, boolean isInternal)
			throws Exception {
		EncryptionResponseDto encryptionResponseDto = new EncryptionResponseDto();
		String identityBlock = mapper.writeValueAsString(encryptionRequestDto.getIdentityRequest());

		SecretKey secretKey = cryptoUtil.genSecKey();

		byte[] encryptedIdentityBlock = cryptoUtil.symmetricEncrypt(identityBlock.getBytes(), secretKey);
		encryptionResponseDto.setEncryptedIdentity(Base64.encodeBase64URLSafeString(encryptedIdentityBlock));

		X509Certificate certificate = getCertificate(identityBlock, isInternal);
		PublicKey publicKey = certificate.getPublicKey();
		byte[] encryptedSessionKeyByte = cryptoUtil.asymmetricEncrypt((secretKey.getEncoded()), publicKey);
		encryptionResponseDto.setEncryptedSessionKey(Base64.encodeBase64URLSafeString(encryptedSessionKeyByte));
		byte[] byteArr = cryptoUtil.symmetricEncrypt(HMACUtils2.digestAsPlainText(identityBlock.getBytes()).getBytes(),
				secretKey);
		encryptionResponseDto.setRequestHMAC(Base64.encodeBase64URLSafeString(byteArr));

		String thumbprint = Hex.encodeHexString(getCertificateThumbprint(certificate));
		encryptionResponseDto.setThumbprint(thumbprint);
		return encryptionResponseDto;
	}

	private byte[] getCertificateThumbprint(Certificate cert) throws CertificateEncodingException {
		return DigestUtils.sha256(cert.getEncoded());
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public X509Certificate getCertificate(String data, boolean isInternal)
			throws KeyManagementException, RestClientException, NoSuchAlgorithmException, CertificateException {
		RestTemplate restTemplate = createTemplate();

		CryptomanagerRequestDto request = new CryptomanagerRequestDto();
		request.setApplicationId("IDA");
		request.setData(Base64.encodeBase64URLSafeString(data.getBytes(StandardCharsets.UTF_8)));
		String publicKeyId = env.getProperty("ida.reference.id");
		request.setReferenceId(publicKeyId);
		String utcTime = getUTCCurrentDateTimeISOString();
		request.setTimeStamp(utcTime);
		Map<String, String> uriParams = new HashMap<>();
		UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(env.getProperty("ida.certificate.url"))
				.queryParam("applicationId", "IDA").queryParam("referenceId", publicKeyId);
		ResponseEntity<Map> response = restTemplate.exchange(builder.build(uriParams), HttpMethod.GET, null, Map.class);
		String certificate = (String) ((Map<String, Object>) response.getBody().get("response")).get("certificate");

		String certificateTrimmed = trimBeginEnd(certificate);
		CertificateFactory cf = CertificateFactory.getInstance("X.509");
		X509Certificate x509cert = (X509Certificate) cf.generateCertificate(
				new ByteArrayInputStream(java.util.Base64.getDecoder().decode(certificateTrimmed)));
		return x509cert;
	}

	public static String trimBeginEnd(String pKey) {
		pKey = pKey.replaceAll("-*BEGIN([^-]*)-*(\r?\n)?", "");
		pKey = pKey.replaceAll("-*END([^-]*)-*(\r?\n)?", "");
		pKey = pKey.replaceAll("\\s", "");
		return pKey;
	}

	private RestTemplate createTemplate() throws KeyManagementException, NoSuchAlgorithmException {
		turnOffSslChecking();
		RestTemplate restTemplate = new RestTemplate();
		ClientHttpRequestInterceptor interceptor = new ClientHttpRequestInterceptor() {

			@Override
			public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
					throws IOException {
				String authToken = generateAuthToken();
				if (authToken != null && !authToken.isEmpty()) {
					request.getHeaders().set("Cookie", "Authorization=" + authToken);
					request.getHeaders().set("Authorization", "Authorization=" + authToken);
				}
				return execution.execute(request, body);
			}
		};

		restTemplate.setInterceptors(Collections.singletonList(interceptor));
		return restTemplate;
	}

	private String generateAuthToken() {
		ObjectNode requestBody = mapper.createObjectNode();
		requestBody.put("clientId", env.getProperty("clientId"));
		requestBody.put("secretKey", env.getProperty("secretKey"));
		requestBody.put("appId", env.getProperty("appId"));
		RequestWrapper<ObjectNode> request = new RequestWrapper<>();
		request.setRequesttime(DateUtils.getUTCCurrentDateTime());
		request.setRequest(requestBody);
		ClientResponse response = WebClient.create(env.getProperty("ida.authmanager.url")).post().syncBody(request)
				.exchange().block();
		List<ResponseCookie> list = response.cookies().get("Authorization");
		if (list != null && !list.isEmpty()) {
			ResponseCookie responseCookie = list.get(0);
			return responseCookie.getValue();
		}
		return "";
	}

	@SuppressWarnings("unused")
	private HttpEntity<CryptomanagerRequestDto> getHeaders(CryptomanagerRequestDto req) {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
		return new HttpEntity<CryptomanagerRequestDto>(req, headers);
	}

	private static final TrustManager[] UNQUESTIONING_TRUST_MANAGER = new TrustManager[] { new X509TrustManager() {
		public java.security.cert.X509Certificate[] getAcceptedIssuers() {
			return null;
		}

		public void checkClientTrusted(java.security.cert.X509Certificate[] arg0, String arg1)
				throws CertificateException {
		}

		public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String arg1)
				throws CertificateException {
		}
	} };

	@Autowired
	private CryptoUtility cryptoUtil;

	private TextArea ekycTextArea;

	public static void turnOffSslChecking() throws KeyManagementException, java.security.NoSuchAlgorithmException {
		// Install the all-trusting trust manager
		final SSLContext sc = SSLContext.getInstance(SSL);
		sc.init(null, UNQUESTIONING_TRUST_MANAGER, null);
		HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
	}

	public static String getUTCCurrentDateTimeISOString() {
		return DateUtils.formatToISOString(DateUtils.getUTCCurrentDateTime());
	}

	/**
	 * Gets the transaction ID.
	 *
	 * @return the transaction ID
	 */
	public static String getTransactionID() {
		return "1234567890";
	}

	@FXML
	private void onReset() {
		Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
		alert.setTitle("Confirm Reset");
		alert.setContentText("Are you sure to reset?");
		ButtonType okButton = new ButtonType("Yes", ButtonBar.ButtonData.YES);
		ButtonType noButton = new ButtonType("No", ButtonBar.ButtonData.NO);
		alert.getButtonTypes().setAll(okButton, noButton);
		alert.showAndWait().ifPresent(type -> {
			if (type.getButtonData().equals(ButtonType.YES.getButtonData())) {
				reset();
			}
		});
	}

	private void reset() {
		fingerCount.getSelectionModel().select(0);
		irisCount.getSelectionModel().select(0);
		idValue.setText("");
		fingerAuthType.setSelected(false);
		irisAuthType.setSelected(false);
		faceAuthType.setSelected(false);
		otpAuthType.setSelected(false);
		demoAuthType.setSelected(false);
		eKyc.setSelected(false);
		idTypebox.setValue("UIN");
		otpValue.setText("");
		otpAnchorPane.setDisable(true);
		bioAnchorPane.setDisable(true);
		responsetextField.setText("");
		demoInputData.setText(null);
		demoInputData.setDisable(true);
		requestOtp.setDisable(true);
		sendAuthRequest.setDisable(false);
		capture = null;
		previousHash = null;
		ekycResponseText = null;
		ekycResponse.setVisible(false);
		updateBioPane();
		updateSendButton();
	}

	@FXML
	private void onOtpValueUpdate() {
		updateSendButton();
	}

	@FXML
	private void onDemoAuth() {
		demoInputData.setDisable(!demoAuthType.isSelected());
		updateSendButton();
	}

	private boolean isDemoAuthType() {
		updateSendButton();
		return demoAuthType.isSelected();
	}

	@FXML
	private void onEKyc() {
		ekycResponse.setVisible(isEkycAuthType() && StringUtils.isNotBlank(ekycResponseText));
	}
	
	private boolean isEkycAuthType() {
		return eKyc.isSelected();
	}
	
	@FXML
	private void viewKycResponse() {
		
	}
}