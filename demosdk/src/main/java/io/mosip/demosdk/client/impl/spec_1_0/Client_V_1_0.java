package io.mosip.demosdk.client.impl.spec_1_0;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.codec.EncoderException;
import org.springframework.stereotype.Service;

import io.mosip.demosdk.client.utils.TextMatcherUtil;
import io.mosip.kernel.core.logger.spi.Logger;
import io.mosip.kernel.demographics.spi.IDemoApi;
import io.mosip.kernel.logger.logback.factory.Logfactory;

@Service
public class Client_V_1_0 implements IDemoApi {

	private static final String SPLIT_REGEX = "\\s+";
	public static final int EXACT_MATCH_VALUE = 100;

	private static Logger mosipLogger = Logfactory.getSlf4jLogger(Client_V_1_0.class);

	@Override
	public int doExactMatch(String reqInfo, String entityInfo, Map<String, String> flags) {
		int matchvalue = 0;
		List<String> refInfoList = split(reqInfo);
		List<String> entityInfoList = split(entityInfo);

		if (refInfoList.size() == entityInfoList.size() && allMatch(refInfoList, entityInfoList)) {
			matchvalue = EXACT_MATCH_VALUE;
		}
		return matchvalue;
	}

	@Override
	public int doPartialMatch(String reqInfo, String entityInfo, Map<String, String> flags) {
		int matchvalue = 0;
		List<String> refInfoList = split(reqInfo);
		List<String> originalEntityInfoList = split(entityInfo);
		List<String> entityInfoList = Collections.synchronizedList(new ArrayList<>(originalEntityInfoList));
		List<String> matchedList = new ArrayList<>();
		List<String> unmatchedList = new ArrayList<>();
		refInfoList.forEach((String refInfo) -> {
			if (entityInfoList.contains(refInfo)) {
				matchedList.add(refInfo);
				entityInfoList.remove(refInfo);
			} else {
				unmatchedList.add(refInfo);
			}
		});
		new ArrayList<>(unmatchedList).stream().filter(str -> str.length() == 1).forEach((String s) -> {
			Optional<String> matchingWord = entityInfoList.stream().filter(str -> str.startsWith(s)).findAny();
			if (matchingWord.isPresent()) {
				entityInfoList.remove(matchingWord.get());
				unmatchedList.remove(s);
			}
		});
		matchvalue = matchedList.size() * EXACT_MATCH_VALUE / (originalEntityInfoList.size() + unmatchedList.size());
		return matchvalue;
	}

	@Override
	public int doPhoneticsMatch(String reqInfo, String entityInfo, String language, Map<String, String> flags) {
		int value = 0;
		try {
			value = TextMatcherUtil.phoneticsMatch(reqInfo, entityInfo, language);
		} catch (EncoderException e) {
			mosipLogger.error("sessionId", "doPhoneticsMatch", "EncoderException", e.getMessage());
		}

		return value;
	}

	/**
	 * Split the string based on empty String and convert to words.
	 *
	 * @param str the str
	 * @return the list
	 */

	private static List<String> split(String str) {
		return Stream.of(str.toLowerCase().split(SPLIT_REGEX)).filter(s -> s.length() > 0).collect(Collectors.toList());
	}

	/**
	 * returns boolean values based on all match value on entityInfo List and
	 * refInfoList values.
	 *
	 * @param refInfoList    the ref info list
	 * @param entityInfoList the entity info list
	 * @return true, if successful
	 */

	private static boolean allMatch(List<String> refInfoList, List<String> entityInfoList) {
		return entityInfoList.parallelStream().allMatch(str -> refInfoList.contains(str));
	}

	@Override
	public void init() {		
		mosipLogger.debug("DEMOGRAPHICS", "intiated", "GET SDK INSTANCE",
				"DEMO SDK instance reused ");
						
	}

}