package io.mosip.packetgenerator.controller;

import java.io.InputStream;

import javax.validation.Valid;

import org.fusesource.hawtbuf.ByteArrayInputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.mosip.packetgenerator.dto.Response;
import io.mosip.packetgenerator.dto.Request;
import io.mosip.packetgenerator.dto.PacketDetails;
import io.mosip.packetgenerator.exception.RegBaseCheckedException;
import io.mosip.packetgenerator.service.PacketeneratorService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
/**
 * 
 * @author Girish Yarru
 *
 */
@RestController
@Api(tags = "Packet Generator and Uploader")
public class PacketGeneratorController {
	@Autowired
	private PacketeneratorService service;

	@PostMapping(path = "/createAndUpload", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	@ApiOperation(value = "create and upload packet to Registration Processor", response = Request.class)
	@ApiResponses(value = { @ApiResponse(code = 200, message = "Packet has been created and uploaded successfully") })

	public ResponseEntity<Response> createAndUploadPacket(@RequestBody @Valid Request request)
			throws RegBaseCheckedException {
		Response response = service.createAndUploadPacket(request);
		return ResponseEntity.ok().body(response);
	}

	@PostMapping(path = "/createAndSync")
	@ApiOperation(value = "click of 'Download File' to download created packet", response = Object.class)
	@ApiResponses(value = { @ApiResponse(code = 200, message = "Packet encrypted successfully") })
	public ResponseEntity<Object> createAndSyncPacket(@RequestBody @Valid Request request)
			throws RegBaseCheckedException {
		PacketDetails packetDetails = service.createAndSyncPacket(request);
		String regId = packetDetails.getRegistartionId();
		InputStream encryptPacketStream = new ByteArrayInputStream(packetDetails.getPacketBytes());
		InputStreamResource resource = new InputStreamResource(encryptPacketStream);
		return ResponseEntity.ok().contentType(MediaType.parseMediaType("application/zip"))
				.header("Content-Disposition", "attachment; filename=\"" + regId + ".zip\"").body((Object) resource);

	}
}
