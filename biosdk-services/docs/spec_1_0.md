# Biosdk Service spec. 1.0

In following APIs, sample request/ response format are given. For more details, please go to [Java API specs.](https://docs.mosip.io/platform/apis/biometric-sdk-api-specification#appendix-a-java-api-specifications). All the JSON structure in request and responses are derived from Java classes listed in the [Java API specs](https://docs.mosip.io/platform/apis/biometric-sdk-api-specification#appendix-a-java-api-specifications).

## APIs

### Status check

Relative URL: / 

Method: GET

Response: 
```text
Service is running... Tue Mar 30 08:35:39 UTC 2021
```

### Initialization

Relative URL: /init

Method: POST

Request:
```json
{
    "version": "<version of the services>",
    "request": "base64 encoded(initParams)"
}
```

initParams:
```json
{
    "parameter1": "val1",
    "parameter2": "val2"
}
```

Response:
```json
{
    "version": "1.0",
    "responsetime": "2021-03-30T08:43:17.707Z",
    "response": {
        "apiVersion": "API version",
        "sdkVersion": "SDK version",
        "supportedModalities": ["${list of supported modalities}"],
        "supportedMethods": ["${list of supported methods per modality}"],
        "otherInfo": {},
        "productOwner": {
            "organization": "Organisation name",
            "type": "organisation type"
        }
    },
    "errors": []
}
```

### check-quality

Relative URL: /check-quality

Method: POST

Request:
```json
{
    "version": "<version of the services>",
    "request": "base64 encoded(checkQualityBody)"
}
```

checkQualityBody:
```json
{
    "sample": "${BiometricRecord}",
    "modalitiesToCheck": ["${list of modalities to check}"],
    "flags": {}
}
```

Response:
```json
{
    "version": "x.x.x",
    "responsetime": "2021-03-30T08:43:17.707Z",
    "response": {
        "scores": {
            "Finger": {
                "score": 0.0,
                "errors": [],
                "analyticsInfo": {}
            },
            "Face": {
                "score": 0.0,
                "errors": [],
                "analyticsInfo": {}
            }
        },
        "analyticsInfo": {}
    },
    "errors": null
}
```

### match

Relative URL: /match

Method: POST

Request:
```json
{
    "version": "<version of the services>",
    "request": "base64 encoded(matchBody)"
}
```

matchBody:
```json
{
    "sample": "${BiometricRecord}",
    "gallery": ["${List of BiometricRecords}"],
    "modalitiesToMatch": ["${list of modalities to mach}"],
    "flags": {}
}
```

Response:
```json
{
    "version": "x.x.x",
    "responsetime": "2021-03-30T08:43:17.707Z",
    "response": "${list of MatchDecisions}",
    "errors": null
}
```

### extract-template

Relative URL: /extract-template

Method: POST

Request:
```json
{
    "version": "<version of the services>",
    "request": "base64 encoded(extractTemplateBody)"
}
```

extractTemplateBody:
```json
{
    "sample": "${BiometricRecord}",
    "modalitiesToExtract": ["${list of modalities to extract}"],
    "flags": {}
}
```

Response:
```json
{
    "version": "x.x.x",
    "responsetime": "2021-03-30T08:43:17.707Z",
    "response": "${BiometricRecord}",
    "errors": null
}
```

### convert-format

Relative URL: /convert-format

Method: POST

Request:
```json
{
    "version": "<version of the services>",
    "request": "base64 encoded(convertFormatBody)"
}
```

convertFormatBody:
```json
{
    "sample": "${BiometricRecord}",
    "sourceFormat": "sample",
    "targetFormat": "sample",
    "sourceParams": {},
    "targetParams": {},
    "modalitiesToConvert": ["${list of modalities to convert}"]
}
```

Response:
```json
{
    "version": "x.x.x",
    "responsetime": "2021-03-30T08:43:17.707Z",
    "response": "${BiometricRecord}",
    "errors": null
}
```

### segment

Relative URL: /segment

Method: POST

Request:
```json
{
    "version": "<version of the services>",
    "request": "base64 encoded(segmentBody)"
}
```

segmentBody:
```json
{
    "sample": "${BiometricRecord}",
    "modalitiesToSegment": ["${list of modalities to segment}"],
    "flags": {}
}
```

Response:
```json
{
    "version": "x.x.x",
    "responsetime": "2021-03-30T08:43:17.707Z",
    "response": "${BiometricRecord}",
    "errors": null
}
```

## Appendix
Below are sample JSON structure for the variables used in above APIs. For more info on possibles values of keys, refer [Java API specs](https://docs.mosip.io/platform/apis/biometric-sdk-api-specification#appendix-a-java-api-specifications).

BiometricRecord (sample):
```json
{
    "version": {
        "major": 1,
        "minor": 1
    },
    "cbeffversion": {
        "major": 1,
        "minor": 1
    },
    "birInfo": {
        "integrity": false
    },
    "segments": [
        {
            "version": {
                "major": 1,
                "minor": 1
            },
            "cbeffversion": {
                "major": 1,
                "minor": 1
            },
            "birInfo": {
                "integrity": false
            },
            "bdbInfo": {
                "format": {
                    "organization": "Mosip",
                    "type": "7"
                },
                "creationDate": "2021-06-27T13:40:06.211Z",
                "type": ["Finger"],
                "subtype": ["Right MiddleFinger"],
                "level": "Raw",
                "purpose": "Enroll",
                "quality": {
                    "algorithm": {
                        "organization": "HMAC",
                        "type": "SHA-256"
                    },
                    "score": 100
                }               
            },
            "bdb": "RklSAD..."
        }
    ]
}
```

MatchDecision (sample):
```json
{
    "galleryIndex": "gallery index",
    "decisions": {
        "FACE": {
            "match": "MATCHED",
            "errors": [],
            "analyticsInfo": {}
        },
        "FINGER": {
            "match": "MATCHED",
            "errors": [],
            "analyticsInfo": {}
        },
        "IRIS": {
            "match": "NOT_MATCHED",
            "errors": [],
            "analyticsInfo": {}
        }
    },
    "analyticsInfo": {}
}
```



## Security

### HTTPS
The service should be setup with the https. Only certificates signed by a CA will work.

Certificates generated by Letsencrypt can be used to do initial setup

## Error Messages

### Code: BIO_SDK_001

Msg: No Bio SDK service provider implementations found for given version

### Code: BIOSDK_LIB_EXCEPTION

Msg: Exception thrown by BioSDK library

Reasons: Exception raised by the third-party bioSDK library

### Code: INVALID_REQUEST_BODY

Msg: Unable to parse request body

Resons: Request body is not in correct format

### Code: UNCHECKED_EXCEPTION

Msg: UNCHECKED_EXCEPTION
