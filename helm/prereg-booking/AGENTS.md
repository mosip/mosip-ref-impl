# helm/prereg-booking

Chart for booking image. GC/encoding flags = `values.yaml` `additionalResources.javaOpts` → `JDK_JAVA_OPTIONS` (not Dockerfile).

```
helm/prereg-booking/
├── Chart.yaml  values.yaml  README.md  AGENTS.md
└── templates/
    ├── deployment.yaml     # JDK_JAVA_OPTIONS from javaOpts
    ├── service.yaml
    ├── serviceaccount.yaml
    ├── servicemonitor.yaml
    └── virtualservice.yaml
```
