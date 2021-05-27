package io.mosip.demosdk.client.utils;

import java.util.HashSet;
import java.util.Set;

import org.apache.commons.codec.EncoderException;
import org.apache.commons.codec.language.Soundex;
import org.apache.commons.codec.language.bm.Languages;
import org.apache.commons.codec.language.bm.NameType;
import org.apache.commons.codec.language.bm.PhoneticEngine;
import org.apache.commons.codec.language.bm.RuleType;

/**
 * 
 * @author Nagarjuna
 *
 */
public class TextMatcherUtil {
	
	public static Integer phoneticsMatch(String inputString, String storedString, String language)
			throws EncoderException {
		PhoneticEngine phoneticEngine = new PhoneticEngine(NameType.GENERIC, RuleType.EXACT, true);

		Soundex soundex = new Soundex();

		Set<String> languageSet = new HashSet<>();
		languageSet.add(language);

		String encodedInputString = phoneticEngine.encode(inputString, Languages.LanguageSet.from(languageSet));

		String encodedStoredString = phoneticEngine.encode(storedString, Languages.LanguageSet.from(languageSet));

		return (soundex.difference(encodedInputString, encodedStoredString) + 1) * 20;
	}
}
