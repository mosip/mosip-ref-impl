package io.mosip.packetgenerator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.mosip.kernel.core.idobjectvalidator.constant.IdObjectValidatorSupportedOperations;
import io.mosip.kernel.core.idobjectvalidator.exception.IdObjectIOException;
import io.mosip.kernel.core.idobjectvalidator.exception.IdObjectValidationFailedException;
import io.mosip.kernel.core.idobjectvalidator.spi.IdObjectValidator;
import io.mosip.kernel.core.util.DateUtils;
import io.mosip.kernel.core.util.HMACUtils;
import io.mosip.kernel.core.util.JsonUtils;
import io.mosip.kernel.core.util.exception.JsonProcessingException;
import io.mosip.packetgenerator.builder.AuditRequestBuilder;
import io.mosip.packetgenerator.constant.DocumentType;
import io.mosip.packetgenerator.constant.ErrorMessages;
import io.mosip.packetgenerator.constant.PacketGeneratorConstants;
import io.mosip.packetgenerator.dto.*;
import io.mosip.packetgenerator.exception.RegBaseCheckedException;
import io.mosip.packetgenerator.exception.RegBaseUnCheckedException;
import io.mosip.packetgenerator.util.EncryptorUtil;
import io.mosip.registration.processor.core.code.ApiName;
import io.mosip.registration.processor.core.common.rest.dto.ErrorDTO;
import io.mosip.registration.processor.core.exception.ApisResourceAccessException;
import io.mosip.registration.processor.core.exception.util.PlatformErrorMessages;
import io.mosip.registration.processor.core.http.ResponseWrapper;
import io.mosip.registration.processor.core.spi.restclient.RegistrationProcessorRestClientService;
import io.mosip.registration.processor.core.util.JsonUtil;
import io.mosip.registration.processor.core.util.ServerUtil;
import io.mosip.registration.processor.status.code.SupervisorStatus;
import io.mosip.registration.processor.status.dto.RegistrationSyncRequestDTO;
import io.mosip.registration.processor.status.dto.SyncRegistrationDto;
import io.mosip.registration.processor.status.dto.SyncResponseDto;
import io.mosip.registration.processor.status.sync.response.dto.RegSyncResponseDTO;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static io.mosip.kernel.core.util.JsonUtils.javaObjectToJsonString;
import static java.io.File.separator;

/**
 * @author Girish Yarru
 */
