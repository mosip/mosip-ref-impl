# ID-Authentication Demo UI Application
The demo Application for ID-Authentication, used to demonstrate the ID-Authentication services for some high level scenarios.

*Disclaimer: This is not a complete reference implementation for all ID-Authentication scenarios. This is used to demonstrate the authentication services for some high level scenarios only.*

Compatible MDS Version: v0.9.2

This includes demostration for below listed ID-Authentication scenarios:
1. Single Fingerprint Authentication
2. Multiple Fingerprint Authentication
3. Single Iris Authentication
4. Multiple Iris Authentication
5. Face Authentication
6. OTP Genaration + Authentication
7. Multi-Modality of Biometric Authentication - Fingerprint/Iris/Face
8. Multi-factor Authentication - OTP + Biometrics

### Launching the Application (Windows)
1. Update the `ID-Authentication-Demo-UI.bat` batch file as below:
```
java -Dfinger.deviceId=finger-device-id -Diris.deviceId=iris-device-id -Dface.deviceId=face-device-id -Dbase.url=http://qa.mosip.io -jar /path/to/authentication-demo-ui-x.x.x.jar
```

For example,
```
java -Dfinger.deviceId=1 -Diris.deviceId=2 -Dface.deviceId=3 -Dbase.url=http://qa.mosip.io -jar ./target/authentication-demo-ui-0.10.1.jar
```

2. Run the batch file.

