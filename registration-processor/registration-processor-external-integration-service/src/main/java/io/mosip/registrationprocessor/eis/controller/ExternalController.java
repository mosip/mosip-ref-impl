package io.mosip.registrationprocessor.eis.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.mosip.registrationprocessor.eis.entity.MessageRequestDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * External Controller
 *
 */
@RestController
@RequestMapping("/registration-processor")
@Tag(name = "external-integration-service", description = "External Controller")
public class ExternalController {
	/**
	 * dummy method to process incoming requests
	 * @param messageRequestDTO
	 * @return boolean
	 */
	@PostMapping(path = "/external-integration-service/v1.0", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "external request Processed successfully"),
			@ApiResponse(responseCode = "201", description = "Created" ,content = @Content(schema = @Schema(hidden = true))),
			@ApiResponse(responseCode = "401", description = "Unauthorized" ,content = @Content(schema = @Schema(hidden = true))),
			@ApiResponse(responseCode = "403", description = "Forbidden" ,content = @Content(schema = @Schema(hidden = true))),
			@ApiResponse(responseCode = "404", description = "Not Found" ,content = @Content(schema = @Schema(hidden = true)))})
	public ResponseEntity<Boolean> eisController(@RequestBody(required = true) MessageRequestDTO messageRequestDTO)  {
			
		ResponseEntity<Boolean> temp=ResponseEntity.ok().body(Boolean.FALSE);
			 messageRequestDTO.getRequest();
			if(messageRequestDTO.getRequest() !=null) {
				temp=ResponseEntity.ok().body(Boolean.TRUE);
			}
			
		return temp;
		
	}
}
