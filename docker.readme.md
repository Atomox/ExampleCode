# Docker Quick-Start Guide

## The High-Level

Docker is just like Vagrant, in that it is a virtual machine you can use to setup servers. Unlike Vagrant, Docker makes little packages (containers) around each major piece of the system, so they can be reused, and are independant of one another. So, instead of one package for the entire system, a LAMP stack would have Apache, PHP and MySQL in their own containers. We set up each separately, then use `docker-compose` to get them talking together. This is (mostly) easier, and maybe even more secure. Maybe.

In linux, these containers run natively, making them more usable in PRODuction environments, as well as on you developer machine. Since OSX Yosemite, they even run more natively, and don't require VirtualBox or Parallels. That means, they should be less of a hog on your system.

## Running Containers
You can also run single containers without talking to other systems, which can be good for 1-time calls, like compiling a Java application in Maven, or a 1-time SASS compile. While you can run multiple containers, and link them this way, it's dumb, messy, and each command is like a 500 character bash command. Instead, `Docker-Compose` has a format for a docker-compose.xml file, where you tell each container how to talk to one another.

In `docker-compose`, we define a single file, referencing each container we'll use in our system of containers, declare any volumes (symlinks) into the containers from our computer, and even network them together. Then, with one command: `docker-compose up`, we bring the entire system up.

## Differences to note
When we reference the containers by host/ip address, we use the container name *instead* of localhost. So, when your MySQL container is called `my_cool_mysql`, your PHP container would access it internally using: `my_cool_mysql` as the host. Externally, it would depend upon if you expose the port.

## Exposing ports
Ports are how applications expose themselves to be reached by the outside world. This is a Linux/Operating Systems concept, not a Docker one. Docker just allows you to declair where your containers are looking for their ports. You can tell Docker which ports to expose inside of the container, as well as where to expose them *outside* the container. By default, you probably only wanna expose them inside the container, since all containers inside the same docker-compose system will know where these ports are. By not exposing the outside port number, your system will be more secure, although it is handy for local development, like when you want to connect to your MySQL container with Sequel Pro.

## Docker-Compose.xml vs Dockerfile
There are two (types of) files you need to know about: `dockerfile` (one per container) and `docker-compose.xml` (the file that networks/maps your containers together).

Docker file is generally used when you're modifying an existing image, such as installing php, and adding plugins. If you're using an existing image, and not making changes, you won't need this (when using docker-compose).

We have already discussed Docker-Compose.xml, and that will reference the dockerfiles of each container you use.

## Building off an image
You don't have to build your containers from scratch. `Docker-hub.com` is a good place to find existing builds, including official packaged for just about any software you can imagine.

`FROM php:fpm` tells Docker that you're taking the PHP version FPM, and building ontop of that. So, all the work done to get the FPM PHP image working is pre-built for you. Think of it as the foundation, ready-to-use. If you like what's there, you don't have to go any further. You can spin up the container without building it, or adding any commands.

If you do want to build on top, add your commands to the docker file, and then build (compile) them to an image.

Here is a sample PHP container dockerfile:

```
# Start with the official FPM image from PHP's offocial repository.
FROM php:fpm

# Run some commands, install some extension on top of the image.
RUN apt-get update

    # Install with apt-get
    && apt-get install -y \
      imagemagick \
      libfreetype6-dev \
      libjpeg62-turbo-dev \
      libmcrypt-dev \
      libpng12-dev \
      libmemcached-dev \
      vim \
      rsyslog \

    # These install using a different command.
    && docker-php-ext-install -j$(nproc) \
      exif \
      gd \
      iconv \
      mbstring \
      mcrypt \
      mysqli \
      pdo \
      pdo_mysql \
      opcache \
    && pecl install \
      igbinary \
      memcached \
      xdebug \
```

This runs apt-get (an installer in Linux), and installs a bunch of PHP extensions on top of the PHP:FPM image.

This is in YAML format, so indentation matters. However, the commands themselves are just BASH commands. `apt-get update` just updates the command's database, and you could run this in the shell of any system which has apt-get installed.

This file is called `dockerfile-php`, but you can call it whatever you want, so long as your docker-compose.xml file references it properly.

## Docker-Compose.xml

