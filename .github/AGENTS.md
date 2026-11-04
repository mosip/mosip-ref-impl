# .github

Do not glob. Never read `keys/`.

```
.github/
├── AGENTS.md
├── workflows/
│   ├── push-trigger.yml           # kattu@master-java21
│   ├── chart-lint-publish.yml
│   └── use-pr-linker.yml
└── keys/                          # GPG — never read/edit/commit
```

`push-trigger.yml`: Maven at aggregator (`kernel/`, `registration-processor/`). Docker = child paths. OSSRH skip `master`+PR. Regproc Docker artifact `registration-processor`. Booking service is not in this repo (mosip/pre-registration).
