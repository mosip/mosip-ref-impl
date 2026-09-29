package io.mosip.kernel.smsserviceprovider.msg91.impl;

	
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import io.mosip.kernel.core.notification.exception.InvalidNumberException;
import io.mosip.kernel.core.notification.model.SMSResponseDto;
import io.mosip.kernel.core.notification.spi.SMSServiceProvider;
import io.mosip.kernel.core.util.StringUtils;
import io.mosip.kernel.smsserviceprovider.msg91.constant.SmsExceptionConstant;
import io.mosip.kernel.smsserviceprovider.msg91.constant.SmsPropertyConstant;

/**
 * MSG91 implementation of {@link SMSServiceProvider}.
 * <p>
 * Validates the destination number against {@code mosip.id.validation.identity.phone},
 * then GET-calls {@code mosip.kernel.sms.api} with auth key, sender, route, unicode,
 * and country code. Vendor HTTP errors become {@link RuntimeException}.
 * </p>
 *
 * @author Ritesh Sinha
 * @since 1.0.0
 */
@Component
public class SMSServiceProviderImpl implements SMSServiceProvider {

	/** HTTP client used to call the MSG91 gateway. */
	@Autowired
	RestTemplate restTemplate;

	/** When false, send still validates the number then hits the vendor (legacy behaviour). */
	@Value("${mosip.kernel.sms.enabled:false}")
	boolean smsEnabled;

	/** Country dialling code query param for MSG91. */
	@Value("${mosip.kernel.sms.country.code}")
	String countryCode;

	/** Minimum allowed national number length. */
	@Value("${mosip.kernel.sms.number.min.length}")
	int numberMinLength;

	/** Maximum allowed national number length. */
	@Value("${mosip.kernel.sms.number.max.length}")
	int numberMaxLength;

	/** MSG91 send-SMS endpoint. */
	@Value("${mosip.kernel.sms.api}")
	String api;

	/** Registered MSG91 sender id. */
	@Value("${mosip.kernel.sms.sender}")
	String sender;

	/** Optional vendor password (unused by current query-param flow). */
	@Value("${mosip.kernel.sms.password:null}")
	private String password;

	/** MSG91 route id. */
	@Value("${mosip.kernel.sms.route:null}")
	String route;

	/** MSG91 auth key. */
	@Value("${mosip.kernel.sms.authkey:null}")
	String authkey;

	/** Unicode flag sent to MSG91 ({@code 1} = unicode). */
	@Value("${mosip.kernel.sms.unicode:1}")
	String unicode;

	/** Phone regex from MOSIP identity validation config. */
	@Value("${mosip.id.validation.identity.phone}")
	private String phoneRegex;

	/**
	 * Sends {@code message} to {@code contactNumber} via MSG91.
	 *
	 * @param contactNumber destination MSISDN (validated)
	 * @param message SMS body; {@code #} is encoded for the query string
	 * @return vendor-agnostic MOSIP {@link SMSResponseDto}
	 */
	@Override
	public SMSResponseDto sendSms(String contactNumber, String message) {
		SMSResponseDto smsResponseDTO = new SMSResponseDto();
		validateInput(contactNumber);
		UriComponentsBuilder sms = UriComponentsBuilder.fromUriString(api)
				.queryParam(SmsPropertyConstant.AUTH_KEY.getProperty(), authkey)
				.queryParam(SmsPropertyConstant.SMS_MESSAGE.getProperty(), message.replaceAll("\\#", "%23"))
				.queryParam(SmsPropertyConstant.ROUTE.getProperty(), route)
				.queryParam(SmsPropertyConstant.SENDER_ID.getProperty(), sender)
				.queryParam(SmsPropertyConstant.RECIPIENT_NUMBER.getProperty(), contactNumber)
				.queryParam(SmsPropertyConstant.UNICODE.getProperty(), unicode)
				.queryParam(SmsPropertyConstant.COUNTRY_CODE.getProperty(), countryCode);
		try {
			//restTemplate.getForEntity(sms.toUriString(), String.class);
			/*Added the url decoder to avoid double encoding*/
			restTemplate.getForEntity(URLDecoder.decode(sms.toUriString(), StandardCharsets.UTF_8), String.class);
		} catch (HttpClientErrorException | HttpServerErrorException e) {
			throw new RuntimeException(e.getResponseBodyAsString());
		}
		smsResponseDTO.setMessage(SmsPropertyConstant.SUCCESS_RESPONSE.getProperty());
		smsResponseDTO.setStatus("success");
		return smsResponseDTO;
	}

	/**
	 * Rejects numbers that fail {@link #phoneValidator(String)}.
	 *
	 * @param contactNumber candidate MSISDN
	 */
	private void validateInput(String contactNumber) {
		if (!phoneValidator(contactNumber)) {
			throw new InvalidNumberException(SmsExceptionConstant.SMS_INVALID_CONTACT_NUMBER.getErrorCode(),
					SmsExceptionConstant.SMS_INVALID_CONTACT_NUMBER.getErrorMessage());
		}
	}

	/**
	 * @param phone candidate number
	 * @return {@code true} if {@code phone} matches {@code mosip.id.validation.identity.phone}
	 */
	public boolean phoneValidator(String phone) {
		return phone.matches(phoneRegex);
	}

}