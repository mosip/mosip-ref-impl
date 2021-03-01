# Note: Use -Dfinger.device.subid=1 added to support fingerprint slab device. For single fingerprint auth that argument can be removed
java -Dida.request.captureFinger.deviceId=<finger.device.id> -Dida.request.captureIris.deviceId=<iris.device.id> -Dida.request.captureFace.deviceId=<face.device.id> -Dmosip.base.url=<ida-base-url> -DmispLicenseKey=<misp.license.key> -DpartnerId=<partner.id> -DpartnerApiKey=<partner.api.key> -Dfinger.device.subid=<finger.device.subid> -jar ./target/authentication-demo-ui-1.2.0-SNAPSHOT.jar

