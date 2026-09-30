# kernel-virusscanner-clamav

Reference `VirusScanner<Boolean, InputStream>` using [ClamAV](https://www.clamav.net/).

Pins live in parent [`kernel/pom.xml`](../pom.xml). Module description lives in [`pom.xml`](pom.xml) — not here.

- **Artifact**: `io.mosip.kernel:kernel-virusscanner-clamav`
- **Impl**: `VirusScannerImpl` via `META-INF/spring.factories`
- **Config**: `mosip.kernel.virus-scanner.host`, `mosip.kernel.virus-scanner.port`

To integrate another scanner, see [Integrating Virus Scanner](docs/av.md).

## Build

```text
cd kernel
mvn -pl kernel-virusscanner-clamav clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn -pl kernel-virusscanner-clamav clean verify -Dmaven.javadoc.skip=true -Dgpg.skip=true
```

JaCoCo LINE covered ratio is gated in the parent `pom.xml`. Scan API: `ScanResult.OK` / `VirusFound`. Fat JAR from the assembly plugin (no classifier).

## License

[Mozilla Public License 2.0](../../LICENSE) — [NOTICE](../../NOTICE)
