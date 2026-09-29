# kernel

`kernel-ref-parent` (`packaging=pom`). Boot 4.1.1. No `kernel-bom`. Child → that folder’s `AGENTS.md`.

```
kernel/
├── pom.xml  AGENTS.md
├── kernel-ref-idobjectvalidator/      IdObjectValidator     → AGENTS.md
├── kernel-smsserviceprovider-msg91/   SMS SPI (MSG91)       → AGENTS.md
└── kernel-virusscanner-clamav/        VirusScanner + ClamAV → AGENTS.md
```

```bash
mvn -f kernel/pom.xml -pl <module> clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```
