# Kernel Virus Scanner — ClamAV

Reference `VirusScanner<Boolean, InputStream>` using [ClamAV](https://www.clamav.net/) via `xyz.capybara:clamav-client` **2.1.2**.

- **Artifact**: `io.mosip.kernel:kernel-virusscanner-clamav:1.4.1-SNAPSHOT`
- **Parent**: `kernel-ref-parent` (Boot **4.1.1**)
- **Logging**: `kernel-core` (commons)
- **Config**: `mosip.kernel.virus-scanner.host`, `mosip.kernel.virus-scanner.port`

To integrate another scanner, see [Integrating Virus Scanner](docs/av.md).

## Build

```text
cd kernel
mvn -pl kernel-virusscanner-clamav clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn -pl kernel-virusscanner-clamav clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio **0.90**. Scan API: `ScanResult.OK` / `VirusFound` (clamav-client 2.1.2).

## License

[Mozilla Public License 2.0](../../LICENSE) — [NOTICE](../../NOTICE)
