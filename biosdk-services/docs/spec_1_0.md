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
    "apiVersion": "0.9",
    "sdkVersion": "sample",
    "supportedModalities": [
      "FINGER",
      "FACE",
      "IRIS"
    ],
    "supportedMethods": {
      "EXTRACT": [
        "FINGER",
        "FACE",
        "IRIS"
      ],
      "QUALITY_CHECK": [
        "FINGER",
        "FACE",
        "IRIS"
      ],
      "MATCH": [
        "FINGER",
        "FACE",
        "IRIS"
      ]
    },
    "otherInfo": {},
    "productOwner": {
      "organization": "sample",
      "type": "sample"
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
  "sample": {
    "version": {
      "major": 1,
      "minor": 1
    },
    "cbeffversion": {
      "major": 1,
      "minor": 1
    },
    "birInfo": {
      "creator": null,
      "index": null,
      "payload": null,
      "integrity": null,
      "creationDate": null,
      "notValidBefore": null,
      "notValidAfter": null
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
          "creator": null,
          "index": null,
          "payload": null,
          "integrity": null,
          "creationDate": null,
          "notValidBefore": null,
          "notValidAfter": null
        },
        "bdbInfo": null,
        "bdb": null,
        "sb": null,
        "sbInfo": {
          "format": null
        },
        "others": null
      }
    ]
  },
  "modalitiesToCheck": [
    "FACE",
    "FINGER",
    "IRIS"
  ],
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
      },
      "sample": "sample"
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
  "sample": {
    "version": {
      "major": 1,
      "minor": 1
    },
    "cbeffversion": {
      "major": 1,
      "minor": 1
    },
    "birInfo": {
      "creator": null,
      "index": null,
      "payload": null,
      "integrity": null,
      "creationDate": null,
      "notValidBefore": null,
      "notValidAfter": null
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
          "creator": null,
          "index": null,
          "payload": null,
          "integrity": null,
          "creationDate": null,
          "notValidBefore": null,
          "notValidAfter": null
        },
        "bdbInfo": null,
        "bdb": null,
        "sb": null,
        "sbInfo": {
          "format": null
        },
        "others": null
      }
    ]
  },
  "gallery": [
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
        "creator": null,
        "index": null,
        "payload": null,
        "integrity": null,
        "creationDate": null,
        "notValidBefore": null,
        "notValidAfter": null
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
            "creator": null,
            "index": null,
            "payload": null,
            "integrity": null,
            "creationDate": null,
            "notValidBefore": null,
            "notValidAfter": null
          },
          "bdbInfo": null,
          "bdb": null,
          "sb": null,
          "sbInfo": {
            "format": null
          },
          "others": null
        }
      ]
    },
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
        "creator": null,
        "index": null,
        "payload": null,
        "integrity": null,
        "creationDate": null,
        "notValidBefore": null,
        "notValidAfter": null
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
            "creator": null,
            "index": null,
            "payload": null,
            "integrity": null,
            "creationDate": null,
            "notValidBefore": null,
            "notValidAfter": null
          },
          "bdbInfo": null,
          "bdb": null,
          "sb": null,
          "sbInfo": {
            "format": null
          },
          "others": null
        }
      ]
    }
  ],
  "modalitiesToMatch": [
    "FACE",
    "FINGER",
    "IRIS"
  ],
  "flags": {}
}
```

Response:
```json
{
  "version": "x.x.x",
  "responsetime": "2021-03-30T08:43:17.707Z",
  "response": [
    {
      "galleryIndex": 0,
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
          "match": "MATCHED",
          "errors": [],
          "analyticsInfo": {}
        }
      },
      "analyticsInfo": {}
    },
    {
      "galleryIndex": 1,
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
          "match": "MATCHED",
          "errors": [],
          "analyticsInfo": {}
        }
      },
      "analyticsInfo": {}
    }
  ],
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
  "sample": {
    "version": {
      "major": 1,
      "minor": 1
    },
    "cbeffversion": {
      "major": 1,
      "minor": 1
    },
    "birInfo": {
      "creator": null,
      "index": null,
      "payload": null,
      "integrity": null,
      "creationDate": null,
      "notValidBefore": null,
      "notValidAfter": null
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
          "creator": null,
          "index": null,
          "payload": null,
          "integrity": null,
          "creationDate": null,
          "notValidBefore": null,
          "notValidAfter": null
        },
        "bdbInfo": null,
        "bdb": null,
        "sb": null,
        "sbInfo": {
          "format": null
        },
        "others": null
      }
    ]
  },
  "modalitiesToExtract": [
    "FACE",
    "FINGER",
    "IRIS"
  ],
  "flags": {}
}
```

Response:
```json
{
  "version": "x.x.x",
  "responsetime": "2021-03-30T08:43:17.707Z",
  "response": {
    "version": {
      "major": 1,
      "minor": 1
    },
    "cbeffversion": {
      "major": 1,
      "minor": 1
    },
    "birInfo": {
      "creator": null,
      "index": null,
      "payload": null,
      "integrity": null,
      "creationDate": null,
      "notValidBefore": null,
      "notValidAfter": null
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
          "creator": null,
          "index": null,
          "payload": null,
          "integrity": null,
          "creationDate": null,
          "notValidBefore": null,
          "notValidAfter": null
        },
        "bdbInfo": null,
        "bdb": null,
        "sb": null,
        "sbInfo": {
          "format": null
        },
        "others": null
      }
    ]
  },
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
  "sample": {
    "version": {
      "major": 1,
      "minor": 1
    },
    "cbeffversion": {
      "major": 1,
      "minor": 1
    },
    "birInfo": {
      "creator": null,
      "index": null,
      "payload": null,
      "integrity": null,
      "creationDate": null,
      "notValidBefore": null,
      "notValidAfter": null
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
          "creator": null,
          "index": null,
          "payload": null,
          "integrity": null,
          "creationDate": null,
          "notValidBefore": null,
          "notValidAfter": null
        },
        "bdbInfo": null,
        "bdb": null,
        "sb": null,
        "sbInfo": {
          "format": null
        },
        "others": null
      }
    ]
  },
  "sourceFormat": "sample",
  "targetFormat": "sample",
  "sourceParams": {},
  "targetParams": {},
  "modalitiesToConvert": [
    "FACE",
    "FINGER",
    "IRIS"
  ]
}
```

Response:
```json
{
  "version": "x.x.x",
  "responsetime": "2021-03-30T08:43:17.707Z",
  "response": {
    "version": {
      "major": 1,
      "minor": 1
    },
    "cbeffversion": {
      "major": 1,
      "minor": 1
    },
    "birInfo": {
      "creator": null,
      "index": null,
      "payload": null,
      "integrity": null,
      "creationDate": null,
      "notValidBefore": null,
      "notValidAfter": null
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
          "creator": null,
          "index": null,
          "payload": null,
          "integrity": null,
          "creationDate": null,
          "notValidBefore": null,
          "notValidAfter": null
        },
        "bdbInfo": null,
        "bdb": null,
        "sb": null,
        "sbInfo": {
          "format": null
        },
        "others": null
      }
    ]
  },
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
  "sample": {
    "version": {
      "major": 1,
      "minor": 1
    },
    "cbeffversion": {
      "major": 1,
      "minor": 1
    },
    "birInfo": {
      "creator": null,
      "index": null,
      "payload": null,
      "integrity": null,
      "creationDate": null,
      "notValidBefore": null,
      "notValidAfter": null
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
          "creator": null,
          "index": null,
          "payload": null,
          "integrity": null,
          "creationDate": null,
          "notValidBefore": null,
          "notValidAfter": null
        },
        "bdbInfo": null,
        "bdb": null,
        "sb": null,
        "sbInfo": {
          "format": null
        },
        "others": null
      }
    ]
  },
  "modalitiesToSegment": [
    "FACE",
    "FINGER",
    "IRIS"
  ],
  "flags": {}
}
```

Response:
```json
{
  "version": "x.x.x",
  "responsetime": "2021-03-30T08:43:17.707Z",
  "response": {
    "version": {
      "major": 1,
      "minor": 1
    },
    "cbeffversion": {
      "major": 1,
      "minor": 1
    },
    "birInfo": {
      "creator": null,
      "index": null,
      "payload": null,
      "integrity": null,
      "creationDate": null,
      "notValidBefore": null,
      "notValidAfter": null
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
          "creator": null,
          "index": null,
          "payload": null,
          "integrity": null,
          "creationDate": null,
          "notValidBefore": null,
          "notValidAfter": null
        },
        "bdbInfo": null,
        "bdb": null,
        "sb": null,
        "sbInfo": {
          "format": null
        },
        "others": null
      }
    ]
  },
  "errors": null
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
