## kernel-smsserviceprovider-msg91

[Background & Design]()

MOSIP has the capability of talking to any SMS Gateway provider as long as the provider supports REST APIs for communication.

 **Implementation**

This service is provided as a reference implementation so that MOSIP implementors can customize the SMS implementation to support their respective service providers.

```
io.mosip.kernel.core.notification.spi.SMSServiceProvider

```
This is a sample implementation of the SMSServiceProvider interface.  Depending upon the SMS Provider, the implementation code might change however the interface
remains as it is.  MOSIP implementors are expected to be compliant to this interface  and add their implementation in the SMSServiceProviderImpl.java.

**Properties to be added in Kernel component kernel-default.properties**

 ```
 #-----------------------------Generic Properties--------------------------------------
mosip.kernel.sms.country.code=91
mosip.kernel.sms.number.length=10
mosip.kernel.sms.language=english
mosip.kernel.sms.gateway=gateway


#----------msg91 gateway vendor-specific properties ---------------
mosip.kernel.sms.api=http://api.msg91.com/api/v2/sendsms
mosip.kernel.sms.authkey=<authkey>
mosip.kernel.sms.route=4
mosip.kernel.sms.sender=MOSMSG
mosip.kernel.sms.unicode=unicode


#-----fast2sms gateway vendor-specific properties ----------
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
