package io.mosip.packetgenerator.customvalidation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
 /**
  * 
  * @author Girish Yarru
  *
  */
public class GenderValidator implements ConstraintValidator<Gender, String>
{
    private Gender annotation;
 
    @Override
    public void initialize(Gender annotation)
    {
        this.annotation = annotation;
    }
 
    @Override
    public boolean isValid(String valueForValidation, ConstraintValidatorContext constraintValidatorContext)
    {
        boolean result = false;
         
        Object[] enumValues = this.annotation.enumClass().getEnumConstants();
         
        if(enumValues != null)
        {
            for(Object enumValue:enumValues)
            {
                if(valueForValidation.equals(enumValue.toString()) 
                   || (this.annotation.ignoreCase() && valueForValidation.equalsIgnoreCase(enumValue.toString())))
                {
                    result = true; 
                    break;
                }
            }
        }
         
        return result;
    }
}