# Notes on: Getting Started with Docker

Work in Progress
================


## Docker Types:
- Client: The containers we deploy live here.
- Machine: The Virtual Machine that runs on a non-linux environment. E.G., in our dev environment, such as Mac or Windows.
- Compose: This allows multiple containers to run at once, and talk to one another.


### Container vs Image vs Volume
An `image` is a **read only** set of files. They can't be changed, because they can be shared among multiple containers. A `Container` holds an image, and allows read/write. When a container is deleted, the data is lost. Enter the `Data Volume`. A `Volume` is a layer that can hold data, and persists even when a container is deleted. It can be shared across multipe containers.

Volumes are a symlink to the environment hosting that Docker. SO, it will be a mount point in linux's actual machine.

e.g. /var/www => /mnt/... 


### Docker Toolbox vs Docker for Mac:

Docker Toolbox installs some Docker tools, AND VirtualBox.

Docker for Mac:
 - uses HyperKit *instead* of VirtualBox. It was introduced in Yosemite. For older OSX versions, use Docker Toolbox.
 - does not use docker-machine for provisioning, but manages it in the app itself.
 - (See more here)[https://docs.docker.com/docker-for-mac/docker-toolbox/#the-docker-for-mac-environment]



## Docker Client
`docker` -- show all commands
`docker pull [image name]` -- Pull   down from docker hub.
`dock run [image name]` -- Run the image.
`docker images` -- List all images.
`docker ps` -- Show all running containers. (`docker ps -a` all, non-running)

`docker rmi [image id]` -- Remove image.
`docker rm [container id]` -- Remove container.



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