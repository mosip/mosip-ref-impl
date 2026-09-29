# AGENTS.md

MOSIP **ref impls** (not core). Independent Maven modules. No root parent. Each top parents `spring-boot-starter-parent` **4.1.1**. No `kernel-bom`. Pins live in `pom.xml` only.

## Speed

1. **Do not glob / find / `ls`.** This tree + **one** nested `AGENTS.md` is the map.
2. Open **named files only**. Never scan `target/`, `.git/`, `.idea/`, `.sts4-cache/`, `node_modules/`, `*.class`, `*.jar`, `.github/keys/`.
3. Grep a known path. Do not repo-search. Do not put MOSIP versions in comments.

## Tree

```
mosip-ref-impl/
├── cache-provider-hazelcast/           PacketCacheProvider + health     → AGENTS.md
├── cache-provider-redis/               PacketCacheProvider Redis        → AGENTS.md
├── kernel/                             kernel-ref-parent (3 SPIs)       → AGENTS.md
│   ├── kernel-ref-idobjectvalidator/   IdObjectValidator                → AGENTS.md
│   ├── kernel-smsserviceprovider-msg91/ SMS SPI (MSG91)                 → AGENTS.md
│   └── kernel-virusscanner-clamav/     VirusScanner + ClamAV            → AGENTS.md
├── keycloak/                           login FTL overlay                → AGENTS.md
├── pre-registration-booking-service/   /appointment/**                  → AGENTS.md
├── registration-processor/             registration-processor-ref-parent → AGENTS.md
│   ├── registration-processor-external-stage/                           → AGENTS.md
│   └── registration-processor-external-integration-service/             → AGENTS.md
├── helm/prereg-booking/                k8s; javaOpts → JDK_JAVA_OPTIONS → AGENTS.md
├── licenses/                           third-party texts + NOTICE
├── .github/                            CI + GPG keys                    → AGENTS.md
├── deploy.sh  LICENSE  NOTICE  README.md
```

Angular UIs are other repos. No TestNG report archive.

## Build (cwd = module; aggregators = `kernel/`, `registration-processor/`)

```bash
mvn clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
mvn test -Dtest=ClassName[#method]
mvn clean verify
```

## Facts

- Swap impl = swap JAR. Kernel SPIs: `META-INF/spring.factories`. Services: Boot 4.1.1. No `pre-processor`. Logging = `kernel-core`, not `kernel-logger-logback`.
- Jackson 2 = `spring-boot-jackson2`. Spring Cloud **2025.1.3**. `git-commit-id` → `service-git.properties`.
- Config: `mosip/mosip-config` (`application-default`, `pre-registration-default`, `registration-processor-default`).
- Tests: JUnit 4 vintage + Mockito; `--add-opens` in poms; idobjectvalidator `--enable-preview`.
- Coverage: JaCoCo LINE **0.90** (`jacoco-check` = `sonar.coverage.exclusions`). Report: `target/site/jacoco/index.html`.
- Docker: no glowroot, no `iam_adapter_url` wget. Adapters in JAR. JVM flags from Helm `javaOpts`.
- CI: `.github/workflows/push-trigger.yml` → `mosip/kattu@master-java21`.
