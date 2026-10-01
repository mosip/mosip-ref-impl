# registration-processor

`registration-processor-ref-parent` (`packaging=pom`). No `pre-processor`. Child → that folder’s `AGENTS.md`. Pins in `pom.xml`. CI artifact: `registration-processor` (both Boot JARs).

```
registration-processor/
├── pom.xml  README.md  AGENTS.md
├── registration-processor-external-stage/                 Vert.x → EIS  run-local  → AGENTS.md
└── registration-processor-external-integration-service/   EIS stub REST  run-local → AGENTS.md
```

```bash
mvn -f registration-processor/pom.xml -pl <module> clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```
