# registration-processor

`registration-processor-ref-parent` (`packaging=pom`). Boot 4.1.1. No `pre-processor`. Child → that folder’s `AGENTS.md`. Pins in this `pom.xml`.

```
registration-processor/
├── pom.xml  AGENTS.md
├── registration-processor-external-stage/                   Vert.x → EIS  → AGENTS.md
└── registration-processor-external-integration-service/     EIS stub REST → AGENTS.md
```

```bash
mvn -f registration-processor/pom.xml -pl <module> clean install -Dmaven.javadoc.skip=true -Dgpg.skip=true
```
