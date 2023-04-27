# kube-hook

[![Image Size](https://img.shields.io/docker/image-size/glenndehaan/kube-hook)](https://hub.docker.com/r/glenndehaan/kube-hook)

## What is it?
kube-hook is a powerful utility that allows users to perform deployment restarts on a Kubernetes cluster via an exposed API.
The utility is built on top of Kubernetes' powerful API, leveraging the platform's rich set of features to provide a seamless experience for users.

> The URL is protected with a simple Bearer token that can be set per namespace

## Development Installation
Make sure you have Node.JS 18.x installed then run the following commands in your terminal:
```text
npm ci
npm run dev
```

## Production Installation
kube-hook is available for your own kubernetes cluster.
Follow the guide below to install the app onto your own cluster:

> We recommend you to use an ingress controller like Traefik or Nginx in front of kube-hook

[Helm](https://helm.sh) must be installed to use the kube-hook chart.
Please refer to Helm's [documentation](https://helm.sh/docs) to get started.

Once Helm has been set up correctly, add the repo as follows:

```shell
helm repo add glenndehaan https://glenndehaan.github.io/charts
```

If you had already added this repo earlier, run `helm repo update` to retrieve the latest versions of the packages.
You can then run `helm search repo glenndehaan` to see the charts.

To install the kube-hook chart:
```shell
helm install kube-hook glenndehaan/kube-hook
```

You can refer to the `values.yaml` to customize the deployment:
https://github.com/glenndehaan/charts/blob/master/charts/kube-hook/values.yaml

## Usage
After setting up kube-hook you are able to access the following URL:
```text
http://ip-or-hostname/deployment/{namespace}
```
Replace {namespace} with a namespace running inside the kubernetes cluster.

Please note that you need to send the following authentication header with this request:
```text
Authorization: Bearer {token}
```
Replace {token} with the token required for the namespace. This token is set within the helm chart.

### Skip Deployment
Optionally you can skip certain deployment by providing the skip query parameter:
```text
http://ip-or-hostname/deployment/{namespace}?skip={deployment}
```
Replace {deployment} with a comma-seperated list of deployment names to skip.

## License

MIT
