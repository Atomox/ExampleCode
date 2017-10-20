# Migrating to Drupal 8

Drupal's Migration module was moved into Core for Drupal 8, and is as good as ever!
It takes a bit of fighting to figure out yet another Drupal workflow, but once you do, Migrate is a powerful module. Multiple sources, mapping of schemas from anywhere into the Drupal 8 structure and it's entities.

## Sources
MySQL, XML, JSON, and more are supported, both from local files and databases, or even remotely, are all supported. MySQL is the classic, proven method, but I've done some work with JSON, and even started experimenting with MSSQL (although the drivers integration with Drupal is the tricky part).

## Setting up a Migration

### Modules You need
- Migrate (core)
- migrate_plus
- migrate_tools (for Drush commands)
- Your custom migrate module

Install all of these first. You'll then build your own custom module.

### File Structure

#### Migrate_Plus Examples
**Migrate_plus** (mentioned above) **has example modules inside of it** which show you simple and more difficult examples. You should look there to see the inspiration for these examples, with good documentation (read: comments).

#### Building your own Custom Module
In order to get going, you need a custom module, were we'll drop your configuration, and run the migrations from. See Migrate_Plus's example modules to get the idea of the structure. Mostly, you're gonna need the `.info file`, and your `config yml` and `plugin classes`.



#### Config YML Files
These are where the migration is configured, source fields setup, and destination pointed to. Since they are YML, *they are only read at install time*. So, if you make changes, you gotta reinstall. Cache Rebuild won't do. There are hacky ways around this, but remember that.

```
location:
./config/install/*
.config/install/migrate_plus.migrate_group.group_name.yml
.config/install/migrate_plus.migration.migration_name.yml
```
These files set up the migration. Group files are the start, and group migrations, with shared config.

Migration files setup a single migration, and must be tied to a group.

##### Migration Group Example
```
# The machine name of the group, by which it is referenced in individual
# migrations.
id: my_group

# A human-friendly label for the group.
label: My Cool Group of Imports

# More information about the group.
description: A test content import

# Short description of the type of source, e.g. "Drupal 6" or "WordPress".
source_type: JSON

shared_configuration:
  # Source key, such as for a Drupal Database Schema Pattern.
  # This matches your settings.php database array, which is usually:
  # $dbs['key']['instance']
  # Refers to the ['key'] portion.
  # This would set all migrations in this group to use a db key of 'default'.
  source:
    key: default

# A list of dependent modules
# Each migration dependent upon these would get reloaded or uninstalled
# when those modules are uninstalled or reinstalled.
# read: YML configuration gets updated at those times.  
dependencies:
  enforced:
    module:
      - my_migrate_
      - migrate_plus
```

##### Migration Article Example
```
# This example migration imports some Article from their source JSON,
# into Drupal Article nodes. It does not import onion layers (images, paragraphs),
# which are separate migrations which must be run before this one can be run.
#
# Once the migration dependencies (listed at the bottom of this file) are run,
# run this migration, and they will be "plugged in" to this article node, for a
# complete migration.
id: my_article
label: JSON feed of articles
migration_group: my_group
source:
  # Find this in this module, under:
  # src/Plugin/migrate/source/__MyArticleClass__.php
  plugin: my_custom_url_json_process_plugin
  # Since we're hitting a web endpoint, we use the http data fetcher
  data_fetcher_plugin: http
  # We'll treat the result as JSON.
  data_parser_plugin: json
  # Wanna see unmapped extra source fields in the migration scrips?
  # Set include_raw_data: true. It will take extra resources!
  # include_raw_data: true
  # FULL URL of the endpoint where our source lives.
  urls: http://path/to/api/v1/MyArticles
  # An xpath-like selector corresponding to the items to be imported.
  # Either 0 (legacy setting) to denote the root of the JSON is our results,
  # or an xpath from root to the level where our results start. E.G. data/articles
  item_selector: data/articles
  # Under 'fields', we list the data items to be imported. The first level keys
  # are the source field names.
  fields:
    -
      # What is the machine name of this source field?
      name: id
      # Just a label for the developer to read.
      label: 'ID'
      # Where to find this value in the JSON.
      selector: id
    -
      name: title
      label: 'Title'
      selector: title
    -
      name: body
      label: 'Body'
      selector: body
    -
      # Images are often migrated separately (in several migrations:
      # file, media, etc). We often use this value as a unique ID,
      # in order to map those migrations as a link into the article.
      # We're not migrating images (or image metadata/captions) here,
      # but plugging them together.
      #
      # Note: Image migrations have no unique ID,
      # so we use the relative image path as the unique mapping ID.
      name: image_src
      label: 'Image'
      # Xpath: image->src = 'some/path/to/image'
      selector: image/src

  ids:
    # this key is the field 'id' from above.
    id:
      # We'll treat it as type string. Note: type int does not exist,
      # so maybe don't change this value.
      type: string

# This is where we translate the incoming source,
# and map it to the destination (D8) fields.
process:
  # Content Type of the Node we're migrating into.
  type:
    plugin: default_value
    default_value: article
  # If you really wanted to preserve IDs between systems.
  # Otherwise, remove this, and let Drupal generate them automagically.
  nid: some_source_id
  title: title
  # Note: Body is a multi-value field.
  # body/format is referencing a subfield on body.
  'body/format':
    plugin: default_value
    default_value: full_html
  'body/value': body

  sticky:
    plugin: default_value
    default_value: 0

destination:
  # The plugin which loads into the destination.
  # Look for other plugins in various migration modules under:
  # src/Plugin/migrate/destination
  # You can look in migrate, migrate_plus, or even your own migrate modules.
  plugin: entity:node

# These migrations map into this migration, so they should be run
# before this one.
migration_dependencies:
  required:
    - my_other_migration
    - my_file_migration

# Same as in the group dependencies section.
dependencies:
  enforced:
    module:
      - my_migrate
      - migrate_plus

```

