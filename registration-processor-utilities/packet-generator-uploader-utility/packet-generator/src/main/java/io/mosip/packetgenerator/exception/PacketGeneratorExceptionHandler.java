package io.mosip.packetgenerator.exception;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.mosip.kernel.core.exception.BaseCheckedException;
import io.mosip.kernel.core.exception.BaseUncheckedException;
import io.mosip.packetgenerator.constant.ErrorMessages;
import io.mosip.packetgenerator.controller.PacketGeneratorController;
import io.mosip.packetgenerator.dto.Response;
import io.mosip.registration.processor.core.common.rest.dto.ErrorDTO;
/**
 * 
 * @author Girish Yarru
 *
 */
@RestControllerAdvice(assignableTypes = PacketGeneratorController.class)
public class PacketGeneratorExceptionHandler {
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Response> methodArgumentNotValidException(final HttpServletRequest httpServletRequest,
			final MethodArgumentNotValidException e) {
		List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors();
		Response response = buildResponse(fieldErrors);
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

	@ExceptionHandler(RegBaseCheckedException.class)
	public ResponseEntity<Response> controlDataServiceException(HttpServletRequest httpServletRequest,
			final RegBaseCheckedException e) {
		Response response = buildResponse(e);
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<Response> test(HttpServletRequest httpServletRequest, final RuntimeException e) {
		Response response = buildResponse(e);
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

	private Response buildResponse(Exception ex) {
		Response response = new Response();

		if (ex instanceof BaseCheckedException) {

			List<String> errorCodes = ((BaseCheckedException) ex).getCodes();
			List<String> errorTexts = ((BaseCheckedException) ex).getErrorTexts();

			List<ErrorDTO> errors = errorTexts.parallelStream()
					.map(errMsg -> new ErrorDTO(errorCodes.get(errorTexts.indexOf(errMsg)), errMsg)).distinct()
					.collect(Collectors.toList());

			response.setErrors(errors);
		} else if (ex instanceof BaseUncheckedException) {
			List<String> errorCodes = ((BaseUncheckedException) ex).getCodes();
			List<String> errorTexts = ((BaseUncheckedException) ex).getErrorTexts();

			List<ErrorDTO> errors = errorTexts.parallelStream()
					.map(errMsg -> new ErrorDTO(errorCodes.get(errorTexts.indexOf(errMsg)), errMsg)).distinct()
					.collect(Collectors.toList());

			response.setErrors(errors);
		} else {
			List<ErrorDTO> errors = new ArrayList<>();
			ErrorDTO dto = new ErrorDTO();
			dto.setErrorCode(ErrorMessages.RUNTIME_EXCEPTION.getErrorCode());
			dto.setMessage(ErrorMessages.RUNTIME_EXCEPTION.getErrorMessage() + ex.getMessage());
			errors.add(dto);
			response.setErrors(errors);
		}

		response.setResponsetime(LocalDateTime.now());
		response.setVersion("version");
		response.setResponse(null);
		return response;
	}

	private Response buildResponse(List<FieldError> objErrors) {
		Response response = new Response();
		List<ErrorDTO> details = new ArrayList<>();
		ErrorDTO errorDto;
		for (FieldError error : objErrors) {
			errorDto = new ErrorDTO();
			errorDto.setErrorCode(ErrorMessages.INVALID_REQUEST.getErrorCode());
			errorDto.setMessage(ErrorMessages.INVALID_REQUEST.getErrorMessage() + error.getField() + " - "
					+ error.getDefaultMessage());
			details.add(errorDto);
		}
		response.setErrors(details);
		return response;

	}
}
