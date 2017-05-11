# Nginx Configuration.

Let's talk about Nginx, it's advantages,usecases, and some configuration tips for various situations. We may be using it for a simple server for static content, a dynamic router, or even a load balancer.

Before we begin, let's talk about it's relation to Apache.


## Apache -or- Nginx?

For year's, I've been using Apache without thinking. It's what my boss chose, and I went along with it. Local development always was a LAMP stack, until I started looking into Dockerizing things. Suddenly, everything was about Nginx.

So, which one's better? When is it better? Why, and how do we use them?

# Apache

It's been around longer, and has become the default in many spaces. It uses modules, so plugging in rewrite rules, php processing, authentication, etc, is plug and play. It is persistant, so it sees a process through to the end, and handles everything internally, using said module system. Modules mean everything's in-house, and there is less to manage external to Apache.

This makes it easier to manage, but it has a heavier foot print, as modules run *all the time, for every process.*

# Nginx

It's newer, and was built in the same mind as Javascript: asychroniously. Nginx does the bare minimum, and passes things off to external processes, like phpfpm, or node. This means that it's fast: It acts as more of a router than a complete solution. It does one thing well. Get the ball, pass the ball. It's constantly ready for the next thing, so it's fast.

Because everything is external, it's more adaptable for different use-cases, but it's generally not a complete solution. You have to setup your language processor of choice yourself. This means more configuration, and more moving pieces in the system. It also means that only a file that needs processing gets processing. So, we don't have the overhead of a PHP process for every request, but just the ones that need it.



## Use-cases

### Nginx as a Reverse-Proxy

Because of it's agnostic, light-weight structure, Nginx is often used as a reverse proxy in front of other services, or even as a load balancing layer, routing requests to multiple instances of a server.

In situations where you need to run a service on a port which is locked down, you can set up a location of file type which forwards the request to another internal port. For example, in AWS, ports less than 1024 are generally locked down, with exception of 80 and 443. So, when running a node server, you can setup on port 8000, then redirect all traffic on 80 to port 8000, without much time fighting with AWS's security rules.

### Nginx as a Load Balancer

Nginx is fast, can handle a lot of connections, and is perfect as a load balancer. Using the `upstream` directive, we can also assign a group of servers,
which nginx will forward requests to, based upon various rules we configure.
It's straight forward, sits in the config, right along side our other virtual-host and port forwarding logic. In fact, it uses forwarding for servers as well as ports, using the `proxy-pass` directive inside of a `location` directive.

We'll get into the specifics below.



# Configuring Nginx

Find below a general overview of a config file, followed by specific use-case configuration.


### default.conf

Possible locations:
- `/etc/nginx/nginx.conf`
- `/usr/local/nginx/conf/nginx.conf`
- `/usr/local/etc/nginx/nginx.conf`

