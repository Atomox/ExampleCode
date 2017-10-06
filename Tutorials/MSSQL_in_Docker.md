# Setup MSSQL in Docker

So, you need to spin up an MSSQL database in Linux. Maybe you have a legacy database, or maybe you need a source DB for a migration. Either way, thanks to docker-compose, this is way easier than ever before! Microsoft has released a version of MSQL Server for Linux, and later a docker image, which you can includ in your docker compose, or run stand-alone.


## Create the container yourself?
Just follow these instructions, or skip this and use the pre-built image below. https://www.microsoft.com/en-us/sql-server/developer-get-started/php/ubuntu/


## Setup the Container in Compose
We'll do this in docker-compose, because non-compose usage is stupidly complex.

```
version: '2'
services:

    # The service name. If other containers need to access this,
    # use this name as the host.
    mssql:
      image: microsoft/mssql-server-linux:latest

      # Expose the port, in case you need to view it in an external viewer. If not, than don't!
      ports:
        - "1433:1433"

      # Accept the user agreement
      # Set a strong password for the MSSQL connection. At least 8 characters, and one each of: Capital, lowercase, number, silly character. Without this, your container will exit. Note: Your username will be: `SA`.
      environment:
        ACCEPT_EULA: Y
        SA_PASSWORD: '#MITektron9'

      volumes:
        # Map a directory to import any backup files.
        - ./data_dumps:/var/opt/mssql/backup
        # Map a data directory to save the state of your db between shutdowns.
        # Currently, because of OSX and Linux limitations on the filesystem, this does not work. :(
        # - ./mssql-data:/var/opt/mssql/data
```


## SQL-CMD
Microsoft's CLI for MSSQL. Generally uses `T-SQL`, an extension of SQL.

### Login
Found in `/opt/mssql-tools/bin`.
```
sqlcmd -S [host] -U [username]
```
hint: `./sqlcmd -S [host] -U [username]`
if this path isn't in your BASH PATHs variable.


### Using the CLI:
After you login, you're given a prompt, like:

```
1>
```
This is your prompt. You enter lines, multiple at a time. None are executed until you type the `GO` command.

To quit, type `:quit`. All commands other than `GO` start with a colon (`:`).


## Install MSSQL Database Backup
1. Make sure the docker machine or Docker for Mac has 4 GB of RAM or more
   enabled for your VM. Without this, the MSSQL container wont start.
2. Make sure your backup file is extracted into ./data_dumps
3. 'docker exec -it (ms-sql container name)' /bin/bash.
4. Connect to sql-cmd:
    a. `cd /opt/mssql-tools/bin`
    b. `./sqlcmd -S localhost -U SA` -- this runs the program, with localhost for user SA (default).
    c. When prompted for the password, enter the value in your docker-compose file, under variable: `SA_PASSWORD`.
5. Restore the database.
    a. If you're not sure what the databases are called, run:
    ```
    1> RESTORE FILELISTONLY
    2> FROM DISK = '/var/opt/mssql/backup/ektron9rv1-dev.bak'
    3> GO
    ```
    Look for the value in field name: `LogicalName`. That's the name of your
    database, and used in all subsiquent references to the name.

    b. Restore the database, as below. Each line is entered alone, followed by enter. The numbers correspond to the line number. You don't enter them yourself. When you're sure everything is right, line 5 executes all commands since the last GO command. Meaning, It runs the four previous commands.
    Remember, the backup will only restore to the database names already in the backup file.
    ```
    1> RESTORE DATABASE [ektron9rv1-dev]
    2> FROM DISK = '/var/opt/mssql/backup/ektron9rv1-dev.bak'
    3> WITH MOVE 'ektron9rv1-dev' TO '/var/opt/mssql/data/ektron9rv1-dev.mdf',
    4> MOVE 'ektron9rv1-dev_log' TO '/var/opt/mssql/data/ektron9rv1-dev_log.ldf'
    5> GO
    ```
    - Note: the square brackets in line 1, `RESTORE DATABASE [ektron9rv1-dev]` are escaping the name, since the hyphen is a special character in TSQL. If you are not using TSQL, you may have to use a different escape technique, such as "" for ANSI SQL.



    ### Connect to DB on external machine
    To connect with an MSSQL admin client (I like SQL Pro for MSSQL), you need to determine where Docker exposed it:
    1. Find the name of the container: `docker ps`
    2. Find the port, using: `docker inspect [container name or id]`
    3. Look for something near the end, like:
    ```
                "Ports": {
                    "1433/tcp": [
                        {
                            "HostIp": "0.0.0.0",
                            "HostPort": "32780"
                        }
                    ]
                },
    ```
    4. "HostPort": "32780" is the port you're looking for. This will change whenever you bring up the container/compose.
    5. In you favourite MSSQL Client, use:
    ```
    Server Name: 127.0.0.1:[port_number]
    Authentication: SQL Server Authentication
    Login: SA
    Password: [The password you set in docker-compose, under env: SA_PASSWORD]
    ```

## Configure PHP7-FPM to use SQLSRV Driver
In order for PHP to connect to the MSSQL Server, you need to install sqlsrv and pdo_sqlsrv drivers.

In your **dockerfile** for `php:7.1-fpm`, add this after the setup:

```
# Setup MS repositories before MSSQL dependencies
RUN apt-get update \
    && apt-get install -y apt-transport-https \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/8/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update

# Install Dependencies
RUN ACCEPT_EULA=Y apt-get install -y unixodbc unixodbc-dev libgss3 odbcinst msodbcsql locales \
    && echo "en_US.UTF-8 UTF-8" > /etc/locale.gen \
    && locale-gen

# Install pdo_sqlsrv and sqlsrv from PECL. Replace pdo_sqlsrv-4.1.8preview with preferred version.
RUN pecl install pdo_sqlsrv-4.1.8preview sqlsrv-4.1.8preview
RUN docker-php-ext-enable pdo_sqlsrv sqlsrv
```

#### Choose your SQLSRV Release:
Check: https://pecl.php.net/package/sqlsrv

#### Test a Connection in PHP7.
Run a test connection script from php:
```
<?php
    $serverName = "__mssql_container_name__";
    $connectionOptions = array(
        "Database" => "__db_name__",
        "Uid" => "sa",
        "PWD" => "__your_password__"
    );
    //Establishes the connection
    $conn = sqlsrv_connect($serverName, $connectionOptions);
    if($conn)
        echo "Connected!"
?>
```