```

# Used unless verison 1.
version: '2'

services:

  nginx:
    # Here is a default nginx image, without any custom container or dockerfile.

    # Alpine version is a much lighter/smaller image than others.
    # Use this whenever possible.
    image: nginx:1.10.3-alpine
    ports:
      - "80:80"

    # Map physical files to the internal containers.
    volumes:
      # I link a folder on the Mac to a folder inside the container.
      - ./public:/var/www/html

      # I link a single config file.
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro

  phpfpm:
      # We're building this, not using an existing image, since we have
      # to run scripts to install php plugins afterwards.
      container_name: phpfpm
      build:
        context: .
        dockerfile: dockerfile-php

      # PHP uses port 9000.
      ports:
        - "9000:9000"

      # Map physical files/directories of config files and code to the machine
      # from our host machine. This means it won't get lost on rebuild, but can be
      # changed as needed, and controlled externally.
      volumes:
          # Internal code lives here
          - ./public:/var/www/html

          # External codebase
          - ../alexa-d8/:/var/www/html/alexa-d8

          # Conf file lives here.
          - ./php/php-config.ini:/usr/local/etc/php/conf.d/php-config.ini

  mysql:
    # MariaDB is a MySQL distro that's commonly used.
    image: mariadb

    # Expose to port 3306 on the mac, and 3006 inside the container.
    ports:
      - "3306:3006"

    # Environment variables. At least include the root password.
    # These others set up a second user, although they don't seem
    # to work perfectly. Might need to set these manually in a build script.
    environment:
      MYSQL_ROOT_PASSWORD: my_cool_password

    volumes:
      # Store the database files externally, so we don't lose them every time
      # we spin up/stop this container.
      - ./mysql-data:/var/lib/mysql:rw
```

Some things to note:

The `nginx` container builds directly from an image. Nothing custom (except ports and volumes), we it has no Dockerfile. The `phpfpm` container, does has a custom container, so we reference that file, and the build directory where it is located.

Remember: If you run commands to install new things, you need a dockerfile. If you just want to expose a port, or mount a file/directory into the container, you don't need a custom container.

**All containers in the compose file can see eachother since Version 2** In version 1, a `-link` command was needed to tell the container what it could see. Now, a default network is set up internaly, and each container can reference the other via it's container name.


## Run this guy.
Now that we have a system, we can run it: `docker-compose build`, then `docker-compose up` to bring up all containers.

When you build the first time, Docker will need to download all images and required files. Any custom containers will need to be built/compiled, so the first run will take a while.

The next time, however, everything will be cached, so it goes up and down in seconds.

When bringing up the system, use `-d`, so it doesn't take over your command line. So, `docker-compose up -d` will bring it up. Make sure to check that nothing failed: `docker-compose ps` to check the status of each container in the system.

## Connecting to a container
Often, when debugging, and administering the system, you may need command-line access to the system's terminal. You can get in by running the following line:

`docker exec -it [CONTAINER_NAME] /bin/bash`

This tells it to run the `/bin/bash` command on the container. Packages without bash may need to run: `docker exec -it [CONTAINER_NAME] /bin/sh` instead, to get a shell.




# Appendix

# Installing Docker

## MAC:
## Docker-Machine, Docker for Mac, and Docker Toolbox

When building in linux, things will run natively. However, when building locally, like on Mac or Windows, you'll need a "Machine." For OSX, use Docer for Mac, if possible. You'll need this before you can start building.


### Docker Toolbox vs Docker for Mac:

Docker Toolbox installs some Docker tools, AND VirtualBox.

