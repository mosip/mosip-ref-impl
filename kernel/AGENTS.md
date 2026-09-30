# kernel

`kernel-ref-parent` (`packaging=pom`). No `kernel-bom`. Child → that folder’s `AGENTS.md`. Pins in `pom.xml`.

```
kernel/
├── pom.xml  README.md  AGENTS.md
├── kernel-ref-idobjectvalidator/      IdObjectValidator     → AGENTS.md
├── kernel-smsserviceprovider-msg91/   SMS SPI (MSG91)       → AGENTS.md
└── kernel-virusscanner-clamav/        VirusScanner + ClamAV → AGENTS.md
```

```bash
mvn -f kernel/pom.xml -pl <module> clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```
