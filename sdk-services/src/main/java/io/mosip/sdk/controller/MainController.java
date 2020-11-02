package io.mosip.sdk.controller;

import io.mosip.kernel.biometrics.entities.BiometricRecord;
import io.mosip.kernel.biometrics.model.MatchDecision;
import io.mosip.kernel.biometrics.model.QualityCheck;
import io.mosip.kernel.biometrics.model.Response;
import io.mosip.kernel.biometrics.model.SDKInfo;
import io.mosip.kernel.core.logger.spi.Logger;
import io.mosip.sdk.config.LoggerConfig;
import io.mosip.sdk.dto.*;
import io.mosip.sdk.service.MainService;
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

    @Autowired
    private MainService mainService;

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
    public ResponseEntity<SDKInfo> init(
            @Validated @RequestBody(required = true) InitRequestDto request,
            @ApiIgnore Errors errors) {
        return ResponseEntity.status(HttpStatus.OK).body(mainService.init(request.getInitParams()));
    }

    @PostMapping(path = "/match", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Match")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Match successful") })
    public ResponseEntity<Response<MatchDecision[]>> match(
            @Validated @RequestBody(required = true) MatchRequestDto request,
            @ApiIgnore Errors errors) {
        return ResponseEntity.status(HttpStatus.OK).body(
                mainService.match(request.getSample(), request.getGallery(), request.getModalitiesToMatch(), request.getFlags())
        );
    }

    @PostMapping(path = "/check-quality", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Check quality")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Check successful") })
    public ResponseEntity<Response<QualityCheck>> checkQuality(
            @Validated @RequestBody(required = true) CheckQualityRequestDto request,
            @ApiIgnore Errors errors) {
        return ResponseEntity.status(HttpStatus.OK).body(
                mainService.checkQuality(request.getSample(), request.getModalitiesToCheck(), request.getFlags())
        );
    }

    @PostMapping(path = "/extract-template", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Extract template")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Extract successful") })
    public ResponseEntity<Response<BiometricRecord>> extractTemplate(
            @Validated @RequestBody(required = true) ExtractTemplateRequestDto request,
            @ApiIgnore Errors errors) {
        return ResponseEntity.status(HttpStatus.OK).body(
                mainService.extractTemplate(request.getSample(), request.getModalitiesToExtract(), request.getFlags())
        );
    }

    @PostMapping(path = "/convert-format", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Convert format")

    @ApiResponses(value = { @ApiResponse(code = 200, message = "Convert successful") })
    public ResponseEntity<Response<BiometricRecord>> convertFormat(
            @Validated @RequestBody(required = true) ConvertFormatRequestDto request,
            @ApiIgnore Errors errors) {
        return ResponseEntity.status(HttpStatus.OK).body(
                mainService.convertFormat(
                        request.getSample(),
                        request.getSourceFormat(),
                        request.getTargetFormat(),
                        request.getSourceParams(),
                        request.getTargetParams(),
                        request.getModalitiesToConvert()
                )
        );
    }

    @PostMapping(path = "/segment", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Segment")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "Segment successful") })
    public ResponseEntity<Response<BiometricRecord>> segment(
            @Validated @RequestBody(required = true) SegmentRequestDto request,
            @ApiIgnore Errors errors) {
        return ResponseEntity.status(HttpStatus.OK).body(
                mainService.segment(request.getSample(), request.getModalitiesToSegment(), request.getFlags())
        );
    }
}