```
# Http context. Does not repeat.
http {

  # Server context, which can repeate multiple times.
  server {

    # Here, we can overwrite default http directives,
    # as well as add some of our own:


    # listen and server_name help nginx decide when this block is relevant,
    # and should be used by an incomming request:

    # Ports we will listen on. Can also have an ip address.
    listen 80;
    listen 127.0.0.1:443 ssl;

    # What's my name?!
    # Use this if you are serving up multiple domains or subdomains.
    #
    # E.G:
    # my.example.com
    # example.com
    server_name example.com;

    # Where is my document root?
    root /var/www/html;

    # What files should we serve when we hit a directory,
    # instead of a file?
    #
    # E.G. when we request: example.com/, or example.com/some/directory/
    index index.php index.html index.html;

    # Where are our SSL certs located?
    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;

    # Location of 404 page.
    error_page 404 /404.html;

    #
    ### Location Context
    #
    # Format: location [some match modifier] [some location to match]
    #
    location \some\path\to\handle {
      # Do special stuff for this directory,
      # or even reverse proxy to another service.
      # See second server block below for reverse proxy example.

      # Nest a location inside.
      location some_match {
        # another location block here.
      }
    }
  }
  server {
    listen 80;

    server_name node.example.com;

    #
    # **Note**  See more detail on the following settings
    # in the "web sockets" section further down.
    #

    # Sample proxy-pass of a node-served subdomain.
    # Pass anything on that subdomain to our node server,
    # found at host: 192.168.2.3, on port 8000
    location / {
      # Pass to this host:port
      proxy_pass http://192.168.2.3:8000/;

      # Set http version.
      proxy_http_version 1.1;

      # Proxy_set_header [field] [value]
      # Make updates to the passed header, and pass them along
      # to the final destination.

      # Upgrade the connection header, forcing the server
      # to allow for websocket use.
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';

      # Enforce a host name, in case one was not set.
      proxy_set_header Host $host;

      # Determine conditions when we ignore cache.
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

#### Add a location with a Regular Expression

```
location ~ \.php$ { }
```
`~` in the location means every thing following is a regex match. It's case sensitive.

```
location ~* \.php$ { }
```
This is the same, but case-insensitive.

```
location ^~ /blog/ { }
```
This tells the regex to stop looking for more specific matches once this pattern has been matched.


#### Mark a location as an alias to another path:
```
  location /some/location/alias/path {
    # Mark this as an alias to another, external,
    # location (like another server or docker container)
    alias /some/other/path/;
  }
```


#### Mark a location as internal only:
```
  location /some/location/interal/use {
    # Mark this path as internally accessible only.
    # All other requests here get a 404.
    internal;
  }
```

#### Restrict Location to GET requests only:
`limit_except` will allow any combination of these:

```GET, HEAD, POST, PUT, DELETE, MKCOL, COPY, MOVE, OPTIONS, PROPFIND, PROPPATCH, LOCK, UNLOCK, or PATCH.```

*Note:* `GET` will always include `HEAD` as well.

```
location /some/url/read/only {

  # All requests allow GET and HEAD requests.
  limit_except GET {
    # This HOST Subnet is allowed full access.
    allow 192.168.1.0/32;

    # Everyone else is denied.
    deny all;
  }
}
```

#### Don't use IF

According to the coommunity, use the `IF` directive [at your peril](https://www.nginx.com/resources/wiki/start/topics/depth/ifisevil/).


### Configure PHP Files
```
  # Sample PHP forwarding php files to phpfpm on port 9000.
  location ~ \.php$ {
      fastcgi_split_path_info ^(.+\.php)(/.+)$;
      fastcgi_pass phpfpm:9000;
      fastcgi_index index.php;
      fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
      include fastcgi_params;
  }
