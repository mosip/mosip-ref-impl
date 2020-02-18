package io.mosip.packetgenerator.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import com.fasterxml.jackson.annotation.JsonFormat;

import io.mosip.packetgenerator.constant.GenderType;
import io.mosip.packetgenerator.customvalidation.DOB;
import io.mosip.packetgenerator.customvalidation.Gender;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
public class PacketRequestDto {
	@ApiModelProperty(value = "the first name", position = 1)
	@NotNull(message = "firstName should not be null ")
	@NotBlank(message = "firstName should not be empty")
	private String firstName;
	@ApiModelProperty(value = "the last name", position = 2)
	@NotNull(message = "lastName should not be null ")
	@NotBlank(message = "lastName should not be empty")
	private String lastName;
	@ApiModelProperty(value = "the gender", position = 3, example = "Male|Female")
	@NotNull(message = "gender should not be null ")
	@Gender(enumClass = GenderType.class, ignoreCase = true)
	private String gender;
	@ApiModelProperty(value = "the date of birth", position = 4, example = "yyyy/MM/dd")
	@NotNull(message = "dateOfBirth should not be null ")
	@NotBlank(message = "dateOfBirth should not be empty")
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy/MM/dd")
	@DOB(pattern = "yyyy/MM/dd")
	private String dateOfBirth;
	@ApiModelProperty(value = "the age", position = 5, example = "5")
	@NotNull(message = "age should not be null ")
	@Min(5)
	private int age;
	@ApiModelProperty(value = "the phone number", position = 6)
	@Pattern(regexp = "(^$|[0-9]{10})")
	@NotNull(message = "phone should not be null ")
	@NotBlank(message = "phone should not be empty")
	private String phone;
	@ApiModelProperty(value = "the email", position = 7)
	@Email
	private String email;
	@ApiModelProperty(value = "the addressline1", position = 8)
	@NotNull(message = "addressLine1 should not be null ")
	@NotBlank(message = "addressLine1 should not be empty")
	private String addressLine1;
	@ApiModelProperty(value = "the addressline1", position = 9)
	private String addressLine2;
	@ApiModelProperty(value = "the addressline1", position = 10)
	private String addressLine3;

}
