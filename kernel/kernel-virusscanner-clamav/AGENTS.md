# kernel-virusscanner-clamav

`VirusScanner<Boolean,InputStream>` (`ScanResult.OK` / `VirusFound`). Auto-config: `spring.factories`. Pins in `kernel/pom.xml`.

```
kernel-virusscanner-clamav/
├── pom.xml  README.md  docs/av.md  AGENTS.md
└── src/
    ├── main/
    │   ├── java/io/mosip/kernel/virusscanner/clamav/
    │   │   ├── impl/VirusScannerImpl.java
    │   │   └── constant/VirusScannerErrorCodes.java
    │   └── resources/
    │       ├── META-INF/spring.factories
    │       └── logback.xml
    └── test/
        ├── java/.../clamav/test/
        │   ├── VirusScannerServiceTest.java
        │   └── VirusScannerExceptionTest.java
        └── resources/  application.properties  logback.xml  files/test1.docx
```
