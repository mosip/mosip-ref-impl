package io.mosip.biosdk.services.controller;

import com.google.gson.Gson;
import io.mosip.biosdk.services.config.LoggerConfig;
import io.mosip.biosdk.services.dto.*;
import io.mosip.biosdk.services.utils.Utils;
import io.mosip.kernel.biometrics.spi.IBioApi;
import io.mosip.kernel.core.logger.spi.Logger;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import java.util.Date;

@RestController
@RequestMapping("/")
@Api(tags = "Sdk")
@CrossOrigin("*")
public class MainController {

    private Logger log = LoggerConfig.logConfig(MainController.class);

    private String version = "1.0";

    @Autowired
    private Utils serviceUtil;

    @Autowired
    private IBioApi iBioApi;

    @Autowired
    private Gson gson;

    @GetMapping(path = "/")
    @ApiOperation(value = "Service status")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Service is running...") })
    public ResponseEntity<String> status() {
        Date d = new Date();
        return ResponseEntity.status(HttpStatus.OK).body("Service is running... "+d.toString());
    }

    @PostMapping(path = "/init", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Initialization")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Initialization successful") })
    public ResponseEntity<String> init(
            @Validated @RequestBody(required = true) InitRequestDto request,
            @ApiIgnore Errors errors) {
        ResponseDto response = new ResponseDto();
        response.setVersion(version);
        response.setResponsetime(serviceUtil.getCurrentResponseTime());
        response.setResponse(iBioApi.init(request.getInitParams()));
        return ResponseEntity.status(HttpStatus.OK).body(gson.toJson(response));
    }

    @PostMapping(path = "/match", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Match")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Match successful") })
    public ResponseEntity<String> match(
            @Validated @RequestBody(required = true) MatchRequestDto request,
            @ApiIgnore Errors errors) {
        ResponseDto response = new ResponseDto();
        response.setVersion(version);
        response.setResponsetime(serviceUtil.getCurrentResponseTime());
        response.setResponse(
            iBioApi.match(request.getSample(), request.getGallery(), request.getModalitiesToMatch(), request.getFlags()).getResponse()
        );
        return ResponseEntity.status(HttpStatus.OK).body(gson.toJson(response));
    }

    @PostMapping(path = "/check-quality", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Check quality")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Check successful") })
    public ResponseEntity<String> checkQuality(
            @Validated @RequestBody(required = true) CheckQualityRequestDto request,
            @ApiIgnore Errors errors) {
        ResponseDto response = new ResponseDto();
        response.setVersion(version);
        response.setResponsetime(serviceUtil.getCurrentResponseTime());
        response.setResponse(
            iBioApi.checkQuality(request.getSample(), request.getModalitiesToCheck(), request.getFlags()).getResponse()
        );
        return ResponseEntity.status(HttpStatus.OK).body(gson.toJson(response));
    }

    @PostMapping(path = "/extract-template", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Extract template")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Extract successful") })
    public ResponseEntity<String> extractTemplate(
            @Validated @RequestBody(required = true) ExtractTemplateRequestDto request,
            @ApiIgnore Errors errors) {
        ResponseDto response = new ResponseDto();
        response.setVersion(version);
        response.setResponsetime(serviceUtil.getCurrentResponseTime());
        response.setResponse(
            iBioApi.extractTemplate(request.getSample(), request.getModalitiesToExtract(), request.getFlags()).getResponse()
        );
        return ResponseEntity.status(HttpStatus.OK).body(gson.toJson(response));
    }

    @PostMapping(path = "/convert-format", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Convert format")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Convert successful") })
    public ResponseEntity<String> convertFormat(
            @Validated @RequestBody(required = true) ConvertFormatRequestDto request,
            @ApiIgnore Errors errors) {
        ResponseDto response = new ResponseDto();
        response.setVersion(version);
        response.setResponsetime(serviceUtil.getCurrentResponseTime());
        response.setResponse(
            iBioApi.convertFormat(
                    request.getSample(),
                    request.getSourceFormat(),
                    request.getTargetFormat(),
                    request.getSourceParams(),
                    request.getTargetParams(),
                    request.getModalitiesToConvert()
            )
        );
        return ResponseEntity.status(HttpStatus.OK).body(gson.toJson(response));
    }

    @PostMapping(path = "/segment", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Segment")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Segment successful") })
    public ResponseEntity<String> segment(
            @Validated @RequestBody(required = true) SegmentRequestDto request,
            @ApiIgnore Errors errors) {
        ResponseDto response = new ResponseDto();
        response.setVersion(version);
        response.setResponsetime(serviceUtil.getCurrentResponseTime());
        response.setResponse(
            iBioApi.segment(request.getSample(), request.getModalitiesToSegment(), request.getFlags()).getResponse()
        );
        return ResponseEntity.status(HttpStatus.OK).body(gson.toJson(response));
    }
}
