# .github

Do not glob. Do not read `keys/`.

```
.github/
├── AGENTS.md
├── workflows/
│   ├── push-trigger.yml          # Maven/Docker/OSSRH/Sonar — kattu@master-java21
│   ├── chart-lint-publish.yml    # helm
│   └── use-pr-linker.yml
└── keys/                         # GPG — never read/edit/commit
    ├── mosipgpgkey_pub.gpg
    └── mosipgpgkey_sec.gpg
```

`push-trigger.yml`: Maven `SERVICE_LOCATION` = aggregator for `kernel/` + `registration-processor/`. Docker still child paths. OSSRH skip on `master` + PRs.
