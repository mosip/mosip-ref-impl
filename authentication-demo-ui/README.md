# ID-Authentication Demo UI Application
The demo Application for ID-Authentication, used to demonstrate the ID-Authentication services for some high level scenarios.

*Disclaimer: This is not a complete reference implementation for all ID-Authentication scenarios. This is used to demonstrate the authentication services for some high level scenarios only.*

Compatible MDS Version: v0.9.5

This includes demonstration for below listed ID-Authentication scenarios:
1. Single Fingerprint Authentication
2. Multiple Fingerprint Authentication
3. Single Iris Authentication
4. Multiple Iris Authentication
5. Face Authentication
6. OTP Genaration + Authentication
7. Multi-Modality of Biometric Authentication - Fingerprint/Iris/Face
8. Multi-factor Authentication - OTP + Biometrics

### Dependencies
App dependencies are mentioned below.For all Kernel services refer to [commons repo](https://github.com/mosip/commons)
* kernel-keygenerator-bouncycastle
* kernel-crypto-jce
* kernel-core

### Build
The following command should be run in the project to build the application - 
`mvn clean install -Dgpg.skip=true`


### Launching the Application (Windows)
1. Update the `ID-Authentication-Demo-UI.bat` batch file as below:
```
java -Dida.request.captureFinger.deviceId=finger-device-id -Dida.request.captureIris.deviceId=iris-device-id -Dida.request.captureFace.deviceId=face-device-id -DmispLicenseKey=misplkey -DpartnerId=partnerId -DpartnerApiKey=partnerApiKey
-Dmosip.base.url=https://qa.mosip.io -jar ./target/authentication-demo-ui-x.x.x.jar
```

### Keys Explaination
* ida.request.captureFinger.deviceId = Finger Device Id
* ida.request.captureIris.deviceId = Iris Device Id
* ida.request.captureFace.deviceId = Face Device Id
* mispLicenseKey = MISP Licenese Key 
* partnerId = Partner Id
* partnerApiKey = Partner Api Key
* mosip.base.url = MOSIP hosted url

For example,
```
java -Dida.request.captureFinger.deviceId=1 -Dida.request.captureIris.deviceId=2 -Dida.request.captureFace.deviceId=2 -Dmosip.base.url=https://qa.mosip.io -DmispLicenseKey=UmjbDSra8pzOGd5rVtKekTb9D6VdvOQg4Kmw5TzBdw18mbzzME -DpartnerId=748757 -DpartnerApiKey=9418294 -jar ./target/authentication-demo-ui-1.0.9.jar
```

2. Run the batch file.


## Trouble Shooting
### Error: java.lang.SecurityException: JCE cannot authenticate the provider BC
 Please follow below steps.
1.  edit jre\lib\security\java.security
2.  add security.provider.10=org.bouncycastle.jce.provider.BouncyCastleProvider
3.  copy bc*.jar to jre\lib\ext

After this stop the application and re-run.
