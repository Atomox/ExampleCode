# Drupal 8


## Setup

You need to use composer. Good article:

  `https://www.lullabot.com/articles/goodbye-drush-make-hello-composer`

## Custom Modules

Directory/File structure for a D8 module. Good article:

 `http://josephbcasey.github.io/d8-interconnections-demo/`


 ## DB Layer

 ```
 $result = db_select('example', 'e')
  ->fields('e', array('id', 'title', 'created'))
  ->condition('e.uid', $uid)
  ->orderBy('e.created', 'DESC')
  ->range(0, 10)
  ->execute();
  ```


## Site Configuration Sync

In Drupal 8, you will manage the site configuration using the [Configuration Manager](https://www.drupal.org/docs/8/configuration-management/managing-your-sites-configuration).

### Configure config location.
You can control where the config directory lives in settings.php. Just search for `$config_directories`, and read the comments.

It is a good idea to move this outside of the webroot, since the default location is under the files directory in Drupal. Set it in settings.php, like so:
```
$config_directories['sync'] = '/drupal-configuration/sync';
```

### Syncing config
The config yml files exist so that you can move them between environments easier, as well as use source control on them. You can thus pass them between sites, and run a config sync.

You can do run this from the admin at:
```
/admin/config/development/configuration
```

or via drush, like so:
```
drush cim -y
```

### Site UUID and Config Sync
Drupal wants to be the heavy-handed mother you never had, so you can't just sync config between any old environment. They need to be a clone of the site where the config was made. This is checked via the **Site UUID**.

You can get this UUID a few ways:

1. If you have access to the original system, use drush:
```
drush cget system.site uuid
```

2. If you only have access to the config files, find them in the `config/sync/system.site.yml` file.

It will look something like this:
```
{
  uuid: 86b376c5-385e-4d13-bf00-e5e5443540e3
  ...
}
```

#### Set the site UUID
Once you have the UUID, you can set it in the site you want to run the config in, using drush:
```
drush cset system.site uuid 86b376c5-385e-4d13-bf00-e5e5443540e3
```

Obviously, that value above will be the value of your UUID.

Once that is done, you should be able to run `drush cim` with no problem.

#### Issues running Config Import:

If you get errors, read them. I had:
- a missing module (which I had to download and enable)
- content from the shortcuts module, which I had to delete first, at: admin > config > User Interfact > Shortcuts

You errors may vary. **Read the error messages.**


### Issues Running Config Sync from drush
Ran out of memory when running: Drush uses the PHP CLI, not normal PHP, so you may need to change the memory limit for the CLI.

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


## Migrate

### Checking Errors in migration

`Error: 'Migration does not meet requirements'`

If you get this, try checking the core migration module `/src/Plugin/Migration.php`.

Look for this function:

```
public function checkRequirements() {
    // Check whether the current migration source and destination plugin
    // requirements are met or not.
    if ($this->getSourcePlugin() instanceof RequirementsInterface) {
      $this->getSourcePlugin()->checkRequirements();
    }
    if ($this->getDestinationPlugin() instanceof RequirementsInterface) {
      $this->getDestinationPlugin()->checkRequirements();
    }

    if (empty($this->requirements)) {
      // There are no requirements to check.
      return;
    }
```

These two statements will check the source and destination, and make sure both meet requirements. However, if either one fails, you get a failure, and your migration won't show up in the list. This function helps you track down which piece is the problem.

When I used the node::article plugin for the destination, I wasn't meeting all the requirements. Once I commented out this check, it started running. Thus, I knew the issues was in the destination.
