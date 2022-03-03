## kernel-smsserviceprovider-msg91

 [Background & Design]()

 **Implementation**
This service is provided as a reference implementation so the adopters could change this code to support their respective service provider.

```
io.mosip.kernel.core.notification.spi.SMSServiceProvider

```
The above interface is implemented in this service. Adopters are expected to be compliant to the interface  and add their implementation in the SMSServiceProviderImpl.java or create equivalent impl.

Its expected that the adopters do not change the controller and the REST api.

 [API Documentation ]
 
 ```
 mvn javadoc:javadoc

 ```

**Properties to be added in Kernel component kernel-default.properties**

 ```

mosip.kernel.sms.enabled=true
mosip.kernel.sms.country.code=91
mosip.kernel.sms.number.length=10
mosip.kernel.sms.language=english
mosip.kernel.sms.gateway=gateway

 ```

 ```

 #-----------------------------VID Properties--------------------------------------
mosip.kernel.sms.enabled=true
mosip.kernel.sms.country.code=91
mosip.kernel.sms.number.length=10


#----------msg91 gateway---------------
mosip.kernel.sms.api=http://api.msg91.com/api/v2/sendsms
mosip.kernel.sms.authkey=<authkey>
mosip.kernel.sms.route=4
mosip.kernel.sms.sender=MOSMSG
mosip.kernel.sms.unicode=unicode

#-----fast2sms gateway----------
mosip.kernel.sms.api=https://www.fast2sms.com/dev/bulkV2
mosip.kernel.sms.authkey=<authkey>
mosip.kernel.sms.route=p
mosip.kernel.sms.sender=FSTSMS
mosip.kernel.sms.unicode=unicode

auth.server.admin.validate.url=<auth server validate url>

 ```
 
 **Maven Dependency**
 
 ```
 	<dependency>
			<groupId>io.mosip.kernel</groupId>
			<artifactId>kernel-smsserviceprovider-msg91</artifactId>
			<version>${version}</version>
		</dependency>

 ```
 



**Usage Sample:**

Autowired interface 

```
	@Autowired
	private VidValidator<String> vidValidatorImpl;
```
Call the method 

Example:
 
 ```
	 smsServiceProvider.sendSms(contactNumber, contentMessage);

```
	

 
