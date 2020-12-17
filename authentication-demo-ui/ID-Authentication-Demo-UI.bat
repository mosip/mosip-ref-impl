# Note: -Dfinger.device.subid=1 added to support fingerprint slab device. For single fingerprint auth that argument can be removed
java -Dida.request.captureFinger.deviceId=2 -Dida.request.captureIris.deviceId=1 -Dida.request.captureFace.deviceId=3 -Dmosip.base.url=https://qa2.mosip.net -DmispLicenseKey=BQN9arnVNTTOMnsP3SHWdS9pRiMrlc0jJKltNTegeCQqWwtfRU -DpartnerId=20001 -DpartnerApiKey=50993551 -Dfinger.device.subid=1 -jar ./target/authentication-demo-ui-1.2.0-SNAPSHOT.jar