Docker for Mac:
 - uses HyperKit *instead* of VirtualBox. It was introduced in Yosemite. For older OSX versions, use Docker Toolbox.
 - does not use docker-machine for provisioning, but manages it in the app itself.
 - [See more here](https://docs.docker.com/docker-for-mac/docker-toolbox/#the-docker-for-mac-environment)


## Ubuntu:
 You need to install docker-compose on Ubuntu.

```
curl -L https://github.com/docker/compose/releases/download/1.12.0/docker-compose-$(uname -s)-$(uname -m) -o > /usr/local/bin/docker-compose
```

- `sudo -i` (switch to root for next two commands, if they don't work by default)
- `sudo chmod +x /usr/local/bin/docker-compose`
- `sudo chown [user_name] /usr/local/bin/docker-compose`
- Make docker-compose part of docker group: `sudo chgrp docker /usr/local/bin/docker-compose`
- Add user to the docker group, to avoid sudo: `sudo usermod -aG docker user_name`
  - These changes take affect only after you restart your shell.
  - Using sudo may seem cool, but puts you in a world of pain. This step is important, especially for web servers which create files in your volumes (symlinks).



# Docker Info & Commands
## Docker Types:
- Client: The containers we deploy live here.
- Machine: The Virtual Machine that runs on a non-linux environment. E.G., in our dev environment, such as Mac or Windows.
- Compose: This allows multiple containers to run at once, and talk to one another.

In general, you'll make a system using **`docker-compose`**, composed of several `docker` **containers**.



## Container vs Image vs Volume
An `image` is a **read only** set of files. They can't be changed, because they can be shared among multiple containers. A `Container` holds an image, and allows read/write on top. When a container is deleted, the data is lost. Enter the `Data Volume`. A `Volume` is a layer that can hold data, and persists even when a container is deleted. It can be shared across multipe containers. It is essentially a symlink between the container and a folder on your host machine (on your mac).

Volumes are a symlink to the environment hosting in Docker. SO, it will be a mount point in linux's actual machine.

e.g. /var/www => /mnt/...



# Running Docker
## Docker Client
This is *not* Docker-Compose. Docker client is for single container management.

- `docker` -- show all commands
- `docker pull [image name]` -- Pull down from docker hub.
- `dock run [image name]` -- Run the image.
- `docker images` -- List all images.
- `docker ps` -- Show all running containers. (`docker ps -a` all, non-running)

- `docker rmi [image id]` -- Remove image.
- `docker rm [container id]` -- Remove container.
- `docker rm -v [container id]` -- Remove the volume attached to this container.


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
Run node container, load up container inside /var/www, and run command npm start inside that directory upon startup. Use `-d` to run as a daemon (background).


```
docker inspect [container]
```
Show a list of data, including ip address, mounts (including where a container mount to inside the container, and where it's mounting from outside the container [in the native environment, like your Mac]), etc.



```
docker exec -it container_name /bin/bash
```

Connect to a container environment, where you can do internal things, like tail logs, conenct to mysql, checkout configuration lcoations, etc.




## Ways to get Source Code Into a Container

There are multiple way to get your code into a container, for use. Generally, you want to use default images whenever possible, and inject your code via a `volume`. This keeps things basic, untangled, and easy to upgrade.


1. Link a folder to your local machine using a volume.

2. Build a custom image




# Custom Container / Image


Commands:

- `From`  -- Create an image from an existing image, like a node.js base. From there, we can build on top.
- `Maintainer`
- `Run`  -- Commands to run, like npm install.
- `copy`  -- Copy code inot the container, like our source code.
- `entrypoint` -- Commands to run when this container is started, like node app.js, or something else. Think what happens when you click an .exe file.
- `workdir`  -- What folder we should set at entry.
- `Expose` -- Expose a port (default port the container will run internally with).
- `env`  -- variables for the container.
- `Volume`  -- Define the volume, and how it's started on our host system.


## Sample Dockerfile

```
FROM node:latest              // Base this image off the latest node image.
MAINTAINER Hi Dad

ENV     NODE_ENV=production   // Environment variable
ENV     PORT=3000             // Environment variable

COPY    . /var/www            // Coppy current folder to /var/www within the container
WORK    /var/www              // change to working directory

VOLUME ["/var/www"]           // Mount this container's volume on the host file system.

RUN     npm installs          // Run npm install on our node application.

EXPOSE $PORT                  // Set the main point as 3000 inside our container.

ENTRYPOINT ["npm", "start"]   // When we spin up our container, run npm start.
```


## Build a Custom Image

```
docker build -t (--tag) [username]/description .
```
Build your image from the dockerfile, with the  `-t` tag: `username/description`,
`.` using the current directory. username is the DockerHub account ID.




# Docker-Compose

Use Docker Compose to build a system of connected containers, with options to
link between them. Simple up/down commands to bring up the entire system.

As before, if images exist on docker-hub, you can use those. Otherwise,
you must `build` first.


Here is a Sample config:

**Docker-compose.yml**
```
#
# @TODO
#
#  This is a version 1 syntax, with a version: '2' tag at the top.
#  Need to update to syntax 2 or 3.


# Used unless verison 1.
version: '2'

nginx:
  # Alpine version is a much lighter/smaller image than others.
  # Use this whenever possible.
  image: nginx:1.10.3-alpine
  ports:
    - "80:80"

  # This allows nginx container to talk to phpfpm container.
  links:
    - phpfpm

  # Map physical files to the internal containers.
  volumes:
    # Internal code lives here
    - ./public:/var/www/html

    # Config
    - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro

    # External codebase
    - ../alexa-d8/:/var/www/html/alexa-d8

    # Logs
    - ./logs/nginx-error.log:/var/log/nginx/error.log
    - ./logs/nginx-access.log:/var/log/nginx/access.log

phpfpm:

    # We're building this, not using an existing image, since we have
    # to run scripts to install php plugins afterwards.
    container_name: phpfpm_extras

    # Build from the same directory where this file is.
    build: .

    # The docker file to build.
    dockerfile: dockerfile-php

    # PHP uses port 9000.
    ports:
        - "9000:9000"

    # Map physical files/directories of config files and code to the machine
    # from our host machine. This means it won't get lost on rebuild, but can be
    # changed as needed, and controlled externally.
    volumes:
        # Internal code lives here
        - ./public:/var/www/html

        # External codebase
        - ../alexa-d8/:/var/www/html/alexa-d8

        # Conf file lives here.
        - ./php/php-config.ini:/usr/local/etc/php/conf.d/php-config.ini

    # Allow us to talk to the mysql container.
    links:
        - mysql

mysql:
  # MariaDB is a MySQL distro that's commonly used.
  image: mariadb
  ports:
    - "3306:3006"

  # Environment variables. At least include the root password.
  # These others set up a second user, although they don't seem
  # to work perfectly. Might need to set these manually in a build script.
  environment:
    MYSQL_ROOT_PASSWORD: admin
    MYSQL_DATABASE: [some db name]
    MYSQL_USER: [some db user]
    MYSQL_PASSWORD: [some db password]

  volumes:
    # Store the database files externally, so we don't lose them every time
    # we spin up/stop this container.
    - ./mysql-data:/var/lib/mysql:rw

    # @TODO: Store an external MySQL config.
#    - ./mysql/conf.d:/etc/mysql/conf.d

```


Bring this up with the commands below, such as:

`docker-compose build`, then `docker-compose up -d`. 


## Commands

- `docker-compose build`
- `docker-compose build [service]`
- `docker-compose up` -- Bring up the system. Use `-d` to run in daemon mode.
- `docker-compose down` -- Remove all containers
- `docker-compose down --rmi all --volumes` -- Remove all images, volumes and containers
- `docker-compose logs` -- `docker-compose -f logs [service]` Tail logs.
- `docker-compose ps`
- `docker-compose stop`
- `docker-compose start`
- `docker-compose restart` -- Use this after you make any changes to config, as you would with apache restart.
- `docker-compose remove`


# Debugging


## Confirm docker service is running on Linux (Ubuntu):
`sudo systemctl status docker`


## "ERROR: Couldn't connect to Docker daemon at http+docker://localunixsocket - is it running?"

This old gem is generally a permission issue. Did you use `sudo`? If so, you've gone down a dark path, and will have to use it from now on. :/

Also, in Ubuntu (on Azure), I've found I have to use `sudo` for `docker-compose build` commands. After that, `up`-ing does not require it. However, this may be an artifact of a bad installation. Check `/var/lib/docker`, and see what the permissions look like. `./aufs` and `./containers` are both good things to note the permission of, as they can contain some of the build data.

Remember, when you install docker for the first time, to add your user to the `docker` group, as docker is installed to root, and gets that group. If you do, you should not need to use sudo for docker-compose commands. See the install instructions for docker for more details and specific commands.


## Corrupt Image zip files

Sometimes the zip files of the downloade dimages can be corrupted. Try removing the images with: `docker image` to show images, then `docker rmi [image_name]` to remove the image. This will force it to redownload the next time you build or up.

## Confirm MySQL Connection [link](https://severalnines.com/blog/mysql-docker-containers-understanding-basics)

If we need to confirm our containers are connected, we can log into a container with a presumed link, and check that it exists:

 1. `docker exec -it [container_name] /bin/bash`
 2. `cat /etc/hosts`
 3. Look for the linked service, such as MySQL.
 4. When you specify the link, like `--link mysql`, then `mysql` is your host name, for whatever application should require it.
 5. `mysql -uroot -p -h [hostname specified in link] -P [port, if not 3306]`
    - If you have mysql client installed on the PHP container, you can run this command to confirm it can connect to the mysql container.
    - If not, `app-get install mysql-client` first.


## Access MySQL via GUI in OSX.

If you want to access this outside of the compose echosystem, such as using sequel pro, you just need to expose the port to something static.

In your compose file, just make sure you have a port on the machine-side, like so:

```
  ports:
    - "3306:3306"
```
The left side number is the static port for your host machine.

Then connect normally, using:

host: 127.0.0.1
user: root
password: [whatever you typed in your compose file under: `environment: MYSQL_ROOT_PASSWORD:`]
Port: The port you exposed above.

 - If you get `MySQL said: Lost connection to MySQL server at 'reading initial communication packet', system error: 0`, make sure your ports are correct.
 - If you get a timeout or nothing at all, you probably have the wrong host.


## Configure SSL on Nginx

 - https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04

0. If using Docker, make a volume, and mount it to `/etc/nginx/ssl`.

1. Make a directory for ssl in nginx:
`sudo mkdir /etc/nginx/ssl`

2. Generate a key and a cert into the directory.
`sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt`


## Build a Java Project with Maven:

Switch to the directory with your POM file, and run:

```
 docker run -it --rm
    \ -v "$(pwd)":/opt/maven
    \ -w /opt/maven
    \ maven:3.5-jdk-8
    \ mvn clean install
```

Other articles:

 - http://geekyplatypus.com/packaging-and-serving-your-java-application-with-docker/


# Security
Know the vulnerabilities of Docker:
https://docs.docker.com/engine/security/security/#docker-daemon-attack-surface

 - Docker uses Unix sockets instead of http sockets for communication, to enforce linux permissions, and avoid CSF Attacks. Using 127.0.0.1 exposes your systems to vulnerabilities.
    - As a result, you should keep all your systems containerized in Docker, and not interact with the local machine for services, whenever possible.
  - 