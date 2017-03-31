# Notes on: Getting Started with Docker *(Work in Progress)*

We're going to look at getting started with Docker on a Mac. Here are some key concepts, code and command snippits, etc.


### Docker Types:
- Client: The containers we deploy live here.
- Machine: The Virtual Machine that runs on a non-linux environment. E.G., in our dev environment, such as Mac or Windows.
- Compose: This allows multiple containers to run at once, and talk to one another.


### Docker Toolbox vs Docker for Mac:

Docker Toolbox installs some Docker tools, AND VirtualBox.

Docker for Mac:
 - uses HyperKit *instead* of VirtualBox. It was introduced in Yosemite. For older OSX versions, use Docker Toolbox.
 - does not use docker-machine for provisioning, but manages it in the app itself.
 - (See more here)[https://docs.docker.com/docker-for-mac/docker-toolbox/#the-docker-for-mac-environment]



## Container vs Image vs Volume
An `image` is a **read only** set of files. They can't be changed, because they can be shared among multiple containers. A `Container` holds an image, and allows read/write. When a container is deleted, the data is lost. Enter the `Data Volume`. A `Volume` is a layer that can hold data, and persists even when a container is deleted. It can be shared across multipe containers.

Volumes are a symlink to the environment hosting that Docker. SO, it will be a mount point in linux's actual machine.

e.g. /var/www => /mnt/...



## Running Docker
## Docker Client
`docker` -- show all commands
`docker pull [image name]` -- Pull   down from docker hub.
`dock run [image name]` -- Run the image.
`docker images` -- List all images.
`docker ps` -- Show all running containers. (`docker ps -a` all, non-running)

`docker rmi [image id]` -- Remove image.
`docker rm [container id]` -- Remove container.
`docker rm -v [container id]` -- Remove the volume attached to this container.


## Run Commands

```
docker run -p 80:88 [container]
```
Run a container, on machine port 80, and container port 88.


```
docker run -p 80:8080 -v /var/www my_container
```
Run the my_container container, using a volume mounted to /var/www internally, mapped to some mount point on your machine. It will be a long, arbitrary location.


```
docker run -p 80:8080 -v $(pwd):/var/www my_container
```
Same as above, but `/var/www/` on the container links to the current directory where this command is run from.


```
docker run -w "/var/www" node npm start
```
Run node container, load up container inside /var/www, and run command npm start inside that directory upon startup.


```
docker inspect [container]
```
Show a list of mounts, including where a container mount to inside the container, and where it's mounting from outside the container (in the native environment, like your Mac)



## Ways to get Source Code Into a Container

1. Link a folder to your local machine using a volume.

2. Build a custom image


## Custom Container / Image


Commands:

 `From`  -- Create an image from an existing image, like a node.js base. From there, we can build on top.
 `Maintainer`
 `Run`  -- Commands to run, like npm install.
 `copy`  -- Copy code inot the container, like our source code.
 `entrypoint` -- Commands to run when this container is started, like node app.js, or something else. Think what happens when you click an .exe file.
 `workdir`  -- What folder we should set at entry.
 `Expose` -- Expose a port (default port the container will run internally with).
 `env`  -- variables for the container.
 `Volume`  -- Define the volume, and how it's started on our host system.


## Sample Dockerfile

```
FROM node:latest							// Base this image off the latest node image.
MAINTAINER Hi Dad

ENV 		NODE_ENV=production		// Environment variable
ENV 		PORT=3000							// Environment variable

COPY 		. /var/www						// Coppy current folder to /var/www within the container
WORK 		/var/www							// change to working directory

VOLUME ["/var/www"]           // Mount this container's volume on the host file system.

RUN 		npm installs					// Run npm install on our node application.

EXPOSE $PORT									// Set the main point as 3000 inside our container.

ENTRYPOINT ["npm", "start"]		// When we spin up our container, run npm start.
```

