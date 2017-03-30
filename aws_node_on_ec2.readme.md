Setup a Node instance on Amazon EC2.

A. Get a Server

1. Sign up for an account.
2. Spin up an EC2 account. I selected the Ubuntu server, as I've mostly worked with that distro.
3. Make sure to create a PEM file when creating the server. You'll be prompted,
  and should do it right away. A PEM file is a security file you'll need locally when connecting to your server.
  YOU CAN'T GET THIS AFTERWARDS, OR REDOWNLOAD IT ONCE CREATED.
  Make sure to do this, and download it somewhere safe. We'll use this when ssh'ing to your server.
4. Set an Elastic IP address for your account:
	- in EC2, under Actions > Networking > Manage IP Addresses
5. Make sure your security group accounts for the following ports:
  SSH (port 22) -- You need this to remote into your server for setup.
  HTTP (port 80), -- You need this to allow people to see your server from the web.
  HTTPS (port 443)  -- See above, but more securely.


B. Get a Domain

1. I purchased a new domain name (.com) on Route 53 (Amazon's Domain Service)
2. Once ready, create a Hosted Zone. (Purchasing from Route 53 will do this automatically)
3. Create a record Set (Type: A) inside a Hosted Zone.
	Name: www (notice .yourdomain.com is appended to this) www should be the normal/primary record.
	Type: A - IPv4
	Alias: No
	Value: your_static_ip_goes_here
	Routing Policy: Simple
4. Create a record set again, where name is blank (this is for yourdomain.com without a www). This will make sure we redirect to our last entry.
	Name: (blank)
	Type: A - IPv4
	Alias: Yes
	Alias Target: (look in the list for your last record,i.e. www.yourdomain.com)
	Routing Policy: Simple


C. Connect to Your Server

http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html

1. We'll SSH into your new server. Remember that PEM file from A.3?
2. First we need to hide it from prying eyes: `chmod 400 my-pem-file.pem` Amazon will reject you unless you do this. But you wouldn't skip this step anyway, because security's cool.
3. `ssh -i /path/my-key-pair.pem ubuntu@ec2-198-51-100-1.compute-1.amazonaws.com`
  Where ubuntu is ec2-user on other instances, but not on an Ubuntu server. ec2-123-45-etc...amazonaws.com is your server's Public DNS.
4. Like any good RSA, it'll ask to accept the fingerprint when you connect. Say yes.
5. We're in! (if not, make sure you referenced your pem file, or that your ec2's security group setup port 22 properly)


D. Setup Your Server / Code

1. Amazon serves web requests via port 80, but doesn't anyone but root to use ports < 1024. We need to forward 80 -> some cooler port that node can listen on.
2. [This guy has some good ideas](https://gist.github.com/kentbrew/776580) on how to solve this.
  `sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000`
  Forward port 80 -> 8000 using the above rule. However, some people may prefer using cloudfront or an elastic load balancer, both AWS services. A load balancer even works with a single server. Also, if you only want node to server *some* requests, don't apply the rule above, which redirects *all* requests.
3. If you do the rule above, it doesn't stick on server reboots, so you need to set the iptables to save and reload the config between boots:

edit: `/etc/network/interfaces`, adding these two lines:
```
pre-up iptables-restore < /etc/iptables.rules
post-down iptables-save > /etc/iptables.rules
```
4. Now your node scripts can listen on port 8000, and standard web traffic will redirect to them.


E. Add SSH Pub Key, and pull from GitHub

1. Assuming you want to checkout your code from GitHub, we'll need to create a pubkey, and add it to your GitHub account.
2. Generate a new pub key for your EC2 server: `ssh-keygen -t rsa`
3. By default, it'll live in: `~/.ssh/id_rsp.pub`. Copy the contents of this file, and add it into your github account's ssh keys, here: `https://github.com/settings/keys`.
4. Find the clone URL for the repo you want to checkout, which will look something like this: `git@github.com:YOUR_USER_NAME/YOUR_REPO_NAME.git`
5. Create the location where you want this code to live in your AWS server. Some conventions use: `/var/www/your_project_name`, or simply add it under your user folder, at: '~/'.
6. `git clone git@github.com:YOUR_USER_NAME/YOUR_REPO_NAME.git`
7. You're code's there! We just need to start it!
8. `node app.js` or `npm start` or however you did it.


F. Keep it Up

1. Consider using the [forever module](https://www.npmjs.com/package/forever) to keep things running.
2. `npm install forever -g`
3. `forever start app.js` or `git stop app.js`