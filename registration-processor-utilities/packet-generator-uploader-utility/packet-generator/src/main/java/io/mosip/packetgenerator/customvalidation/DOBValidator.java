package io.mosip.packetgenerator.customvalidation;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
/**
 * 
 * @author Girish Yarru
 *
 */
public class DOBValidator implements ConstraintValidator<DOB, String> {

	private String pattern;

	@Override
	public void initialize(DOB constraintAnnotation) {
		this.pattern = constraintAnnotation.pattern();
	}

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		try {
			Date date = new SimpleDateFormat(pattern).parse(value);
			Calendar cal = Calendar.getInstance();
			Date today = cal.getTime();
			cal.add(Calendar.YEAR, -4); // date
			Date before4Years = cal.getTime();
			if (date.compareTo(new Date()) >= 0 || date.compareTo(before4Years) >= 0) {
				return false;
			}
			return true;
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return false;
	}

}
