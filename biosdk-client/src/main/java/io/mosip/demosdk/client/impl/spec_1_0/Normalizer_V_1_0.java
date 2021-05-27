package io.mosip.demosdk.client.impl.spec_1_0;

import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import io.mosip.kernel.demographics.spi.IDemoNormalizer;

@Component
public class Normalizer_V_1_0 implements IDemoNormalizer {

	public static final String IDA_BASIC_NORMALISER = "ida.demo.%s.normalization.regex.%s[%s]";
	public static final String IDA_NORMALISER_SEP = "ida.norm.sep";
	private static final String DEFAULT_SEP = "=";
	private static final int NORMALIZER_CONFIG_LIMIT = 1000;

	@Autowired
	private Environment environment;

	@Override
	public String normalizeName(String nameInfo, String language, Map<String, List<String>> fetchTitles) {		
		StringBuilder nameBuilder = new StringBuilder(nameInfo);
		List<String> titlesList = fetchTitles.get(language);
		if (null != titlesList) {
			Collections.sort(titlesList, Comparator.comparing(String::length).reversed());
			for (String title : titlesList) {
				String title1 = title + ".";
				removeAllCases(nameBuilder, title1);
				removeAllCases(nameBuilder, title);
			}
		}
		Map<Pattern, String> namePatterns = normalizeWithCommonAttributes("name", language);
		normalize(nameBuilder, namePatterns);
		return nameBuilder.toString().trim();
	}

	private Map<Pattern, String> normalizeWithCommonAttributes(String type, String language) {
		Map<Pattern, String> namePatterns = getNormalisersByTypeAndLang(type, language);
		namePatterns.putAll(getNormalisersByTypeAndLang(type, "any"));
		namePatterns.putAll(getNormalisersByTypeAndLang("common", language));
		namePatterns.putAll(getNormalisersByTypeAndLang("common", "any"));
		return namePatterns;
	}

	private static void removeAllCases(StringBuilder nameBuilder, String title1) {
		while (nameBuilder.toString().toLowerCase().contains(title1.toLowerCase())) {
			int index = nameBuilder.indexOf(title1);
			if (index >= 0) {
				nameBuilder.replace(index, index + title1.length(), "");
			}

			index = nameBuilder.indexOf(title1.toLowerCase());
			if (index >= 0) {
				nameBuilder.replace(index, index + title1.length(), "");
			}

			index = nameBuilder.indexOf(title1.toUpperCase());
			if (index >= 0) {
				nameBuilder.replace(index, index + title1.length(), "");
			}
		}
	}

	@Override
	public String normalizeAddress(String address, String language) {
		Map<Pattern, String> addressPattern = normalizeWithCommonAttributes("address", language);
		return normalize(address, addressPattern);
	}

	private String normalize(String data, Map<Pattern, String> normalizePatterns) {
		StringBuilder addressBuilder = new StringBuilder(data);
		normalize(addressBuilder, normalizePatterns);
		return addressBuilder.toString().trim();
	}

	private void normalize(StringBuilder stringBuilder, Map<Pattern, String> normPatterns) {
		for (Map.Entry<Pattern, String> entry : normPatterns.entrySet()) {
			Matcher m = entry.getKey().matcher(stringBuilder);
			// Find from start
			int findStart = 0;
			while (m.find(findStart)) {
				int start = m.start();
				int end = m.end();
				// If it matches no character, break to proceed to next pattern in the outer
				// loop
				if (end - start == 0) {
					break;
				}

				String replacement = entry.getValue();
				stringBuilder.replace(m.start(), end, replacement);
				// Find next from the replacement index
				findStart = start + replacement.length();
			}
		}
	}

	private Map<Pattern, String> getBasicNormalisers(String normalizerKey) {
		Map<Pattern, String> basicPatternMap = new LinkedHashMap<>();
		for (int i = 0; i < NORMALIZER_CONFIG_LIMIT; i++) {
			String basicPattern = String.format(normalizerKey, i);
			String normaliseValue = environment.getProperty(basicPattern);
			if (null != normaliseValue) {
				String sep = environment.getProperty(IDA_NORMALISER_SEP, DEFAULT_SEP);
				if (normaliseValue.contains(sep)) {
					String patternReplacement[] = normaliseValue.split(sep);
					Pattern normPattern = Pattern.compile(patternReplacement[0], Pattern.UNICODE_CHARACTER_CLASS);
					String replacement;
					if (patternReplacement.length > 1) {
						replacement = patternReplacement[1];
					} else {
						replacement = "";
					}
					basicPatternMap.put(normPattern, replacement);
				} else {
					basicPatternMap.put(Pattern.compile(normaliseValue, Pattern.UNICODE_CHARACTER_CLASS), "");
				}
			} else {
				break;
			}
		}
		return basicPatternMap;
	}

	private Map<Pattern, String> getNormalisersByTypeAndLang(String type, String language) {
		return getBasicNormalisers(String.format(IDA_BASIC_NORMALISER, type, language, "%s"));
	}

}