```


### Web Sockets
In order to support forwarding and return websocket connections via a proxy, we neeed to explicitly tell nginx to upgrade the connection.

```
location /some/path {
  # Pass to this host:port
  proxy_pass http://192.168.2.3:8000/;

  # Set http version. 1.0 defaults, but: "Version 1.1 is recommended
  # for use with keepalive connections and NTLM authentication,"
  # according to the docs. I.E. Websockets.
  proxy_http_version 1.1;

  # Proxy_set_header [field] [value]
  # Make updates to the passed header, and pass them along
  # to the final destination.

  # Upgrade the connection to allow for websocket use.
  # A client must explicitly asked in the header for "Upgrade"
  # in order to support web sockets.
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';

  # In the $http_upgrade condition, we will not serve from cache at this level.
  # From manual: 'If at least one value of the string parameters is
  # not empty and is not equal to “0” then the response
  # will not be taken from the cache.'
  proxy_cache_bypass $http_upgrade;
}
```

*From nginx docs:* "since the “Upgrade” is a hop-by-hop header, it is not passed from a client to proxied server. With forward proxying, clients may use the CONNECT method to circumvent this issue. This does not work with reverse proxying however, since clients are not aware of any proxy servers, and special processing on a proxy server is required."

**Note** By default, the **connection will be closed if the proxied server does not transmit any data within 60 seconds**. This timeout can be increased with the proxy_read_timeout directive. Alternatively, the proxied server can be configured to periodically send WebSocket ping frames to reset the timeout and check if the connection is still alive.

See the docs if you want to pass the upgrade headers from the request directly, [instead of forcing them](http://nginx.org/en/docs/http/websocket.html).


### Load Balancing

You can pre-define a set of like-servers which a user should be able to hit any one of, to the same result. Once defined, Nginx will route users to any one of your pool of servers. You can do this for a single location, or the entire web directory, just like the normal proxy-pass style we already talked about.

For example, say you have a blog that gets 99% of your traffic, located at: 
`www.mydoghouse.net/blog`. You can load balance *just your /blog requests*, while all remaining stuff hits a normal server.

The basic idea:
```
http {

  # Use upstream to define a group of identicle proxy servers,
  # which you can reference in server or location blocks.
  upstream my_upstream_name {
    server server1.example.com;
    server server2.example.com;
    server server3.example.com;
  }

  # In your server, setup a location directive with a proxy
  # to the name of your upstream, defined above.
  server {
    location /blog {
      proxy_pass http://my_backend_name;
    }
  }
}
```

#### Basic, Round-Robin:
By default, nginx serves up load balanced servers round-robin:
```
http {
  upstream my_upstream_name {
    server proxy_server1.example.com;
    server proxy_server2.example.com;
    server proxy_server3.example.com;
  }
}
```

#### Weight:
Alternatively, give more preference to specific servers using a weight.
Each server get's it's own. Think of weight as a multiplier, so the closer to 0, the less traffic that server is passed.
```
  upstream my_weighted_upstream {
    server proxy_server1.example.com weight=1;
    server proxy_server2.example.com weight=2;
    server proxy_server3.example.com weight=4;
  }
```

#### Least Connected
Using `least_conn`, nginx will attempt not to overload a busy server. This is good when requests may take longer than expected.
```
  upstream my_weighted_upstream {
    least_conn;
    server proxy_server1.example.com;
    server proxy_server2.example.com;
    server proxy_server3.example.com;
  }
```

#### Hashed by IP
Send someone on an IP to the same server each time! Great when you wanna maintain sessions, and persist in a single environment.

We'll hash the user's IP, and always direct back to the same server. Mark a server as `down` in order to redirect assigned ip's to a new server.

```
  upstream my_weighted_upstream {
    ip_hash;

    server proxy_server1.example.com;
    server proxy_server2.example.com;

    # This server marked as down, so anyone previously assigned here will be rerouted to an active server.
    server proxy_server3.example.com down;
  }
```

#### Combining Last-Connected, IP-Hash and Weights
It is similarly possible to use weights with the least-connected and ip-hash load balancing in the recent versions of nginx.


#### Max fail redirect
If a server is hit x times with failure, we can tell nginx to mark this server
as `down` for a specified timelimit. After that time expires, we'll mark it as back up, and try again.

By default, this is enabled, but can be tweaked (or disabled) with the following syntax:
```
  upstream my_weighted_upstream {

    # After 5 failed attempts, this server will be marked down
    # for the next 20 seconds.
    server proxy_server1.example.com max_fails=5 fail_timeout=20s;

    # These servers could have other directives, like weight.
    server proxy_server2.example.com;
    server proxy_server3.example.com;
  }
```
*Note: Setting max_fails=0, this behavior will be disabled.*

#### Other directives

- `max_conns` Limit the number of connections to this server.
- `backup` This server will only be routed to when the normal servers are down.
- **note:** Other directives get into more detail, but are only available with a paid nginx subscription. These include: `route`, `resolve`, `service`, `slow_start`, and others.


# Notes and debugging

## Nginx

### Use `include` in your config files

Within your main config, within the html block, you can use `include` statements to reference other files. So, it is recommended to break your site config up by domain.

```
http {
  include /path/to/my_domain.conf
}
```


### Internal Redirect limit of 10
From the docs:
`There is a limit of 10 internal redirects per request to prevent request processing cycles that can occur in incorrect configurations. If this limit is reached, the error 500 (Internal Server Error) is returned. In such cases, the “rewrite or internal redirection cycle” message can be seen in the error log.`