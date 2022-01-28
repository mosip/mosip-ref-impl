package io.mosip.authentication.demo.service;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.cert.Certificate;
import java.security.cert.CertificateEncodingException;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.MGF1ParameterSpec;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import io.mosip.biometrics.util.ConvertRequestDto;
import io.mosip.biometrics.util.face.FaceDecoder;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.jose4j.json.internal.json_simple.JSONObject;
import org.jose4j.json.internal.json_simple.parser.JSONParser;
import org.jose4j.json.internal.json_simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
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
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import io.mosip.authentication.demo.dto.AuthRequestDTO;
import io.mosip.authentication.demo.dto.AuthTypeDTO;
import io.mosip.authentication.demo.dto.CryptomanagerRequestDto;
import io.mosip.authentication.demo.dto.EncryptionRequestDto;
import io.mosip.authentication.demo.dto.EncryptionResponseDto;
import io.mosip.authentication.demo.dto.JWTSignatureRequestDto;
import io.mosip.authentication.demo.dto.JWTSignatureResponseDto;
import io.mosip.authentication.demo.dto.OtpRequestDTO;
import io.mosip.authentication.demo.dto.RequestDTO;
import io.mosip.authentication.demo.helper.CryptoUtility;
import io.mosip.kernel.core.http.RequestWrapper;
import io.mosip.kernel.core.http.ResponseWrapper;
import io.mosip.kernel.core.util.CryptoUtil;
import io.mosip.kernel.core.util.DateUtils;
import io.mosip.kernel.core.util.HMACUtils2;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.image.ImageView;
import javafx.scene.text.Font;

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
	private ComboBox<String> idTypebox;

	@FXML
	private TextField otpValue;

	@FXML
	private StackPane otpAnchorPane;

	@FXML
	private StackPane bioAnchorPane;

	@FXML
	private TextField responsetextField;

	@FXML
	private ImageView img;

	@FXML
	private Button requestOtp;
	
	@FXML
	private Button sendAuthRequest;

	private String capture;
	
	private String previousHash;
	
	private ObjectMapper objectMapper = new ObjectMapper();
	
	@FXML
	private CheckBox isKycRequired;

	@FXML
	private AnchorPane mainPageRoot;

	@FXML
	private GridPane previewGrid;

	@FXML
	private void initialize() {
		responsetextField.setText(null);
		
		ObservableList<String> idTypeChoices = FXCollections.observableArrayList("UIN", "VID", "USERID");
		ObservableList<String> fingerCountChoices = FXCollections.observableArrayList("1", "2", "3", "4", "5", "6", "7",
				"8", "9", "10");
		fingerCount.setItems(fingerCountChoices);
		fingerCount.getSelectionModel().select(0);
		
		ObservableList<String> irisCountChoices = FXCollections.observableArrayList("Left Iris", "Right Iris", "Both Iris");
		irisCount.setItems(irisCountChoices);
		irisCount.getSelectionModel().select(0);
		
		idTypebox.setItems(idTypeChoices);
		idTypebox.setValue("UIN");
		otpAnchorPane.setDisable(true);
		otpAnchorPane.setVisible(false);
		bioAnchorPane.setDisable(true);
		responsetextField.setDisable(true);
		sendAuthRequest.setDisable(true);
		
		idValue.textProperty().addListener((observable, oldValue, newValue) -> {
			updateSendButton();
		});
		
		otpValue.textProperty().addListener((observable, oldValue, newValue) -> {
			updateSendButton();
		});
	}

	@FXML
	private void onFingerPrintAuth() {
		updateBioCapture("finger");
	}

	private void updateBioCapture(String authType) {
		capture = null;
		previousHash = null;
		updateAuthType(authType);
		updateBioPane();
		updateSendButton();
	}

	private void updateAuthType(String authType) {
		if (!authType.equals("finger"))
			fingerAuthType.setSelected(false);

		if (!authType.equals("iris"))
			irisAuthType.setSelected(false);

		if (!authType.equals("face"))
			faceAuthType.setSelected(false);

		if (!authType.equals("otp"))
			otpAuthType.setSelected(false);
	}

	@FXML
	private void onIrisAuth() {
		updateBioCapture("iris");
	}
	
	@FXML
	private void onFaceAuth() {
		updateBioCapture("face");
	}
	
	private void updateSendButton() {
		if(idValue.getText() == null || idValue.getText().trim().isEmpty()) {
			sendAuthRequest.setDisable(true);
			return;
		}
		
		if(otpAuthType.isSelected()) {
			if(otpValue.getText().trim().isEmpty()) {
				sendAuthRequest.setDisable(true);
				return;
			}
		}
		
		if(isBioAuthType()) {
			if(capture == null) {
				sendAuthRequest.setDisable(true);
				return;
			}
		}
		
		sendAuthRequest.setDisable(!(isBioAuthType() || otpAuthType.isSelected()));
		
		
	}

	private void updateBioPane() {
		if(!otpAuthType.isSelected() && !fingerAuthType.isSelected() && !irisAuthType.isSelected() && !faceAuthType.isSelected()) {
			bioAnchorPane.setDisable(true);
			bioAnchorPane.setVisible(true);
		} else if(isBioAuthType()) {
			bioAnchorPane.setDisable(false);
			bioAnchorPane.setVisible(true);
		} else {
			bioAnchorPane.setDisable(true);
			bioAnchorPane.setVisible(false);
		}
		irisCount.setDisable(!irisAuthType.isSelected());
		fingerCount.setDisable(!fingerAuthType.isSelected());
		otpAnchorPane.setDisable(!otpAuthType.isSelected());
		otpAnchorPane.setVisible(otpAuthType.isSelected());
	}
	

	@FXML
	private void onOTPAuth() {
		responsetextField.setText(null);
		updateAuthType("otp");
		updateBioPane();
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
			if(!faceCapture.contains("\"biometrics\"")) {
				updateSendButton();
				return;
			}
			bioCaptures.add(faceCapture);
		}
		
		String fingerCapture;
		if (fingerAuthType.isSelected()) {
			fingerCapture = captureFingerprint();
			if(!fingerCapture.contains("\"biometrics\"")) {
				updateSendButton();
				return;
			}
			bioCaptures.add(fingerCapture);
		}
		
		String irisCapture;
		if (irisAuthType.isSelected()) {
			irisCapture = captureIris();
			if(!irisCapture.contains("\"biometrics\"")) {
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
		List<String> captures = bioCaptures.stream()
				.filter(obj -> obj != null)
				.filter(str -> str.contains("\"biometrics\""))
				.collect(Collectors.toList());
		
		if(captures.isEmpty()) {
			return null;
		}
		
		if(captures.size() == 1) {
			return captures.get(0);
		}
		
		LinkedHashMap<String, Object> identity = new LinkedHashMap<String, Object>();
		List<Map<String, Object>> biometricsList = captures.stream()
			.map(obj -> {
				try {
					return objectMapper.readValue(obj, Map.class);
				} catch (IOException e) {
					e.printStackTrace();
				}
				return null;
			})
			.map(map -> map.get("biometrics"))
			.filter(obj -> obj instanceof List)
			.map(obj -> (List<Map>) obj )
			.flatMap(list -> list.stream())
			.filter(obj -> obj instanceof Map)
			.map(obj -> (Map<String, Object>)obj)
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
		String requestBody = new String(cryptoUtil.decodeBase64(env.getProperty("ida.request.captureRequest.template")));
		System.out.println(requestBody);
		return requestBody;
	}

	private String captureFingerprint() throws Exception {
		responsetextField.setText("Capturing Fingerprint...");
		responsetextField.setStyle("-fx-text-fill: black; -fx-font-size: 20px; -fx-font-weight: bold");	
		
		String requestBody = getCaptureRequestTemplate();
		
		requestBody = requestBody.replace("$timeout", env.getProperty("ida.request.captureFinger.timeout"))
								   .replace("$count", getFingerCount()).
								    replace("$deviceId", env.getProperty("ida.request.captureFinger.deviceId")).
								    replace("$domainUri", env.getProperty("ida.request.captureFinger.domainUri")).
								    replace("$deviceSubId", getFingerDeviceSubId()).
								    replace("$captureTime", getCaptureTime()).
								    replace("$previousHash", getPreviousHash()).
								    replace("$requestedScore",env.getProperty("ida.request.captureFinger.requestedScore")).
								    replace("$type",env.getProperty("ida.request.captureFinger.type")).
								    replace("$bioSubType",getBioSubType(getFingerCount(), env.getProperty("ida.request.captureFinger.bioSubType"))).
								    replace("$name",env.getProperty("ida.request.captureFinger.name")).
								    replace("$value",env.getProperty("ida.request.captureFinger.value")).
								    replace("$env",env.getProperty("ida.request.captureFinger.env"));
		
		return capturebiometrics(requestBody);
	}	
	
	
	private String getFingerDeviceSubId() {
		return env.getProperty("finger.device.subid",DEFAULT_SUBID);
	}
	
	private String getIrisDeviceSubId() {
		String irisSubId = env.getProperty("iris.device.subid");
		if(irisSubId == null) {
			if(irisCount.getSelectionModel().getSelectedIndex() == 0) {
				irisSubId = String.valueOf(1);
			} else if(irisCount.getSelectionModel().getSelectedIndex() == 1) {
				irisSubId = String.valueOf(2);
			} else {
				irisSubId = String.valueOf(3);
			}
		}
		return irisSubId;
	}

	private String getFaceDeviceSubId() {
		return env.getProperty("face.device.subid",DEFAULT_SUBID);
	}
	
	private String captureIris() throws Exception {
		responsetextField.setText("Capturing Iris...");
		responsetextField.setStyle("-fx-text-fill: black; -fx-font-size: 20px; -fx-font-weight: bold");

	String requestBody = getCaptureRequestTemplate();
		
	requestBody = requestBody.replace("$timeout", env.getProperty("ida.request.captureIris.timeout"))
								   .replace("$count", getIrisCount()).
								    replace("$deviceId", env.getProperty("ida.request.captureIris.deviceId")).
								    replace("$domainUri", env.getProperty("ida.request.captureIris.domainUri")).
								    replace("$deviceSubId", getIrisDeviceSubId()).
								    replace("$captureTime", getCaptureTime()).
								    replace("$previousHash", getPreviousHash()).
								    replace("$requestedScore",env.getProperty("ida.request.captureIris.requestedScore")).
								    replace("$type",env.getProperty("ida.request.captureIris.type")).
								    replace("$bioSubType",getBioSubType(getIrisCount(), env.getProperty("ida.request.captureIris.bioSubType"))).
								    replace("$name",env.getProperty("ida.request.captureIris.name")).
								    replace("$value",env.getProperty("ida.request.captureIris.value")).
								    replace("$env",env.getProperty("ida.request.captureIris.env"));
		
		return capturebiometrics(requestBody);
	}
	
	private String captureFace() throws Exception {
		responsetextField.setText("Capturing Face...");
		responsetextField.setStyle("-fx-text-fill: black; -fx-font-size: 20px; -fx-font-weight: bold");

		String requestBody = getCaptureRequestTemplate();
		
		requestBody = requestBody.replace("$timeout", env.getProperty("ida.request.captureFace.timeout"))
									   .replace("$count", getFaceCount()).
									    replace("$deviceId", env.getProperty("ida.request.captureFace.deviceId")).
									    replace("$domainUri", env.getProperty("ida.request.captureFace.domainUri")).
									    replace("$deviceSubId", getFaceDeviceSubId()).
									    replace("$captureTime", getCaptureTime()).
									    replace("$previousHash", getPreviousHash()).
									    replace("$requestedScore",env.getProperty("ida.request.captureFace.requestedScore")).
									    replace("$type",env.getProperty("ida.request.captureFace.type")).
									    replace("$bioSubType",getBioSubType(getFaceCount(), env.getProperty("ida.request.captureFace.bioSubType"))).
									    replace("$name",env.getProperty("ida.request.captureFace.name")).
									    replace("$value",env.getProperty("ida.request.captureFace.value")).
									    replace("$env",env.getProperty("ida.request.captureFace.env"));		

		return capturebiometrics(requestBody);
	}

	private String getPreviousHash() {
		return previousHash == null ? "" : previousHash;
	}

	private String getFingerCount() {
		return fingerCount.getValue() == null ? String.valueOf(1) : fingerCount.getValue();
	}
	
	private String getBioSubType(String count, String bioValue) {		
		if(count.equalsIgnoreCase("1")) {
			return  "\"" + bioValue + "\"";
		}		
		String finalStr = "\""+ bioValue + "\"";
		for(int i = 2; i<=Integer.parseInt(count); i++) {
			finalStr = finalStr + "," + "\""+ bioValue + "\"";
		}
		
		return finalStr;
	}
	
	private String getIrisCount() {
		return String.valueOf(irisCount.getSelectionModel().getSelectedIndex() + 1);
	}
	
	private String getFaceCount() {
		return String.valueOf(1);
	}

	private String getCaptureTime() {
		TimeZone tz = TimeZone.getTimeZone("UTC");
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"); // Quoted "Z" to indicate UTC, no timezone offset
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
		if(data == null) {
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
					Map dataMap = objectMapper.readValue(CryptoUtil.decodeBase64(dataJws.split("\\.")[1]), Map.class);
					System.out.println((i+1) + " Bio-type: " + dataMap.get("bioType") + " Bio-sub-type: " +  dataMap.get("bioSubType"));
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
			HttpEntity<String> httpEntity = new HttpEntity<>(reqJson,httpHeaders);
			ResponseEntity<Map> response = restTemplate.exchange(
					env.getProperty("ida.otp.url"),
					HttpMethod.POST, httpEntity, Map.class);
			System.err.println(response);
			
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

		} catch (KeyManagementException | NoSuchAlgorithmException | JsonProcessingException | UnsupportedEncodingException e) {
			e.printStackTrace();
		}
	}	

	private String getSignature(String reqJson) throws KeyManagementException, NoSuchAlgorithmException, UnsupportedEncodingException {
		return sign(reqJson, false);
	}
	
	public String sign(String data, boolean isPayloadRequired)
			throws KeyManagementException, NoSuchAlgorithmException, UnsupportedEncodingException {
		turnOffSslChecking();
		RestTemplate restTemplate = new RestTemplate();
		ClientHttpRequestInterceptor interceptor = new ClientHttpRequestInterceptor() {

			@Override
			public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
					throws IOException {
				String authToken = generateAuthToken();
				if (authToken != null && !authToken.isEmpty()) {
					request.getHeaders().set("Cookie", "Authorization=" + authToken);
				}
				return execution.execute(request, body);
			}
		};

		restTemplate.setInterceptors(Collections.singletonList(interceptor));

		JWTSignatureRequestDto request = new JWTSignatureRequestDto();
		request.setApplicationId("IDA");
		request.setDataToSign(CryptoUtil.encodeBase64(data.getBytes("UTF-8")));
		request.setIncludeCertHash(true);
		request.setIncludeCertificate(true);
		request.setIncludePayload(isPayloadRequired);
		request.setReferenceId(signRefid);
		RequestWrapper<JWTSignatureRequestDto> requestWrapper = new RequestWrapper<>();
		requestWrapper.setRequest(request);
		HttpEntity<RequestWrapper<JWTSignatureRequestDto>> requestEntity = new HttpEntity<>(requestWrapper);
		ResponseEntity<ResponseWrapper<JWTSignatureResponseDto>> exchange = restTemplate.exchange(
				env.getProperty("ida.internal.jwtSign.url"), HttpMethod.POST, requestEntity,
				new ParameterizedTypeReference<ResponseWrapper<JWTSignatureResponseDto>>() {
				});
		return exchange.getBody().getResponse().getJwtSignedData();
	}


	@SuppressWarnings({ "unchecked", "rawtypes" })
	@FXML
	private void onSendAuthRequest() throws Exception {
		responsetextField.setText(null);
		responsetextField.setStyle("-fx-text-fill: black; -fx-font-size: 20px; -fx-font-weight: bold");
		responsetextField.setText("Preparing Auth Request...");
		AuthRequestDTO authRequestDTO = new AuthRequestDTO();
		// Set Auth Type
		AuthTypeDTO authTypeDTO = new AuthTypeDTO();
		authTypeDTO.setBio(isBioAuthType());
		authTypeDTO.setOtp(isOtpAuthType());
		authRequestDTO.setRequestedAuth(authTypeDTO);
		// set Individual Id
		authRequestDTO.setIndividualId(idValue.getText());
		// Set Individual Id type
		authRequestDTO.setIndividualIdType(idTypebox.getValue());
		authRequestDTO.setEnv(env.getProperty("ida.request.captureFinger.env"));
		authRequestDTO.setDomainUri(env.getProperty("ida.request.captureFinger.domainUri"));
		authRequestDTO.setSecondaryLangCode("eng");
		RequestDTO requestDTO = new RequestDTO();
		requestDTO.setTimestamp(getUTCCurrentDateTimeISOString());

		if (isOtpAuthType()) {
			requestDTO.setOtp(otpValue.getText());
		}
		
		Map<String, Object> identityBlock = mapper.convertValue(requestDTO, Map.class);
		if (isBioAuthType()) {
			identityBlock.put("biometrics", mapper.readValue(capture, Map.class).get("biometrics"));
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
		HttpEntity<String> httpEntity = new HttpEntity<>(reqJson,httpHeaders);
		
		String url = getUrl();
		System.out.println("Auth URL: " + url);
		System.out.println("Auth Request : \n" + new ObjectMapper().writeValueAsString(authRequestMap));
		try {
			ResponseEntity<Map> authResponse = restTemplate.exchange(url,
					HttpMethod.POST, httpEntity, Map.class);
			if (authResponse.getStatusCode().is2xxSuccessful()) {
				boolean status = false;
				String response;

				if(isKycRequired.isSelected()) {
					status = (boolean) ((Map<String, Object>) authResponse.getBody().get("response")).get("kycStatus");
					response = status ? objectMapper.writeValueAsString(authResponse.getBody().get("response")) : "KYC Request Failed";
					if(status) {
						loadKYCPreviewPage(response, status);
						response = status ? "Authentication Success" : "Authentication Failed";
					} else {
						response = status ? "Authentication Success" : "Authentication Failed";
					}
				} else {
					status = (boolean) ((Map<String, Object>) authResponse.getBody().get("response")).get("authStatus");
					response = status ? "Authentication Success" : "Authentication Failed";
				}
				if (status) {
					responsetextField.setStyle("-fx-text-fill: green; -fx-font-size: 20px; -fx-font-weight: bold; scroll-bar:horizontal:enabled");
				} else {
					responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
				}
				responsetextField.setText(response);
			} else {
				responsetextField.setText("Authentication Failed with Error");
				responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
			}

			System.out.println("Auth Response : \n" + new ObjectMapper().writeValueAsString(authResponse));
			System.out.println(authResponse.getBody());
		} catch (Exception e) {
			e.printStackTrace();
			responsetextField.setText("Authentication Failed with Error");
			responsetextField.setStyle("-fx-text-fill: red; -fx-font-size: 20px; -fx-font-weight: bold");
		}
	}

	private String getAuthRequestId() {
		if(isKycRequired.isSelected())
			return env.getProperty("kycRequestId", "mosip.identity.kyc");
		else
		return env.getProperty("authRequestId", "mosip.identity.auth");
	}

	private boolean isOtpAuthType() {
		return otpAuthType.isSelected();
	}

	private String getUrl() {
		if (isKycRequired.isSelected())
			return env.getProperty("ida.kyc.url");
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
		byte[] byteArr = cryptoUtil.symmetricEncrypt(
				HMACUtils2.digestAsPlainText(identityBlock.getBytes()).getBytes(), secretKey);
		encryptionResponseDto.setRequestHMAC(Base64.encodeBase64URLSafeString(byteArr));
		
		String thumbprint = CryptoUtil.encodeBase64(getCertificateThumbprint(certificate));
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
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromUriString(
						env.getProperty("ida.certificate.url"))
				.queryParam("applicationId", "IDA")
				.queryParam("referenceId", publicKeyId);
		ResponseEntity<Map> response = restTemplate.exchange(builder.build(uriParams), HttpMethod.GET, null, Map.class);
		String certificate =  (String) ((Map<String, Object>) response.getBody().get("response")).get("certificate");
		
		String certificateTrimmed = trimBeginEnd(certificate);
		CertificateFactory cf = CertificateFactory.getInstance("X.509");
		X509Certificate x509cert = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(java.util.Base64.getDecoder().decode(certificateTrimmed)));
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
		ClientResponse response = WebClient
				.create(env.getProperty("ida.authmanager.url"))
				.post().syncBody(request).exchange().block();
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
		idTypebox.setValue("UIN");
		otpValue.setText("");
		otpAnchorPane.setDisable(true);
		otpAnchorPane.setVisible(false);
		bioAnchorPane.setDisable(true);
		responsetextField.setText("");
		sendAuthRequest.setDisable(false);
		capture = null;
		previousHash = null;
		bioAnchorPane.setVisible(true);
		irisCount.setDisable(!irisAuthType.isSelected());
		fingerCount.setDisable(!fingerAuthType.isSelected());
		otpAnchorPane.setDisable(!otpAuthType.isSelected());
		otpAnchorPane.setVisible(otpAuthType.isSelected());
		isKycRequired.setSelected(false);
		updateSendButton();
		previewGrid.getChildren().clear();
	}

	@FXML 
	private void onOtpValueUpdate() {
		updateSendButton();
	}

	public void loadKYCPreviewPage(String kycResponse, Boolean status) throws IOException {
		try {
			JSONObject jsonObject = new JSONObject();

			if (kycResponse != null) {
				HashMap<String, String> retVal = formatEKycRequest(kycResponse);
				String finalValue = decrypt(retVal.get("identity"), retVal.get("sessionKey"), env.getProperty("partnerId"));
				JSONParser parser = new JSONParser();
				jsonObject = (JSONObject) parser.parse(finalValue);
			}
			renderView(jsonObject, status);
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		} catch (CertificateException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (KeyStoreException e) {
			e.printStackTrace();
		} catch (UnrecoverableKeyException e) {
			e.printStackTrace();
		} catch (NoSuchPaddingException e) {
			e.printStackTrace();
		} catch (InvalidKeyException e) {
			e.printStackTrace();
		} catch (IllegalBlockSizeException e) {
			e.printStackTrace();
		} catch (BadPaddingException e) {
			e.printStackTrace();
		} catch (InvalidAlgorithmParameterException e) {
			e.printStackTrace();
		} catch (ParseException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}


//		FXMLLoader loader = new FXMLLoader();
//		AnchorPane root = loader.load(this.getClass().getClassLoader().getResourceAsStream("fxml/idaKYCPreview.fxml"));
//		loader.setControllerFactory(IdaStarter.getApplicationContext()::getBean);
//		KYCPreviewController controller = loader.getController();
//		controller.setKycResponseString(kycResponse, status, env);
//		controller.initializeScreen();
//		loader.setController(controller);
//		mainPageRoot.getChildren().setAll(root);
//		Stage stage = (Stage) mainPageRoot.getScene().getWindow();
//		stage.show();
	}

	private HashMap<String, String> formatEKycRequest( String kycResponseString) throws IOException, ParseException {
		JSONParser parser = new JSONParser();
		JSONObject jsonObj = (JSONObject) parser.parse(kycResponseString);

		HashMap<String,String> retVal = new HashMap<String,String>();
		retVal.put("authToken", jsonObj.get("authToken").toString());

		//Check new version or older logic
		if(jsonObj.containsKey("sessionKey")) {

			retVal.put("sessionKey", jsonObj.get("sessionKey").toString());
			retVal.put("identity", jsonObj.get("identity").toString());

		}
		else {
			String[] ret =splitResponse(jsonObj.get("identity").toString());
			retVal.put("sessionKey", ret[0]);
			retVal.put("identity", ret[1]);
		}

		return retVal;
	}

	String[] splitResponse(String encodedResponse) {
		String [] retVal  = new String[2];

		String keysplitter = "#KEY_SPLITTER#";

		byte[] byteResponse = CryptoUtil.decodeBase64(encodedResponse);
		int pos = indexOf(byteResponse,0,keysplitter.getBytes(), 0,0);
		System.out.println(pos);
		byte[] encKey = Arrays.copyOf(byteResponse,pos);
		int remLen = byteResponse.length ;
		byte[] encIdentity = Arrays.copyOfRange( byteResponse, pos + keysplitter.length(),remLen);

		retVal[0] = CryptoUtil.encodeBase64String(encKey);
		retVal[1] = CryptoUtil.encodeBase64String(encIdentity);


		return retVal;
	}

	static int indexOf(byte[] source, int sourceOffset, byte[] target, int targetOffset, int fromIndex) {
		int sourceCount = source.length;
		int targetCount = target.length;

		if (fromIndex >= sourceCount) {
			return (targetCount == 0 ? sourceCount : -1);
		}
		if (fromIndex < 0) {
			fromIndex = 0;
		}
		if (targetCount == 0) {
			return fromIndex;
		}

		byte first = target[targetOffset];
		int max = sourceOffset + (sourceCount - targetCount);

		for (int i = sourceOffset + fromIndex; i <= max; i++) {
			/* Look for first character. */
			if (source[i] != first) {
				while (++i <= max && source[i] != first)
					;
			}

			/* Found first character, now look at the rest of v2 */
			if (i <= max) {
				int j = i + 1;
				int end = j + targetCount - 1;
				for (int k = targetOffset + 1; j < end && source[j] == target[k]; j++, k++)
					;

				if (j == end) {
					/* Found whole string. */
					return i - sourceOffset;
				}
			}
		}
		return -1;
	}

	private String decrypt(String encdata, String sessionKey, String partnerId) throws NoSuchAlgorithmException, CertificateException, IOException, KeyStoreException, UnrecoverableKeyException, NoSuchPaddingException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException, InvalidAlgorithmParameterException {
		int tagLength = 128;
		String p12Password = env.getProperty("mosip.certificate.password");	// "qwerty@123";
		String cerKeyAlias = env.getProperty("mosip.certificate.key.alias");

		byte[] b64Data = CryptoUtil.decodeBase64( encdata);
		byte[] encKey =  CryptoUtil.decodeBase64( sessionKey);
		byte[] encData =  b64Data;// Arrays.copyOfRange(b64Data, encKey.length + keysplitter.length, b64Data.length);
		KeyStore keystore = KeyStore.getInstance("PKCS12");
		InputStream in = this.getClass().getClassLoader().getResourceAsStream(partnerId + "-partner.p12");
		System.out.println("data.len=" + encData.length);

		keystore.load(in, p12Password.toCharArray());
		PrivateKey pvtkey = (PrivateKey)keystore.getKey(cerKeyAlias, p12Password.toCharArray());

		Boolean bSmall = encKey.length * 8 < ((RSAPrivateKey)pvtkey).getModulus().bitLength();
		System.out.println(String.valueOf(encKey.length *8));
		System.out.println(String.valueOf(((RSAPrivateKey)pvtkey).getModulus().bitLength()));
		System.out.println("bSmall? "+ bSmall);
		System.out.println("cypher-data-len="+ encKey.length);
		Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWITHSHA-256ANDMGF1PADDING");

		OAEPParameterSpec oaepParams = new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256,
				PSource.PSpecified.DEFAULT);

		//Initializing a Cipher object
		cipher.init(Cipher.DECRYPT_MODE, pvtkey,oaepParams);


		//symmetric key
		byte[] decipheredText = cipher.doFinal(encKey,0,encKey.length);
		//decode the data using this symmetric key
		System.out.println("Decoded Key="+new String(decipheredText));
		SecretKey key =  new SecretKeySpec(decipheredText, 0, decipheredText.length, "AES");
		cipher = Cipher.getInstance("AES/GCM/NoPadding"); //NoPadding

		System.out.println("Cypherblocksize=" + cipher.getBlockSize());
		byte[] randomIV = Arrays.copyOfRange(encData, encData.length - cipher.getBlockSize(), encData.length);
		byte[] finalencData = Arrays.copyOf(encData, encData.length - cipher.getBlockSize());
		System.out.println("IVLen=" + randomIV.length);

		SecretKeySpec keySpec = new SecretKeySpec(key.getEncoded(), "AES");
		GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(tagLength, randomIV);


		//randomIV);
		cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmParameterSpec);

		System.out.println("FInal datalen=" +finalencData.length);
		byte[] identity = cipher.doFinal(finalencData);

		System.out.println(new String(identity));

		return new String(identity);
	}

	private void renderView(JSONObject jsonObject, boolean status) throws Exception {
		GridPane photoPane = new GridPane();
		ObservableList<ColumnConstraints> photoColumnConstraints = photoPane.getColumnConstraints();
		ColumnConstraints photoConstraints1 = new ColumnConstraints();
		photoConstraints1.setPercentWidth(60);
		ColumnConstraints photoConstraints2 = new ColumnConstraints();
		photoConstraints2.setPercentWidth(40);
		photoColumnConstraints.add(photoConstraints1);
		photoColumnConstraints.add(photoConstraints2);

		ObservableList<RowConstraints> photoRowConstraints = photoPane.getRowConstraints();
		RowConstraints photoRowConstraints1 = new RowConstraints();
		photoRowConstraints1.setMinHeight(30);
		photoRowConstraints1.setMaxHeight(30);
		RowConstraints photoRowConstraints2 = new RowConstraints();
		photoRowConstraints2.setMinHeight(20);
		photoRowConstraints2.setMaxHeight(200);
		photoRowConstraints.add(photoRowConstraints1);
		photoRowConstraints.add(photoRowConstraints2);
		previewGrid.add(photoPane, 0, 0);

		GridPane detailsPane = new GridPane();
		ObservableList<ColumnConstraints> detailsColumnConstraints = detailsPane.getColumnConstraints();
		ColumnConstraints detailColumnConstraints1 = new ColumnConstraints();
		detailColumnConstraints1.setPercentWidth(10);
		ColumnConstraints detailColumnConstraints2 = new ColumnConstraints();
		detailColumnConstraints2.setPercentWidth(20);
		ColumnConstraints detailColumnConstraints3 = new ColumnConstraints();
		detailColumnConstraints3.setPercentWidth(1);
		ColumnConstraints detailColumnConstraints4 = new ColumnConstraints();
		detailColumnConstraints4.setPercentWidth(69);
		detailsColumnConstraints.add(detailColumnConstraints1);
		detailsColumnConstraints.add(detailColumnConstraints2);
		detailsColumnConstraints.add(detailColumnConstraints3);
		detailsColumnConstraints.add(detailColumnConstraints4);

		ObservableList<RowConstraints> detailRowConstraints = detailsPane.getRowConstraints();
		for (int i = 0; i < jsonObject.size(); i++) {
			RowConstraints detailRowConstraints1 = new RowConstraints();
			detailRowConstraints1.setMinHeight(20);
			detailRowConstraints1.setMaxHeight(200);
			detailRowConstraints.add(detailRowConstraints1);
		}
		previewGrid.add(detailsPane, 0, 1);

		LinkedHashMap<String, LinkedHashMap<String, String>> valueMap = new LinkedHashMap<>();
		for(Object key : jsonObject.keySet()) {
			String[] keyValues = key.toString().split("_");
			String keyValue ="";
			for (String keyName : keyValues[0].split("(?=\\p{Upper})")) {
				keyValue += " " + keyName.substring(0, 1).toUpperCase() + keyName.substring(1);
			}
			keyValue = keyValue.trim();
			String lang = keyValues.length > 1 ? keyValues[1] : "eng";

			if(valueMap.containsKey(keyValue)) {
				LinkedHashMap<String, String> map = valueMap.get(keyValue);
				map.put(lang, jsonObject.get(key).toString());
				valueMap.put(keyValue, map);
			} else {
				LinkedHashMap<String, String> map = new LinkedHashMap<>();
				map.put(lang, jsonObject.get(key).toString());
				valueMap.put(keyValue, map);
			}
		}

		LinkedHashMap<String, String> faceMap = valueMap.get("Face");
		String imageValue = faceMap.get("eng");

		ConvertRequestDto requestDto = new ConvertRequestDto();
		requestDto.setModality("Face");
		requestDto.setVersion("ISO19794_5_2011");
		requestDto.setInputBytes(CryptoUtil.decodeBase64(imageValue));

		byte [] imageData = FaceDecoder.convertFaceISOToImageBytes (requestDto);
		InputStream io = new ByteArrayInputStream(imageData);
		Image image = new Image(io);
		ImageView imageView = new ImageView(image);
		imageView.setFitHeight(120);
		imageView.setFitWidth(100);
		valueMap.remove("Face");

		HBox hPhotoBox = new HBox();
		hPhotoBox.getChildren().add(imageView);
		hPhotoBox.setPrefHeight(120);
		hPhotoBox.setPrefWidth(100);
		hPhotoBox.setAlignment(Pos.CENTER);

		VBox vPhotoBox = new VBox();
		vPhotoBox.getChildren().add(hPhotoBox);
		vPhotoBox.setMinHeight(20);
		vPhotoBox.setMaxHeight(100);

		photoPane.add(vPhotoBox, 1, 1);

		Label statusLabel = new Label();
		statusLabel.setVisible(true);
		statusLabel.setMinHeight(20);
		statusLabel.setMaxHeight(100);
		statusLabel.setPrefWidth(400);
		statusLabel.setAlignment(Pos.CENTER);
		statusLabel.setText("EKYC Preview");
		statusLabel.setStyle("-fx-text-fill: green; -fx-font-size: 20px; -fx-font-weight: bold; scroll-bar:horizontal:enabled");

		HBox statusHBox1 = new HBox();
		statusHBox1.getChildren().add(statusLabel);
		statusHBox1.setMinHeight(20);
		statusHBox1.setMaxHeight(100);
		statusHBox1.setAlignment(Pos.CENTER_LEFT);

		VBox statusVbox1 = new VBox();
		statusVbox1.getChildren().add(statusHBox1);
		statusVbox1.setMinHeight(20);
		statusVbox1.setMaxHeight(100);
		photoPane.add(statusVbox1, 0, 0);


		Integer rowNo = 0;
		for (Map.Entry entry : valueMap.entrySet()) {
			Label label1 = new Label();
			label1.setId(rowNo+ "KEY_LABEL");
			label1.setVisible(true);
			label1.setMinHeight(20);
			label1.setMaxHeight(100);
			Font font1 = new Font(12);
			label1.setFont(font1);
			label1.setText(entry.getKey().toString());

			HBox hBox1 = new HBox();
			hBox1.getChildren().add(label1);
			hBox1.setMinHeight(20);
			hBox1.setMaxHeight(100);
			hBox1.setAlignment(Pos.CENTER_LEFT);

			VBox vbox1 = new VBox();
			vbox1.getChildren().add(hBox1);
			vbox1.setMinHeight(20);
			vbox1.setMaxHeight(100);
			detailsPane.add(vbox1, 1, rowNo);

			Label label2 = new Label();
			label2.setVisible(true);
			label2.setText(":");
			label2.setMinHeight(20);
			label2.setMaxHeight(100);
			Font font2 = new Font(12);
			label2.setFont(font2);

			HBox hBox2 = new HBox();
			hBox2.getChildren().add(label2);
			hBox2.setMinHeight(20);
			hBox2.setMaxHeight(100);
			hBox2.setAlignment(Pos.CENTER);

			VBox vbox2 = new VBox();
			vbox2.getChildren().add(hBox2);
			vbox2.setMinHeight(20);
			vbox2.setMaxHeight(100);
			detailsPane.add(vbox2, 2, rowNo);

			LinkedHashMap<String, String> colValue = (LinkedHashMap<String, String>)entry.getValue();
			GridPane valueGridPane = new GridPane();
			ObservableList<ColumnConstraints> valueGridPaneCConstraints = valueGridPane.getColumnConstraints();
			ColumnConstraints valueGridColConstraints1 = new ColumnConstraints();
			valueGridColConstraints1.setPercentWidth(100);
			valueGridPaneCConstraints.add(valueGridColConstraints1);

			ObservableList<RowConstraints> valueGridPaneRConstraints = valueGridPane.getRowConstraints();
			for(int i = 0 ; i < colValue.size(); i++) {
				RowConstraints valueGridRowCons = new RowConstraints();
				valueGridRowCons.setPrefHeight(20);
				valueGridRowCons.setMaxHeight(100);
				valueGridPaneRConstraints.add(valueGridRowCons);
			}
			int valueRowCount = 0;
			for (Map.Entry entry1 : colValue.entrySet()) {
				Label label = new Label();
				label.setVisible(true);
				label.setWrapText(true);
				label.setPrefWidth(400);
				label.setMinHeight(20);
				label.setMaxHeight(100);
				label.setText(entry1.getValue().toString());

				VBox vbox = new VBox();
				vbox.getChildren().add(label);
				vbox.setMinHeight(20);
				vbox.setMaxHeight(100);
				valueGridPane.add(vbox, 0 , valueRowCount++);
			}
			detailsPane.add(valueGridPane, 3, rowNo++);
		}
	}
}
