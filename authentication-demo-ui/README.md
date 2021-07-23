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


### Update the `ID-Authentication-Demo-UI.bat` batch file as below:
```
java -Dida.request.captureFinger.deviceId=finger-device-id -Dida.request.captureIris.deviceId=iris-device-id -Dida.request.captureFace.deviceId=face-device-id 
-Dfinger.device.subid=device-sub-id -DmispLicenseKey=misplkey -DpartnerId=partnerId -DpartnerApiKey=partnerApiKey -DpartnerOrg=partnerOrganization
-Dmosip.base.url=<mosip_base_url> -jar ./target/authentication-demo-ui-x.x.x.jar
```

#### Application Properties Explaination
Below properties can be given in VM Args or in application properties file.

* ida.request.captureFinger.deviceId = Finger Device Id
* ida.request.captureIris.deviceId = Iris Device Id
* ida.request.captureFace.deviceId = Face Device Id
* mispLicenseKey = MISP Licenese Key 
* partnerId = Partner Id
* partnerApiKey = Partner Api Key
* partnerOrg = Organization value to be used in the partner certificate auto-generation (invoked in case the partner certificate is not present). If not specified, the partner ID will be used as organization. Refer below section on partner keys and certificates.
* mosip.base.url = MOSIP hosted url
* finger.device.subid = Used to support fingerprint slab device

Note: Use `-Dfinger.device.subid=1` to support fingerprint slab device. For single fingerprint authentication that argument can be removed.

For example,
```
java -Dida.request.captureFinger.deviceId=1 -Dida.request.captureIris.deviceId=2 -Dida.request.captureFace.deviceId=2 -Dfinger.device.subid=1 -Dmosip.base.url=https://qa.mosip.io -DmispLicenseKey=UmjbDSra8pzOGd5rVtKekTb9D6VdvOQg4Kmw5TzBdw18mbzzME -DpartnerId=748757 -DpartnerApiKey=9418294 -DpartnerOrg=ABCBank -jar ./target/authentication-demo-ui-1.2.0.jar
```

### Partner Keys and Certificates
#### Existing Partner Key and Certificate
Partner private key and partner certificate will be looked up during the application in `<Currecnt_Working_Directory>/keys/` folder:
* Private key file name: `<partner_id>-partner.p12`
* Partner Certificate file name: `<partner_id>-partner.cer`

The partner certificate should have been signed by MOSIP Partner Management Service (PMS).

#### Partner Keys and Certificate generation for testing:
If the above mentioned partner private key is not available, the application will auto generate the private keys and certificates with Organization value mentioned in `partnerOrg` property. It will contain below entries under `<Currecnt_Working_Directory>/keys/` folder:

* CA Private key file name: `<partner_id>-ca.p12`
* CA Certificate file name: `<partner_id>-ca.cer`
* Intermediate Private key file name: `<partner_id>-inter.p12`
* Intermedtate Certificate file name: `<partner_id>-inter.cer`
* Partner Private key file name: `<partner_id>-partner.p12`
* Partner Certificate file name: `<partner_id>-partner.cer`

Steps to follow to make the generated partner certificate usable in the authentication demo UI application:

1. Create a partner with same partner ID and Organization name as in `partnerId` and `partnerOrg` properties.
2. Upload the CA Certificate and Intermedtate Certificate to MOSIP-PMS's "Upload CA Certificate" Endpoint.
3. Upload the Partner Certificate to MOSIP-PMS's "Upload Partner Certificate" Endpoint with the same `partnerId` and `partnerOrg` property values. This will return the new partner certificate signed by MOSIP PMS.
4. Replace `<partner_id>-partner.cer` file content with the new PMS signed partner certificate.


### Launching the application
* Run the batch file.


## Trouble Shooting
### Error: java.lang.SecurityException: JCE cannot authenticate the provider BC
 Please follow below steps.
1.  edit jre\lib\security\java.security
2.  add security.provider.10=org.bouncycastle.jce.provider.BouncyCastleProvider
3.  copy bc*.jar to jre\lib\ext

After this stop the application and re-run.