#### SRC Plugins
```
location: ./src/Plugin/migrate/*
```

These are PHP classes that plugin to various parts of the migration. Source plugins inherit from a base class, and expose the query and row data, so we can manipulate them before they are saved into Drupal.



## Example Config

### File migrations
Setup a source, with something to identify the file uniquely. We'll use the file path, but if this were a D7 migration, you could use a file ID (assuming the images were managed.)

```
source:
  fields:
    -
      name: image_path
      label: 'Image'
      selector: image/src

  # Define constants used to generate file paths
  # and file names for images.
  constants:
    file_source_host: 'http://www.example.com'
    file_dest_uri: 'public://path/to/image/home'

  # Under 'ids', we identify source fields populated above which will uniquely
  # identify each imported file. We're using the source file path,
  # which is unique, so this ID is of type string.
  ids:
    image_path:
      type: string
```

Next, in the process block, we set a few defaults, and combine the file host with the relative url, so Drupal can actually download the target image.
```
process:
  filename:
    plugin: default_value
    default_value: filename

  # We use the concat plugin to join the host and path, for one absolute URL.
  # Then we pipe that to urlencode.
  file_source:
    -
      plugin: concat
      delimiter: ''
      source:
        - constants/file_source_host
        - image_path
    -
      plugin: urlencode

  # Next, we concat the destination image uri with the filename of the image.
  # If you don't have the image name as a separate field, you can break it out
  # in a prepareRow() using a source plugin class.
  file_dest:
    -
      plugin: concat
      delimiter: /
      source:
        - constants/file_dest_uri
        - filename
    -
      plugin: urlencode

  # Use the file_copy plugin to grab the source, and copy it into Drupal
  # at the @file_dest location.
  uri:
    plugin: file_copy
    source:
      - '@file_source'
      - '@file_dest'

# Our destination is the file entity.
destination:
  plugin: entity:file
```

In an source plugin class, in prepareRow(), you can break out the image filename from it's path:
```
public function prepareRow(Row $row) {
  // If source file image_path exists in the source,
  // break out it's name.
  if ($row->hasSourceProperty('image_path')) {
    // If it doesn't exist, return FALSE, so we ignore this row for migrating.
    if (!strlen(trim($row->hasSourceProperty('image_path'))) > 0) {
      return false;
    }

    $file_name = explode('/', $row->getSourceProperty('image_path'));
    $file_name = end($file_name);
    $row->setSourceProperty('filename', $file_name);
  }

  return parent::prepareRow($row);
}
```

### Media Image migrations
If you wanna get your images into the media module, you need to perform a file migration, and THEN run a media migration on top of that. Media module images are FIRST managed files, and second media module images.

```
source:
  fields:
    # Again, we use the image path as the source ID.
    # For Drupal sources, use the fid, if possible.
    -
      name: image_path
      label: 'Image'
      selector: image/src

  # We'll make this the source ID, so we know where this came from.
  # This is so we can do delta migrations,
  # reference these images in dependent migrations later on, etc.
  ids:
    image_path:
      type: string
```

We'll process this, populating the media module's `media__field_image->target_id` with the key that Drupal created when we imported each file during the file migration. In order to look it up, we must provide a field with a source key that we used in that migration. Since we're using the path of the image, we'll provide that. The migration plugin knows which key to return.

```
process:
  bundle:
    plugin: default_value
    default_value: image

  'field_image/target_id':
    plugin: migration
    migration: article_image_json
    source: image_path
```

Finally, we set the destination (a Media Entity), and require any migrations we're referencing in here. Since we're referencing the file migration from earlier, we'll include that here.

