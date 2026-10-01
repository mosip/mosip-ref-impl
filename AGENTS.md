# AGENTS.md

Ref impls (not core). No root parent. Tops parent Boot **4.1.1**. No `kernel-bom`. Pins in `pom.xml` only. No versions in comments.

**Speed:** do not glob/`ls`. Read this tree + **one** nested `AGENTS.md`. Open named files only. Never scan `target/`, `.git/`, `.idea/`, `.sts4-cache/`, `node_modules/`, `*.class`, `*.jar`, `.github/keys/`. Grep a known path.

```
mosip-ref-impl/
├── cache-provider-hazelcast/            PacketCacheProvider + health      → AGENTS.md
├── cache-provider-redis/                PacketCacheProvider Redis         → AGENTS.md
├── kernel/                              kernel-ref-parent (3 SPIs)        → AGENTS.md
│   ├── kernel-ref-idobjectvalidator/    IdObjectValidator                 → AGENTS.md
│   ├── kernel-smsserviceprovider-msg91/ SMS SPI                           → AGENTS.md
│   └── kernel-virusscanner-clamav/      VirusScanner                      → AGENTS.md
├── keycloak/                            login FTL                         → AGENTS.md
├── pre-registration-booking-service/    /appointment/**  run-local     → AGENTS.md
├── registration-processor/              registration-processor-ref-parent → AGENTS.md
│   ├── registration-processor-external-stage/                 Vert.x → EIS  run-local → AGENTS.md
│   └── registration-processor-external-integration-service/   EIS stub REST run-local → AGENTS.md
├── helm/prereg-booking/                 javaOpts → JDK_JAVA_OPTIONS       → AGENTS.md
├── licenses/                            NOTICE texts
├── .github/                             CI; never read keys/              → AGENTS.md
├── deploy.sh  LICENSE  NOTICE  README.md
```

Angular UIs are other repos. Aggregators: `kernel/`, `registration-processor/`.

```bash
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn test -Dtest=ClassName[#method]
mvn clean verify
```

Swap impl = swap JAR. SPIs: `spring.factories`. No `pre-processor`. Log via `kernel-core` (not `kernel-logger-logback`). Jackson 2 = `spring-boot-jackson2`. Cloud **2025.1.3**. Git → `service-git.properties`. Config: `mosip/mosip-config`. Tests: JUnit 4 + Mockito; idobjectvalidator `--enable-preview`. JaCoCo LINE **0.90**. Docker: no glowroot/wget; adapters in JAR; JVM from Helm. CI: `push-trigger.yml` → `kattu@master-java21`.
