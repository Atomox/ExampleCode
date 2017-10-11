Some Bash Basics

## Install Stuff

### apt-get

`apt-get update`
`apt-get install [package]`


### brew (OSX)
`brew update`
`brew install [package]`


### Copy to a remote server:

`scp local_file user@remotehost:/path/to/target`

### User Stuff

Add user to a group
`sudo usermod -aG group_name user_name`

Add a user:
`useradd name`

Show all members of a group:

`cat /etc/group`

Show all users

`cat /etc/passwd`


### Symlinks

Create or update a symlink:
`ln -sf /path/to/file /path/to/symlink`


### Hit an website

Hit a website at port 80
`curl [url]:80`


### IP Routing

Show all routing tables:
`sudo iptables -t nat -L`

Redirect all `tcp` requests on `port 80` to `port 8000`:
`iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000`

Delete line '1' from the `PREROUTING` chain, in the `nat` table.
sudo iptables -t nat -D PREROUTING 1


### Permissions:

`chmod UGO file_or_path` - Change file permission, where xxx is 0-7 for User, Group, Other. -R for recursive, like an entire sub directory.

`chown` - Change owning user

`chgrp` - Change owning group


### Grep

Grep allows you to filter output to just the lines with your search term.
`some_command | grep 'search term'`


### Logs

Tail logs (and follow them)
`tail -f /path/to/log`



### PHP CLI Memory Limit
Other PHP-based CLI tools can use the PHP CLI, not normal PHP, so you may need to change the memory limit for the CLI.

Run
```
php --ini | grep 'memory_limit'
```
to see what the CLI limit is set to.

If it's too low, debian-based systems (like Ubuntu) look for `*.ini` files starting in: `/usr/local/etc/php`. Create a file there, and add:
```
memory_limit=512
```
Where 512 is the number of MB you wish to allocate.
