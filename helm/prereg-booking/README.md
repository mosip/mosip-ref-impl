# PreReg Booking

Helm chart for the **pre-registration-booking-service** (Spring Boot 4.1.1 image). Chart sources: `Chart.yaml`, `values.yaml`, `templates/` (Deployment, Service, ServiceAccount, ServiceMonitor, VirtualService).

Sandbox cluster: [Sandbox Deployment Guide](https://docs.mosip.io/1.2.0/deploymentnew/v3-installation).

## Install

```console
kubectl create namespace prereg
helm repo add mosip https://mosip.github.io
helm -n prereg install my-release mosip/prereg-booking
```

Override image tag and config-server settings in `values.yaml` for your environment. Service README: [pre-registration-booking-service](../../pre-registration-booking-service/README.md).

