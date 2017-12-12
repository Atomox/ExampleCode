# Kubernetes && Minikube

## Big Picture

A K8s cluster has Masters and Nodes. The Masters manage and delegate, and the nodes do all the work, watch for changes, and report back.

We define our app in a deployment.yml file, which we give to as Master. The Master, deploys the app across some nodes, which run the app.

### Master
The master contains a few things we care about, such as:
- **API Gateway -- This controls the in/out to the app, via API endpoints using JSON.**
- Cluster Store -- Uses ETCD (key/value store) to store the state of the cluster.
- Controller --
- Scheduler -- Constraints and resource management, etc.

Generally, what you need to know is that `kubectl` formats commands in JSON, and sends them to the API Server in this master, and then they are routed to Nodes.


### Nodes (Minions)

- **Kubelet** -- Main Kubernetes agent on the node. (Reports back to Master)
  - Exposes endpoint on `:10255` where it can be inspected.
    - `/spec` -- Gives you specs on the node.
    - `/healthz` -- Gives you health Info.
    - `/pods` -- Running pods.
  - Reports back to the Master when something fails. Takes no action to restart.
  - Watches the API Server on the Master.
- Container runtime
  - Usually **Docker**, but could be **rkt**. Pluggable.
  - Pulls images
  - Starts/stops containers (runs the containers, i.e. your app.)
- **Kube Proxy** -- Te network brains of the node.
  - **Gives a single IP to each Pod.**
  - Performs some Load Balancing between services within the node.
    - @TODO Flesh out what this means.


### Pods
Pods are the smallest unit of measure, and always wrap a container. While there can be more than one container per pod, there is always at least one pod for a container.
- A Pod is just a single namespace/wrapper to run a container inside of.
- If two containers are in a pod, they can use `localhost` to talk to one another.
- Same goes for mounter volumes.
- Pods are never listed as available until ALL ITEMS in the pod are ready.
- A pod always exists inside a single node.


### Services
A service sits in front of pods, and persists a front-facing IP address and DNS for the entire group of pods. Pods can spin up or go down, each with their own internal IP. We don't care, because the service sits in front, and routes all requests to and from these pods behind a single IP.
- Services grab and routes anything with the same tag.
- Use multiple tags for selectors. Only pods that have ALL tags will be selected as under that service.
  - E.G. Tag Pods: `Prod`, `B.E.`, `1.4`, and the service just `Prod` and `B.E.`, and it will include all Pods with those tags, regardless of version number.
- Only routes to healthy pods (must pass healthcheck -- remember that endpoint in the pods definition?)
- Session Affinity is available, but turned off by default.
- Can point outside of the cluster.
- Used TCP by default.


#### Proxy
Pods that are running inside Kubernetes are running on a private, isolated network. By default, they are visible from other pods and services within the same kubernetes cluster, **but not outside that network.** When we use `kubectl`, we're interacting through an API endpoint to communicate with our application.
- Expose the communications from the node into the cluster (i.e. the outside world) with a `proxy`.


### Labels
Basically tags. Tag Pods, Tag Services, basically a taxonomy you can use to identify and filter things.


### Deployments
Declare what a system should look like, and pass it to the master. We define what it should look like in a deployment, and hand it off to Kubernetes, which takes care of spinning up the system based upon our deployment file.
- Described as YML or JSON.
- Add Versioning, rolling updates, simple rollbacks.


# Kubernetes Commands

## Kubectl, The CLI
Use Kubectl to interact with Kubernetes on the command line. Kubectl takes commands, and interfaces with the API Gateway.

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


```
# Logs
kubect logs [name_of_pod]

# Exec a command
kubectl exec [name_of_pod] env

# Start BASH on the container
kubectl exec -ti $POD_NAME bash
```


# Local Kubernetes

## Setup local Kubernetes
Setup the CMD Line Tool: kubectl
Use Minikube. Setup instructions here: https://kubernetes.io/docs/getting-started-guides/minikube

### Context
`mubectl` relies on a context. Always make sure you've set it, and that it's right:
```
# Set context
kubectl config use-context minikube`

# Confirm current context
kubectl config current-context
```

**You can use `kubectl` for local and production, depending upon the set context. Always check your context before running commands.**

# Kubernetes on Google

# K8s on Aws
- needs `kops`, `AWS CLI`


# Where do we go from here?

- Learn Highly Available (H/A), like etcd.
- Learn other Kubernetes objects, like LoadBalancer Services, etc.


# Examples

## Create a Pod and Deploy it

### Basic `Pod` yml, pod.yml:
```
apiVersion: v1
kind: Pod
  labels:
    zone: prod
    version: v1
metadata:
  name: hello-pod
spec:
  containers:
    - name: hello-ctr
    image: hotsoup/docker-ci:latest
    ports:
    - containerPort: 8080
