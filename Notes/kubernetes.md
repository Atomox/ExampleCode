# Kubernetes && Minikube

## Setup local Kubernetes

Setup the CMD Line Tool: kubectl

Use Minikube. Setup instructions here: https://kubernetes.io/docs/getting-started-guides/minikube



## Kubectl
- `kubectl get`
list resources
- `kubectl describe`
Show detailed info about a resource.
- `kubectl logs`
Print the logs from a container in a pod.
- `kubectl exec`
Execute a command on a container in the pod.
- `kubectl cluster-info`
- `kubectl cluster-info dump`

### Context
`mubectl` relies on a context. Always make sure you've set it, and that it's right:
```
# Set context
kubectl config use-context minikube`

# Confirm current context
kubectl config current-context
```


## Commands for Hello World

### Machine Spin-up
See what's running, including master, dashboard, monitoring, heapster, etc.
- `kubectl cluster-info`
- `kubectl cluster-info dump`
- `minikube start`

### Confirm Minikube is running:
- `minikube status`

### Get a container, and spin it up
- `kubectl run hello-minikube --image=gcr.io/google_containers/echoserver:1.4 --port=8080`
- `kubectl expose deployment hello-minikube --type=NodePort`

### Find the existing Pods, then hit them.
- `kubectl get pod`
- `curl $(minikube service hello-minikube --url)`
  - `minikube service [service-name] -- url`

### Cleanup
- `kubectl delete deployment hello-minikube`
- `minikube stop`


## Deployments

### Nodes
- `kubectl get nodes`
Show all nodes that can be used to host apps.

Every Kubernetes Node runs at least:

- Kubelet, a process responsible for communication between the Kubernetes Master and the Nodes; it manages the Pods and the containers running on a machine.
- A container runtime (like Docker, rkt) responsible for pulling the container image from a registry, unpacking the container, and running the application.


### Run

- `kubectl run kubernetes-bootcamp --image=docker.io/jocatalin/kubernetes-bootcamp:v1 --port=8080`

1. Look for a node, 2. schedule the add to run on it, and 3. Configured the cluster to reschedule the instance of a new Node when needed

- `kubectl get deployments`
Show all deployments


### Proxy
Pods that are running inside Kubernetes are running on a private, isolated network. By default, they are visible from other pods and services within the same kubernetes cluster, **but not outside that network.** When we use `kubectl`, we're interacting through an API endpoint to communicate with our application.


- Expose the communications from the node into the cluster with a `proxy`:

The kubectl command can create a proxy that will forward communications into the cluster-wide, private network. The proxy can be terminated by pressing control-C and won't show any output while its running.

The proxy enables direct access to the API from these terminals.

### Get the POD name, then use it to curl the API of our pod

```
# Store the name from the config into a BASH variable
export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
echo Name of the Pod: $POD_NAME

# Reference that name via the variable above, and hit the root of that API.
curl http://localhost:8001/api/v1/proxy/namespaces/default/pods/$POD_NAME/
```

### Logs
`kubect logs [name_of_pod]`


### Exec
`kubectl exec [name_of_pod] env`

#### Start BASH on the container:
```kubectl exec -ti $POD_NAME bash```



## Docker

### Step-by-Step from Docker to Kubernetes Container

1. Setup a Dockerfile
```
FROM node:version
EXPOSE some_port
COPY _files_into_container_
CMD node app.js
```

Then return to bash to get things going.
```
# Expose docker env variables to Minikube.
$ eval $(minikube docker-env)

# Build it with a name and version.
$ docker buid -t my-app-name:my-version

# Ship it.
kubectl run my-app-name --image=my-app-name:version --port=my_port

# Confirm it worked (deployment and pod)
kubectl get deployments

kubectl get pods

# Expose it type would be LoadBalancer in a real environment.
kubectl expose deployment name-from-deployment-list --type=NodePort

# Confirm the services.
kubectl services

# Confirm our nodejs service is running.
curl $(minikube service hell-node-js --url)
```

If you wanna clean up after playtime...
```
# Delete the deployment and service.
kubectl delete deployment, service hello-nodejs

# Confirm we're good.
kubectl get deployments,services

# Stop Minikube.
minikube stop
```
