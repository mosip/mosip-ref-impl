# PreReg Booking

Helm chart for the **pre-registration-booking-service** image. Chart sources: `Chart.yaml`, `values.yaml`, `templates/` (Deployment, Service, ServiceAccount, ServiceMonitor, VirtualService). The Java service is not in this repo — see [mosip/pre-registration](https://github.com/mosip/pre-registration/tree/issue-1063-consolidate-pre-reg-services) (`issue-1063-consolidate-pre-reg-services`).

Sandbox cluster: [Sandbox Deployment Guide](https://docs.mosip.io/1.2.0/deploymentnew/v3-installation).

## Install

```console
kubectl create namespace prereg
helm repo add mosip https://mosip.github.io
helm -n prereg install my-release mosip/prereg-booking
```

Override image tag and config-server settings in `values.yaml` for your environment. The booking **service** is no longer in this repo; it lives in [mosip/pre-registration](https://github.com/mosip/pre-registration/tree/issue-1063-consolidate-pre-reg-services) (`issue-1063-consolidate-pre-reg-services`).