```


```
# Deploy the pod
kubectl create -f pod.yml

# Check the Status
kubectl get pods

# Show the details of the Pod, get any messages
kubectl describe pods
```

## Create `a bunch of pods`, and deploy them.
### Basic Replication yml:
```
apiVersion: v1
kind: ReplicationController
metadata:
  name: hello-rc
specs:
  replicas: 10
  selector:
    app: hello-world
  template:
    metadata:
      labels:
        app: hello-world
    spec:
      containers:
      - name: hello-pod
      image: hotsoup/docker-ci:latest
      ports:
      - containerPort: 8080
```
Then run the commands:
```
# Create from our config file (hence -f _file_name_)
kubectl create -f rc.yml

# Get all pods with 'rc' in the name.
kubectl get rc

# Describe all pods with 'rc' in the name.
kubectl describe rc

# Update the config, then apply the changes.
vi rc.yml
kubectl apply -f rc.yml
```


## Expose Our App via `Services`

### The basic way:
```
# Expose the service
kubectl expose rc hello-rc --name=hello-svc --target-port=8080 --type=NodePort

# Show the details
kubectl describe svc hello-svc

# Get the list
kubectl get svc

# Clean it up
kubectl delete svc hello-svc
```

### The Better way, with a YML:
```
apiVersion: v1
kind: Service
metadata:
  name: hello-svc
  labels:
    app: hello-world
spec:
  type: NodePort
  # Could also be:
  # ClusterIP (stable INTERNAL IP for inside the cluster)
  # LoadBalancer: (integrates NodePort with cloud-based load balancers)

  ports:
  - port: 8080
    nodePort: 30001
    protocol: TCP
  selector:
    app: hello-world
```

Then run the commands:
```
# Run it.
kubectl create -f svc.yml

# Now we can hit it:
curl 1.2.3.4:3001

# Clean up
kubectl delete rc hello-rc
```

## Create a Deployment

### The YML Way
```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: hello-deploy
spec:
  replicas: 10
  minReadySeconds: 10
  # Deployment strategy
  strategy:
    type: RollingUpdate
    rollingUpdate:
      # Take 1 pod down at a time
      maxUnavailable: 1
      # Never have more than 1 above our # of replicas (so 10 + 1: never more than 11)
      maxSurge: 1
  template:
    metadata:
      labels:
        app: hello-world
      spec:
        containers:
        - name: hello-pod
          image: hotsoup/docker-ci:latest
          ports:
          - containerPort: 8080
```
Now run it:
```
# Spin it up
kubectl create -f deploy.yml

# Check it out
kubectl describe deploy hello-deploy

# Show the Replica Sets
kubectl get rs

# Describe the Replica Set
kubectl describe rs
```

#### Update a deployment
```
# Apply the update. Use --record so that this command
# shows up in the deployment history.
kubectl apply -f deploy.yml --record

# Roll it out
kubectl rollout status deployment hello-deploy

# Check it out
kubectl get deploy hello-deploy

# Show the deployment history
kubectl rollout history deployment hello-deploy
```

#### Rollback a deployment
```
# Rollback to the first version.
kubectl rollout undo deployment hello-deploy --to-revision=1

# Show deployments
kubectl get deploy

# Watch the rollout
kubectl rollout status deployment hello-deploy
```


## Commands for Hello World on Minikube (locally)

### Machine Spin-up
```
# See what's running, including master, dashboard, monitoring, heapster, etc.
kubectl cluster-info
kubectl cluster-info dump
minikube start

# Confirm Minikube is running:
minikube status
```

### Get a container, and spin it up
```
# Run the contain, and then expose it to the outside world. (via a Port)
kubectl run hello-minikube --image=gcr.io/google_containers/echoserver:1.4 --port=8080
kubectl expose deployment hello-minikube --type=NodePort
```

### Find the existing Pods, then hit them.
```
# Show a list of pods.
kubectl get pod

# CURL the pod
curl $(minikube service hello-minikube --url)

# Get the url from the service layer.
minikube service [service-name] -- url
```

### Cleanup
```
# Delete the deployment and the pod.
kubectl delete deployment hello-minikube

# Stop the minikube node.
minikube stop
```


## Deployments

```
# Run a container with the provided image, version v1, on port 8080
kubectl run node-kubernetes-hello --image=docker.io/jocatalin/node-kubernetes-hello:v1 --port=8080

# Show all deployments
kubectl get deployments
```

### Get the POD name, then use it to curl the API of our pod

```
# Store the name from the config into a BASH variable
export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
echo Name of the Pod: $POD_NAME

# Reference that name via the variable above, and hit the root of that API.
curl http://localhost:8001/api/v1/proxy/namespaces/default/pods/$POD_NAME/
```





## Using Docker with K8s.

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