@Service
public class PacketeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(PacketeneratorService.class.getName());
    private Gson gson = new GsonBuilder().serializeNulls().create();

    @Autowired
    private ResourceLoader resourceLoader;

    @Value("${mosip.kernel.registrationcenterid.length}")
    private int centerIdLength;

    @Value("${registration.processor.rid.machineidsubstring}")
    private int machineIdLength;

    @Autowired
    private RegistrationProcessorRestClientService<Object> restClientService;
    @Autowired
    private IdObjectValidator idObjectSchemaValidator;
    @Autowired
    private Environment environment;
    @Autowired
    private EncryptorUtil encryptUtil;

    private static final String NEW = "NEW";

    public Response createAndUploadPacket(Request request) throws RegBaseCheckedException {
        Response response = new Response();
        PacketDetails packetDetails = createPacketBytes(request);
        String regId = packetDetails.getRegistartionId();
        byte[] packetBytes = packetDetails.getPacketBytes();
        String creationTime = getPacketCreationTime(regId);
        byte[] encryptedBytes = encryptPacket(packetBytes, regId, creationTime);
        logger.info("sending request to sync and upload");
        PacketResponseDto packetResponseDto = syncAndUploadPacket(encryptedBytes, regId, creationTime);
        logger.info("response status : " + packetResponseDto.getStatus());
        response.setErrors(null);
        response.setResponse(packetResponseDto);
        return response;
    }

    public PacketDetails createAndSyncPacket(Request request) throws RegBaseCheckedException {
        PacketDetails packetDetails = createPacketBytes(request);
        String registartionId = packetDetails.getRegistartionId();
        String creationTime = getPacketCreationTime(registartionId);
        byte[] packetBytes = packetDetails.getPacketBytes();
        byte[] encryptedBytes = encryptPacket(packetBytes, registartionId, creationTime);
        RegSyncResponseDTO regSyncResponseDTO = packetSync(registartionId, NEW, encryptedBytes, creationTime);
        if (regSyncResponseDTO == null)
            throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                    ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage());
        if (regSyncResponseDTO.getErrors() != null
                || regSyncResponseDTO.getErrors() != null && !regSyncResponseDTO.getErrors().isEmpty())
            throw new RegBaseCheckedException(ErrorMessages.SYNC_FAILED.getErrorCode(),
                    ErrorMessages.SYNC_FAILED.getErrorMessage() + String.valueOf(regSyncResponseDTO.getErrors()));
        packetDetails.setPacketBytes(encryptedBytes);
        return packetDetails;

    }

    @SuppressWarnings("unchecked")
    private PacketDetails createPacketBytes(Request identityRequestDto) throws RegBaseCheckedException {
        PacketDetails packetDetails = new PacketDetails();
        Map<String, DocumentDetails> docsInfo = new HashMap<>();
        JSONObject packetMetaInfoJson = null;
        String regId = null;
        try {
            getAllDocsFromResourceAsMap(docsInfo);
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            Map<String, Object> identityRequestMap = getIdentityRequestDtoMap(identityRequestDto);
            byte[] idBytes = docsInfo.get(PacketGeneratorConstants.ID).getDocValue();
            String idJsonString = new String(idBytes);
            JSONObject idJsonObject = JsonUtil.objectMapperReadValue(idJsonString, JSONObject.class);
            JSONObject identityJson = JsonUtil.getJSONObject(idJsonObject, PacketGeneratorConstants.IDENTITY);
            Set<String> keys = identityRequestMap.keySet();
            keys.parallelStream().forEach(key -> {
                Object object = identityJson.get(key);
                if (object instanceof ArrayList) {
                    JSONArray array = JsonUtil.getJSONArray(identityJson, key);
                    for (Object jsonObj : array) {
                        if (jsonObj instanceof LinkedHashMap) {
                            if (PacketGeneratorConstants.GENDER.equalsIgnoreCase(key) && "ara".equals(
                                    ((LinkedHashMap<String, Object>) jsonObj).get(PacketGeneratorConstants.LANGUAGE))) {
                                if (PacketGeneratorConstants.MALE
                                        .equalsIgnoreCase(identityRequestDto.getRequest().getGender())) {
                                    ((LinkedHashMap<String, Object>) jsonObj).put(PacketGeneratorConstants.VALUE,
                                            "الذكر");
                                } else if (PacketGeneratorConstants.FEMALE
                                        .equalsIgnoreCase(identityRequestDto.getRequest().getGender())) {
                                    ((LinkedHashMap<String, Object>) jsonObj).put(PacketGeneratorConstants.VALUE,
                                            "أنثى");
                                } else {
                                    ((LinkedHashMap<String, Object>) jsonObj).put(PacketGeneratorConstants.VALUE,
                                            "الآخرين");
                                }
                            } else if (PacketGeneratorConstants.GENDER.equalsIgnoreCase(key) && "eng".equals(
                                    ((LinkedHashMap<String, Object>) jsonObj).get(PacketGeneratorConstants.LANGUAGE))) {

                                if (PacketGeneratorConstants.MALE
                                        .equalsIgnoreCase(identityRequestDto.getRequest().getGender())) {
                                    ((LinkedHashMap<String, Object>) jsonObj).put(PacketGeneratorConstants.VALUE,
                                            "Male");
                                } else if (PacketGeneratorConstants.FEMALE
                                        .equalsIgnoreCase(identityRequestDto.getRequest().getGender())) {
                                    ((LinkedHashMap<String, Object>) jsonObj).put(PacketGeneratorConstants.VALUE,
                                            "Female");
                                } else {
                                    ((LinkedHashMap<String, Object>) jsonObj).put(PacketGeneratorConstants.VALUE,
                                            "Others");
                                }

                            } else {

                                ((LinkedHashMap<String, Object>) jsonObj).put(PacketGeneratorConstants.VALUE,
                                        identityRequestMap.get(key));
                            }

                        }
                    }
                } else if (object instanceof LinkedHashMap) {
                    ((LinkedHashMap<String, Object>) object).put(PacketGeneratorConstants.VALUE,
                            identityRequestMap.get(key));
                } else {
                    LinkedHashMap<String, Object> tempMap = (LinkedHashMap<String, Object>) idJsonObject
                            .get(PacketGeneratorConstants.IDENTITY);
                    tempMap.put(key, identityRequestMap.get(key));
                }
            });

            // set changed ID json
            DocumentDetails docDetail = docsInfo.get(PacketGeneratorConstants.ID);
            docDetail.setDocValue(idJsonObject.toJSONString().getBytes());
            docsInfo.put(PacketGeneratorConstants.ID, docDetail);
            idObjectSchemaValidator.validateIdObject(idJsonObject.toJSONString(),
                    IdObjectValidatorSupportedOperations.NEW_REGISTRATION);
            // dynamically get centerId and machineId
            String packetMetaInfo = new String(docsInfo.get(PacketGeneratorConstants.PACKET_META_INFO).getDocValue());
            packetMetaInfoJson = (JSONObject) JsonUtil.objectMapperReadValue(packetMetaInfo, JSONObject.class);
            String centerId = null;
            String machineId = null;
            JSONArray metaData = JsonUtil.getJSONArray(
                    JsonUtil.getJSONObject(packetMetaInfoJson, PacketGeneratorConstants.IDENTITY),
                    PacketGeneratorConstants.META_DATA);
            for (Object obj : metaData) {
                if (PacketGeneratorConstants.MACHINE_ID
                        .equals(((LinkedHashMap<String, String>) obj).get(PacketGeneratorConstants.LABEL))) {
                    machineId = ((LinkedHashMap<String, String>) obj).get(PacketGeneratorConstants.VALUE);
                }
                if (PacketGeneratorConstants.CENTER_ID
                        .equals(((LinkedHashMap<String, String>) obj).get(PacketGeneratorConstants.LABEL))) {
                    centerId = ((LinkedHashMap<String, String>) obj).get(PacketGeneratorConstants.VALUE);
                }
                if (centerId != null && machineId != null)
                    break;
            }
            regId = generateRegistrationId(centerId, machineId);
            // set registartionId in packet meta info
            for (Object obj : metaData) {
                if (PacketGeneratorConstants.REGISTRATION_ID
                        .equals(((LinkedHashMap<String, String>) obj).get(PacketGeneratorConstants.LABEL))) {
                    ((LinkedHashMap<String, String>) obj).put(PacketGeneratorConstants.VALUE, regId);
                    break;
                }
            }

            DocumentDetails packetMetaInfodocDetail = docsInfo.get(PacketGeneratorConstants.PACKET_META_INFO);
            packetMetaInfodocDetail.setDocValue(packetMetaInfoJson.toJSONString().getBytes());
            docsInfo.put(PacketGeneratorConstants.PACKET_META_INFO, packetMetaInfodocDetail);

            // auditRequestBuilder
            AuditRequestBuilder auditRequestBuilder = new AuditRequestBuilder();
            // Getting Host IP Address and Name
            String hostIP = null;
            String hostName = null;
            try {
                hostIP = InetAddress.getLocalHost().getHostAddress();
                hostName = InetAddress.getLocalHost().getHostName();
            } catch (UnknownHostException unknownHostException) {
                logger.error(unknownHostException.getStackTrace().toString());

                hostIP = ServerUtil.getServerUtilInstance().getServerIp();
                hostName = ServerUtil.getServerUtilInstance().getServerName();
            }
            auditRequestBuilder.setActionTimeStamp(LocalDateTime.now(ZoneOffset.UTC))
                    .setCreatedAt(LocalDateTime.now(ZoneOffset.UTC)).setUuid("")
                    .setApplicationId(environment.getProperty(PacketGeneratorConstants.AUDIT_APPLICATION_ID))
                    .setApplicationName(environment.getProperty(PacketGeneratorConstants.AUDIT_APPLICATION_NAME))
                    .setCreatedBy("Packet_Generator").setDescription("Packet created successfully")
                    .setEventId("RPR_405").setEventName("packet uploaded").setEventType("USER").setHostIp(hostIP)
                    .setHostName(hostName).setId(regId).setIdType("REGISTRATION_ID").setModuleId("REG - MOD - 119")
                    .setModuleName("PACKET_GENERATOR_UTILITY").setSessionUserId("mosip")
                    .setSessionUserName("openSourceUser");
            AuditDTO auditDto = auditRequestBuilder.build();

            // change audit
            DocumentDetails audit = docsInfo.get(PacketGeneratorConstants.AUDIT);
            audit.setDocValue(JsonUtil.objectMapperObjectToJson(auditDto).getBytes());
            docsInfo.put(PacketGeneratorConstants.AUDIT, audit);

            List<String> hashsequence1Files = new ArrayList<>();
            List<String> hashsequence2Files = new ArrayList<>();
            JSONArray hashsequence1Array = JsonUtil.getJSONArray(
                    JsonUtil.getJSONObject(packetMetaInfoJson, PacketGeneratorConstants.IDENTITY),
                    PacketGeneratorConstants.HASHSEQUENCE1);
            JSONArray hashsequence2Array = JsonUtil.getJSONArray(
                    JsonUtil.getJSONObject(packetMetaInfoJson, PacketGeneratorConstants.IDENTITY),
                    PacketGeneratorConstants.HASHSEQUENCE2);

            // generating hash sequence
            for (Object obj : hashsequence1Array) {
                hashsequence1Files.addAll(
                        (List<String>) ((LinkedHashMap<Object, Object>) obj).get(PacketGeneratorConstants.VALUE));
            }
            for (Object obj : hashsequence2Array) {
                hashsequence2Files.addAll(
                        (List<String>) ((LinkedHashMap<Object, Object>) obj).get(PacketGeneratorConstants.VALUE));
            }

            // generate packet data hash

            byte[] packetDataHashBytes = generateHashSequence(hashsequence1Files, docsInfo);
            DocumentDetails packetDataHash = docsInfo.get(PacketGeneratorConstants.PACKET_DATA_HASH);
            packetDataHash.setDocValue(packetDataHashBytes);
            docsInfo.put(PacketGeneratorConstants.PACKET_DATA_HASH, packetDataHash);

            byte[] osiDataHashBytes = generateHashSequence(hashsequence2Files, docsInfo);
            DocumentDetails packetOsiDataHash = docsInfo.get(PacketGeneratorConstants.PACKET_OSI_DATA_HASH);
            packetOsiDataHash.setDocValue(osiDataHashBytes);
            docsInfo.put(PacketGeneratorConstants.PACKET_OSI_DATA_HASH, packetOsiDataHash);
        } catch (IOException e) {
            logger.error(e.getStackTrace().toString());
            throw new RegBaseCheckedException(ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorCode(),
                    ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorMessage() + e.getMessage(), e);
        } catch (IdObjectValidationFailedException | IdObjectIOException e) {
            logger.error(e.getStackTrace().toString());
            throw new RegBaseCheckedException(ErrorMessages.ID_VALIDATION_FAILED.getErrorCode(),
                    ErrorMessages.ID_VALIDATION_FAILED.getErrorMessage() + e.getMessage(), e);
        }
        byte[] packetBytes = null;

        // creating zip file
        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {
            Set<String> allFiles = docsInfo.keySet();
            allFiles.forEach(file -> {
                try {
                    DocumentDetails documentDetail = docsInfo.get(file);
                    if (documentDetail.getDocType().equals(DocumentType.BIOMETRIC)) {
                        writeFileToZip("Biometric".concat(separator) + documentDetail.getDocName(),
                                docsInfo.get(file).getDocValue(), zipOutputStream);
                    } else if (documentDetail.getDocType().equals(DocumentType.DEMOGRAPHIC)) {
                        writeFileToZip("Demographic".concat(separator) + documentDetail.getDocName(),
                                docsInfo.get(file).getDocValue(), zipOutputStream);

                    } else {
                        writeFileToZip(documentDetail.getDocName(), docsInfo.get(file).getDocValue(), zipOutputStream);
                    }

                } catch (RegBaseCheckedException ex) {
                    logger.error(ex.getStackTrace().toString());
                    throw new RegBaseUnCheckedException(ErrorMessages.WRITE_FILE_TO_ZIPFAILED.getErrorCode(),
                            ErrorMessages.WRITE_FILE_TO_ZIPFAILED.getErrorMessage(), ex);
                }

            });

            zipOutputStream.flush();
            byteArrayOutputStream.flush();
            zipOutputStream.close();
            byteArrayOutputStream.close();
            packetBytes = byteArrayOutputStream.toByteArray();
        } catch (IOException e) {
            logger.error(e.getStackTrace().toString());
            throw new RegBaseCheckedException(ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorCode(),
                    ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorMessage() + e.getMessage(), e);
        }
        packetDetails.setPacketBytes(packetBytes);
        packetDetails.setRegistartionId(regId);
        logger.info("packetDetails created...........");
        return packetDetails;
    }

    private static void writeFileToZip(String fileName, byte[] file, ZipOutputStream zipOutputStream)
            throws RegBaseCheckedException {
        try {
            final ZipEntry zipEntry = new ZipEntry(fileName);
            zipOutputStream.putNextEntry(zipEntry);
            zipOutputStream.write(file);
            zipOutputStream.flush();
        } catch (IOException ioException) {
            logger.error(ioException.getStackTrace().toString());
            throw new RegBaseCheckedException(PlatformErrorMessages.RPR_SYS_IO_EXCEPTION, ioException);
        }
    }

    private String getPacketCreationTime(String regId) {
        String packetCreatedDateTime = regId.substring(regId.length() - 14);
        String formattedDate = packetCreatedDateTime.substring(0, 8) + "T"
                + packetCreatedDateTime.substring(packetCreatedDateTime.length() - 6);
        LocalDateTime ldt = LocalDateTime.parse(formattedDate, DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
        return ldt.toString() + ".000Z";
    }

    private PacketResponseDto syncAndUploadPacket(byte[] encryptedbyte, String registartionId, String creationTime)
            throws RegBaseCheckedException {
        PacketResponseDto response = new PacketResponseDto();
        try {
            ByteArrayResource contentsAsResource = new ByteArrayResource(encryptedbyte) {
                @Override
                public String getFilename() {
                    return registartionId + PacketGeneratorConstants.EXTENSION_OF_FILE;
                }
            };

            RegSyncResponseDTO regSyncResponseDTO = packetSync(registartionId, NEW, encryptedbyte, creationTime);
            String syncStatus = null;
            if (regSyncResponseDTO != null) {
                List<SyncResponseDto> synList = regSyncResponseDTO.getResponse();
                if (synList != null) {
                    SyncResponseDto syncResponseDto = synList.get(0);
                    syncStatus = syncResponseDto.getStatus();
                }
            }
            if (PacketGeneratorConstants.SUCCESS.equalsIgnoreCase(syncStatus)) {
                PacketReceiverResponseDTO packetReceiverResponseDTO;
                LinkedMultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
                map.add("file", contentsAsResource);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);
                HttpEntity<LinkedMultiValueMap<String, Object>> requestEntity = new HttpEntity<>(map, headers);

                String result = (String) restClientService.postApi(ApiName.PACKETRECEIVER, "", "", requestEntity,
                        String.class);
                if (result == null)
                    throw new RegBaseCheckedException(ErrorMessages.FAILED_TO_UPLOAD.getErrorCode(),
                            ErrorMessages.FAILED_TO_UPLOAD.getErrorMessage() + " Null response from packetRecever API");
                packetReceiverResponseDTO = gson.fromJson(result, PacketReceiverResponseDTO.class);
                if (packetReceiverResponseDTO.getErrors() != null && !packetReceiverResponseDTO.getErrors().isEmpty()) {
                    throw new RegBaseCheckedException(ErrorMessages.FAILED_TO_UPLOAD.getErrorCode(),
                            ErrorMessages.FAILED_TO_UPLOAD.getErrorMessage() + packetReceiverResponseDTO.getErrors());
                }
                response.setRegistartionId(registartionId);
                response.setStatus("packet has been created and uploaded");
                return response;
            } else {
                throw new RegBaseCheckedException(ErrorMessages.SYNC_FAILED.getErrorCode(),
                        ErrorMessages.SYNC_FAILED.getErrorMessage());
            }
        } catch (ApisResourceAccessException e) {
            logger.error(e.getStackTrace().toString());
            if (e.getCause() instanceof HttpClientErrorException) {
                e.printStackTrace();
                HttpClientErrorException httpClientException = (HttpClientErrorException) e.getCause();
                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage()
                                + httpClientException.getResponseBodyAsString());
            } else if (e.getCause() instanceof HttpServerErrorException) {
                HttpServerErrorException httpServerException = (HttpServerErrorException) e.getCause();
                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage()
                                + httpServerException.getResponseBodyAsString());
            } else {

                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage() + e.getMessage(), e);
            }
        }
    }

    private RegSyncResponseDTO packetSync(String regId, String regType, byte[] enryptedUinZipFile, String creationTime)
            throws RegBaseCheckedException {
        RegSyncResponseDTO regSyncResponseDTO = null;
        try {
            RegistrationSyncRequestDTO registrationSyncRequestDTO = new RegistrationSyncRequestDTO();
            List<SyncRegistrationDto> syncDtoList = new ArrayList<>();
            SyncRegistrationDto syncDto = new SyncRegistrationDto();

            // Calculate HashSequense for the enryptedUinZipFile file
            HMACUtils.update(enryptedUinZipFile);
            String hashSequence = HMACUtils.digestAsPlainText(HMACUtils.updatedHash());

            // Prepare RegistrationSyncRequestDTO
            registrationSyncRequestDTO.setId(environment.getProperty(PacketGeneratorConstants.REG_SYNC_SERVICE_ID));
            registrationSyncRequestDTO
                    .setVersion(environment.getProperty(PacketGeneratorConstants.REG_SYNC_APPLICATION_VERSION));
            registrationSyncRequestDTO.setRequesttime(DateUtils
                    .getUTCCurrentDateTimeString(environment.getProperty(PacketGeneratorConstants.DATETIME_PATTERN)));

            syncDto.setLangCode("eng");
            syncDto.setRegistrationId(regId);
            syncDto.setSyncType(regType);
            syncDto.setPacketHashValue(hashSequence);
            syncDto.setPacketSize(BigInteger.valueOf(enryptedUinZipFile.length));
            syncDto.setSupervisorStatus(SupervisorStatus.APPROVED.toString());
            syncDto.setSupervisorComment(PacketGeneratorConstants.SYNCSTATUSCOMMENT);

            syncDtoList.add(syncDto);
            registrationSyncRequestDTO.setRequest(syncDtoList);

            String requestObject = encryptUtil.encrypt(
                    JsonUtils.javaObjectToJsonString(registrationSyncRequestDTO).getBytes(), regId, creationTime);

            String centerId = regId.substring(0, centerIdLength);
            String machineId = regId.substring(centerIdLength, machineIdLength);
            String refId = centerId + "_" + machineId;

            LinkedMultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
            headers.add("Content-Type", MediaType.APPLICATION_JSON_VALUE);
            headers.add("Center-Machine-RefId", refId);
            headers.add("timestamp", creationTime);

            HttpEntity<Object> requestEntity = new HttpEntity<>(javaObjectToJsonString(requestObject), headers);
            String response = (String) restClientService.postApi(ApiName.SYNCSERVICE, "", "", requestEntity,
                    String.class, MediaType.APPLICATION_JSON);
            regSyncResponseDTO = new Gson().fromJson(response, RegSyncResponseDTO.class);

        } catch (ApisResourceAccessException e) {
            e.printStackTrace();
            if (e.getCause() instanceof HttpClientErrorException) {
                HttpClientErrorException httpClientException = (HttpClientErrorException) e.getCause();
                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage()
                                + httpClientException.getResponseBodyAsString());
            } else if (e.getCause() instanceof HttpServerErrorException) {
                HttpServerErrorException httpServerException = (HttpServerErrorException) e.getCause();
                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage()
                                + httpServerException.getResponseBodyAsString());
            } else {

                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage() + e.getMessage(), e);
            }

        } catch (InvalidKeySpecException | NoSuchAlgorithmException | IOException e) {
            logger.error(e.getStackTrace().toString());
            throw new RegBaseCheckedException(ErrorMessages.ENCRYPTION_EXCEPTION.getErrorCode(),
                    ErrorMessages.ENCRYPTION_EXCEPTION.getErrorMessage() + e.getMessage(), e);
        } catch (JsonProcessingException e) {
            logger.error(e.getStackTrace().toString());
            throw new RegBaseCheckedException(ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorCode(),
                    ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorMessage() + e.getMessage(), e);
        }
        return regSyncResponseDTO;
    }

    private byte[] encryptPacket(byte[] dataToEncrypt, String regId, String creationTime)
            throws RegBaseCheckedException {
        try {
            return encryptUtil.encrypt(dataToEncrypt, regId, creationTime).getBytes();
        } catch (ApisResourceAccessException e) {
            e.printStackTrace();
            if (e.getCause() instanceof HttpClientErrorException) {
                HttpClientErrorException httpClientException = (HttpClientErrorException) e.getCause();
                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage()
                                + httpClientException.getResponseBodyAsString());
            } else if (e.getCause() instanceof HttpServerErrorException) {
                HttpServerErrorException httpServerException = (HttpServerErrorException) e.getCause();
                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage()
                                + httpServerException.getResponseBodyAsString());
            } else {

                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage() + e.getMessage(), e);
            }

        } catch (InvalidKeySpecException | NoSuchAlgorithmException | IOException e) {
            logger.error(e.getStackTrace().toString());
            throw new RegBaseCheckedException(ErrorMessages.ENCRYPTION_EXCEPTION.getErrorCode(),
                    ErrorMessages.ENCRYPTION_EXCEPTION.getErrorMessage() + e.getMessage(), e);
        }
    }

    public byte[] generateHashSequence(List<String> hashSequenceFiles, Map<String, DocumentDetails> docsInfo)
            throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        for (String packetHashFile : hashSequenceFiles) {
            byte[] fileByte = docsInfo.get(packetHashFile).getDocValue();
            outputStream.write(fileByte);
        }
        byte[] dataByte = HMACUtils.generateHash(outputStream.toByteArray());
        return HMACUtils.digestAsPlainText(dataByte).getBytes();
    }

    private Map<String, DocumentDetails> getAllDocsFromResourceAsMap(Map<String, DocumentDetails> docsInfo)
            throws RegBaseCheckedException, IOException {
        listfiles(docsInfo);
        return docsInfo;
    }

    private void listfiles(Map<String, DocumentDetails> docsInfo) throws RegBaseCheckedException, IOException {
        List<String> packetfileList = new ArrayList<>();

        packetfileList.add("NEW/packet_data_hash.txt");
        packetfileList.add("NEW/audit.json");
        packetfileList.add("NEW/packet_meta_info.json");
        packetfileList.add("NEW/packet_osi_hash.txt");
        packetfileList.add("NEW/Biometric/applicant_bio_CBEFF.xml");
        packetfileList.add("NEW/Demographic/ID.json");
        packetfileList.add("NEW/Demographic/POA_CNIE_card.jpg");
        packetfileList.add("NEW/Demographic/POI_CNIE_card.jpg");
        packetfileList.add("NEW/Demographic/POR_Passport.jpg");
        packetfileList.add("NEW/Demographic/POE_Certification_of_Exception.jpg");

        for (String filename : packetfileList) {
            Resource resource = new ClassPathResource(filename);
            InputStream input = resource.getInputStream();
            addDoc(input, filename, docsInfo);
        }
    }

    private void addDoc(InputStream inputStream, String fname, Map<String, DocumentDetails> docsInfo) throws RegBaseCheckedException {
        File file = new File(fname);
        DocumentDetails docDetails = new DocumentDetails();
        try {
            docDetails.setDocExtension(FilenameUtils.getExtension(file.getName()));
            docDetails.setDocName(file.getName());
            if (fname.contains(DocumentType.DEMOGRAPHIC.toString())) {
                docDetails.setDocType(DocumentType.DEMOGRAPHIC);
            } else if (fname.contains(DocumentType.BIOMETRIC.toString())) {
                docDetails.setDocType(DocumentType.BIOMETRIC);
            } else {
                docDetails.setDocType(DocumentType.NONE);
            }

            byte[] bFile = IOUtils.toByteArray(inputStream);

            docDetails.setDocValue(bFile);
            docsInfo.put(FilenameUtils.removeExtension(file.getName()), docDetails);
        } catch (IOException e) {
            logger.error(e.getStackTrace().toString());
            e.printStackTrace();
            throw new RegBaseCheckedException(ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorCode(),
                    ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorMessage() + e.getMessage(), e);
        }

    }

    private Map<String, Object> getIdentityRequestDtoMap(Request baseReq) {
        Map<String, Object> map = new HashMap<>();
        PacketRequestDto dto = baseReq.getRequest();
        map.put("fullName", dto.getFirstName() + " " + dto.getLastName());
        map.put("gender", dto.getGender());
        map.put("dateOfBirth", dto.getDateOfBirth());
        map.put("age", dto.getAge());
        map.put("phone", dto.getPhone());
        map.put("email", dto.getEmail());
        map.put("addressLine1", dto.getAddressLine1());
        map.put("addressLine2", dto.getAddressLine2());
        map.put("addressLine3", dto.getAddressLine3());
        return map;
    }

    private String generateRegistrationId(String centerId, String machineId) throws RegBaseCheckedException {
        List<String> pathsegments = new ArrayList<>();
        pathsegments.add(centerId);
        pathsegments.add(machineId);
        String rid = null;
        ResponseWrapper<?> responseWrapper;
        JSONObject ridJson;
        ObjectMapper mapper = new ObjectMapper();
        try {

            responseWrapper = (ResponseWrapper<?>) restClientService.getApi(ApiName.RIDGENERATION, pathsegments, "", "",
                    ResponseWrapper.class);
            if (responseWrapper.getErrors() == null) {
                ridJson = mapper.readValue(mapper.writeValueAsString(responseWrapper.getResponse()), JSONObject.class);

                rid = (String) ridJson.get("rid");

            } else {
                List<ErrorDTO> error = responseWrapper.getErrors();

                throw new RegBaseCheckedException(PlatformErrorMessages.RPR_PGS_REG_BASE_EXCEPTION,
                        error.get(0).getMessage(), new Throwable());
            }

        } catch (ApisResourceAccessException e) {
            e.printStackTrace();
            if (e.getCause() instanceof HttpClientErrorException) {
                HttpClientErrorException httpClientException = (HttpClientErrorException) e.getCause();
                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage()
                                + httpClientException.getResponseBodyAsString());
            } else if (e.getCause() instanceof HttpServerErrorException) {
                HttpServerErrorException httpServerException = (HttpServerErrorException) e.getCause();
                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage()
                                + httpServerException.getResponseBodyAsString());
            } else {

                throw new RegBaseCheckedException(ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorCode(),
                        ErrorMessages.API_RESOUCE_ACCESS_FAILED.getErrorMessage() + e.getMessage(), e);
            }

        } catch (IOException e) {
            logger.error(e.getStackTrace().toString());
            throw new RegBaseCheckedException(ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorCode(),
                    ErrorMessages.SYSTEM_EXCEPTION_OCCURED.getErrorMessage() + e.getMessage(), e);
        }
        return rid;
    }
}