```
destination:
  # Our destination is a Media Entity
  plugin: 'entity:media'

migration_dependencies:
  required:
    - file_migration_name
```


### Paragraph migrations

Paragraphs seem to be D8's answer to the `Field Collection`.

Ah, D7's dreaded Field Collection. Such a useful module for building fields and nesting on top of Nodes, but no one supported them properly in features, migrate, or anywhere else.

Well, Paragraph is the new Field Collection.

So you're gonna use them, which means we'll probably need to migrate into them.

Here we go.

```
source:
  fields:
    -
      name: image_path
      label: 'Image'
      selector: image/src
    -
      name: caption
      label: 'Image Caption'
      selector: caption

  ids:
    image_path:
      type: string
```

Above, we're doing the usual thing. This is gonna be from the same images we migrated first to Drupal managed files, then to the media module. Well, now we wanna wrap a caption around them, so we're using the same source as before. Good 'ol image_path.

Next, we'll process them. This is *building a paragraph entity*, not associating it to anything yet. However, we will associate things to it. Namely, our image from before.

```
# Method 1
process:
  field_credit:
    plugin: default_value
    default_value: 'Some Value'
  'field_media_image/target_id':
    plugin: migration
    migration: my_media_migration
    source: image_path
```

Here's another approach (in progress).  Notice below how there are more properties available, since we're targeting the entire media image reference field, and not just the target_id.
```
# Method 2
process:
  field_media_image:
    plugin: get  # Which plugin should we use? iterator?
    source: target_id
    process:
      target_id:
        # Migration lookup plugin.
        # @see /core/modules/migrate/src/Plugin/migrate/process/MigrationLookup.php
        plugin: migration_lookup
        # Migration ID referencing this
        # already performed migration.
        migration: my_media_migration
        # Field in the source which should be
        # looked up to find the destination ID
        # from that migration.
        source: image_path
      alt: caption
      title: title
      width: width
      height: height
```
Finally, let's setup our destination, the paragraph entity. Notice, though that
we use `entity_reference_revisions`, not `entity`. That's important, and means that **later, we'll need both the entity id AND the revision ID when we try to attach this to a node**.
```
destination:
  plugin: entity_reference_revisions:paragraph
  default_bundle: my_paragraph_type

# Remember we need to reference our media migration.
# Since that depends upon the file migration, we throw it in here for good measure.
migration_dependencies:
  required:
    - my_file_migration
    - my_media_migration
```

OK, now we have a paragraph, and it's got a media image on it for good measure! We could add other fields, too. Whatever you want.

Yet, this is useless if we don't associate it with some content. Let's add this to an article.


```
# In your Node migration where we'll make a reference to our new paragraph.
source:
  fields:
    -
      name: image_path
      label: 'Image'
      # Xpath: image->src = 'some/path/to/image'
      selector: image/src
```
Since we only care about making a link to the paragraph, we only care about including a source field that can help us link back to that paragraph's Drupal ID. So, we need the source key we used when creating that paragraph.


# This is where we translate the incoming source,
# and map it to the destination (D8) fields.
process:

  # This is a paragraph item. See:
  # https://deninet.com/blog/2017/06/18/building-custom-migration-drupal-8-part-5-paragraphs

  # Map a paragraph entity from a sub-migration into this node.
  # Paragraphs require both the entity ID and the revision ID,
  # or they will not properly attach.
  'field_para_image/target_id':
    -
      # Migration plugin. Using the source field as a source key,
      # it looks up where that key was imported to,
      # and returns the key to that link.
      plugin: migration
      migration: my_paragraph_migration
      # The key from source which we use to look up our record.
      source: image_path
    -
      # Because this migration has two destid's (id and revision id),
      # we need to extract each by it's array key (0 or 1).
      # 0 is the main ID, and 1 is the revision key.
      plugin: extract
      index:
        - '0'

  # The revision we need.
  'field_photo_with_credit/target_revision_id':
    -
      plugin: migration
      migration: my_paragraph_migration
      source: image_src
    -
      plugin: extract
      index:
        - 1
```

Notice how there is no 'iterator' plugin. This means this field will only get a single paragraph. If it were multi-value, you're need this all nested under an iterator plugin, maybe something like the follow (untested) code:

```
'field_para_image':
  plugin: iterator
  source: image_path
  process:
    target_id:
      -
        plugin: migration
        migration: my_paragraph_migration
        source: image_path
      -
        plugin: extract
        index:
          - '0'
    target_revision_id':
      -
        plugin: migration
        migration: my_paragraph_migration
        source: image_path
      -
        plugin: extract
        index:
          - 1
```

Finally, don't forget to require those migration dependencies!
```
migration_dependencies:
  required:
    - my_file_migration
    - my_media_migration
    - my_paragraph_migration
```
