package io.mosip.packetgenerator.customvalidation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;
/**
 * 
 * @author Girish Yarru
 *
 */
@Documented
@Constraint(validatedBy = { DOBValidator.class })
@Target(value = { ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface DOB {
	String message() default "Date format should be [yyyy/MM/dd] and dob should be less than 4 years of current date";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

	String pattern();
}
