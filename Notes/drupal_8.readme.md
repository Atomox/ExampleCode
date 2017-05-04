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

