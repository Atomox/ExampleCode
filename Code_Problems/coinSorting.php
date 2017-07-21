<?php
$factored_coins = [];
$max_denominator = [];
$permutate_table = [];

// Import the data.
$handle = fopen ("php://stdin", "r");
fscanf($handle, "%d %d", $n, $m);
$ways = [];
$c = importCoins($handle);

if ($m > 0 && $n > 0) {
  // Restructure the coin array.
  $c = transformCoins($c, $n);

  // Find our solution.
  $ways = getWays($n, $c);

  // Print all results.
  // echo "\n\n\n\n" . 'Results: ' . "\n\n"
  //   . print_r($ways, TRUE);
}

// Print all results.
// echo "\n\n\n\n" . 'Normalized Results: ' . "\n\n"
//  . print_r($ways, TRUE);

echo trim(count($ways));

function getWays($n, $c){

  if (!is_array($c) || count($c) <= 0 || $n <= 0) {
    return [];
  }

  $subset = $c;
  $coin_hash = coinHash($c);
  $subset_hash = $coin_hash;
  $results = [];

  for ($i = 0; $i < count($c); $i++) {
    //echo ' > Processing Coin Set: ' . $subset_hash . '...' . "\n\n";

    // Can we reduce this coin to the next smallest one?
    $red = reduction($n, $subset, $subset_hash);

    //echo "\n\n" . ' --> ' . 'Reduction ' . $i . ': ' . coinHash($red) . "\n\n";

    $temp = factorSet($red, $c, $coin_hash);

    $temp = implodePermutations($temp);

    $results = mergeArray($results, $temp);

    //echo "\n\n" . ' --> ' . 'Reduction ' . $i . ': factored ' . "\n\n";

    // Remove the largest coin from the subset,
    // so we don't get the same reduction on the next pass.
    array_pop($subset);
    $subset_hash = coinHash($subset);
  }

  // Can we reduce this coin to the next smallest one?
  return $results;
}

$factored_coins = array();


function factorSet ($set, $coins, $coin_hash) {

//  echo ' ~ ~ FACTORING SET ~ ~ ~ ~ ~ ~ ~' . "\n";
//  echo ' set: ' . print_r($set, TRUE);

  $previous_index = array();
  $solutions = [];
  $prev = null;

  foreach ($set AS $n) {
//    echo "\n" . ' ~ ~ ~ ~ ITERATE ~ ' . $n . ' ~ ~ ~ ~ ~' . "\n";
    // Get the factor set of n.
    $solutions[] = factor($n, $coins, $coin_hash);
  }

//  echo "\n" . ' ~ ~ ~ ~ ~ ~ ~ BEFORE PERMUTATE ~' . "\n";

//  echo "\n\n" . print_r($solutions, TRUE);

  foreach ($solutions AS $i => $data) {
    if ($prev !== null) {
      $prev = permutate($prev, $solutions[$i]);
    }
    else {
      $prev = $solutions[$i];
    }
  }

//  echo "\n" . ' ~ ~ ~ ~ ~ ~ ~ AFTER PERMUTATE ~' . "\n";

//  echo "\n\n" . print_r($prev, TRUE);

//  echo ' ~ ~ ~ ~ ~ E N D ~ S E T ~ ~ ~ ~' . "\n";


  return $prev;
}


/**
 * Given a number, $n, and a list of coins,
 * factor out all possible permutations for $n.
 */
function factor($n, $c, $coin_hash) {

  global $factored_coins;
  $results = [];

  // 1. Did we already calculate this reduction?
  if (isset($factored_coins[$n])) {
    return $factored_coins[$n];
  }

  // 2. Is this number a coin denomination already? Include it.
  //    Then remove it from working coins.
  if (isset($c[$n])) { $results[] = [$c[$n]]; }

  // 3. Using only previous coins, get a reduction. (Don't include coin n if it was a coin)
  $reduction = reduction($n, $c, $coin_hash, FALSE);


  // If we had a reduction, include it.
  if ($reduction !== FALSE) {

    // 4. Do any of these items reduce?
    foreach ($reduction AS $i) {
      // If we haven't yet, factor this, so it will be cached.
      if (!isset($factored_coins[$i])) {
        // Attempt to reduce these.
        factor($i, $c, $coin_hash);
      }
    }

    // Now, go through each again, and combine all permutations.
    $prev = null;
    foreach ($reduction AS $i) {
      if ($prev !== null) {
        $prev = permutate($prev, $factored_coins[$i]);
      }
      else {
        $prev = $factored_coins[$i];
      }
    }

    $results = appendArray($results, $prev);
  }

  if (!empty($results)) {
    // By now, we should be completely factored.
    $factored_coins[$n] = $results;
  }

  return $results;
}





/**
 * Given a number, make change with the least coins possible.
 */
function reduction ($n, $c, $coin_hash, $include_single = TRUE) {
  $my_change = array();

  // Get the max denomination, and remainder.
  $max = maxDenomination ($n, $c, $coin_hash, $include_single);

  // If no max could be found, fail.
  if ($max <= 0) { return FALSE; }
  $my_change[] = $max;
  $remainder = $n - $max;

  // If there is a remainder.
  if ($remainder > 0) {
    // Is it a coin? We're good. Otherwise, recurse.
    if (isset($c[$remainder])) {
      $my_change[] = $c[$remainder];
    }
    else {
      $my_change = appendArray($my_change, reduction($remainder, $c, $coin_hash));
    }
  }

  return $my_change;
}


/**
 * Find the largest coin that goes into $n, with a divisible remainder.
 */
function maxDenomination ($n, $coins, $coin_hash, $include_single = TRUE) {
  global $max_denominator;
  $max = -1;

  if ($n > 0) {
    // Did we compute this previously? Return it!
    if (isset($max_denominator[$coin_hash][$n]) && $include_single === TRUE) {
      return $max_denominator[$coin_hash][$n];
    }


    /**
     * @TODO
     *   Reverse order.
     */
    foreach ($coins AS $c) {
      if ($c > $n) {
        break;
      }
      elseif ($n == $c && $include_single === TRUE) {
        $max = $c;
      }
      elseif ($n > $c && $c > $max) {
        $remainder = $n - $c;
        $qualifies = maxDenomination($remainder, $coins, $coin_hash);
        if ($qualifies > 0) { $max = $c; }
      }
    }

    // Let's never compute this again!
    if ($include_single === TRUE) {
      $max_denominator[$coin_hash][$n] = $max;
    }
  }

  return $max;
}


/**
 * Find all permutations by intersecting two arrays.
 * (array multiplication)
 */
function permutate($a, $b) {

  global $permutate_table;
//  echo "\n\n\n\n" . '< Permutate >' . "\n";
//  echo ' ~  ~  ~  ~  ~  ~  ~  ~  ~  ~' . "\n\n";

  $a_str = [];
  $b_str = [];
  $results = [];

  foreach($b AS $j) {
    if (!is_array($j)) { $j = [$j]; }
    $b_hash = coinHash($j);
    $b_str[$b_hash] = $b_hash;
  }

  // Convert to string first.
  // Arrays are ill-performant.
  foreach($a AS $i) {
    if (!is_array($i)) { $i = [$i]; }
    $a_hash = coinHash($i);

    // If this is not a doup.
    if (!isset($a_str[$a_hash])) {
      foreach ($b_str AS $b_key => $j) {
        $tmp = $a_hash . '-' . $j;
        $tmp = explode('-', $tmp);
        asort($tmp);
        $results[] = $tmp;
      }
    }

    $a_str[$a_hash] = $a_hash;
  }

/**
  foreach($a_str AS $i) {
    foreach($b_str AS $j) {
      $tmp = $i . '-' . $j;
      $tmp = explode('-', $tmp);
      asort($tmp);
      $results[] = $tmp;
    }
  }
*/

  return $results;
}


function coinHash($c) {
  return implode($c, '-');
}


/**
 * Join two arrays.
 */
function appendArray($a, $b) {
  // Enforce arrays.
  if (!is_array($a)) { $a = array($a); }
  if (!is_array($b)) { $b = array($b); }

//  $a = array_merge($a, $b);

  // Append b to a.
  foreach ($b as $val) { $a[] = $val; }
  return $a;
}


function mergeArray($a, $b) {
  // Enforce arrays.
  if (!is_array($a)) { $a = array($a); }
  if (!is_array($b)) { $b = array($b); }

  foreach ($b as $bk => $val) { $a[$bk] = $val; }

  return $a;
}


/**
 * Given an array of arrays, where each row is a set of coin, collapse them into
 * a string representation. Then store them, keyed by their value,
 * to eliminate doups.
 */
function implodePermutations($p) {
  $final = [];
  foreach ($p AS $res) {
    $temp = implode($res, '-');
    $final[$temp] = $temp;
  }

  return $final;
}


/**
 * Store the value as the key, for easier referencing.
 */
function transformCoins ($c, $n) {
  $result = array();

  // Sort values in ascending order. Then key them by their value.
  asort($c);
  foreach ($c as $coin) {
    if ($coin <= $n) {
      $result[$coin] = $coin;
    }
  }
  return $result;
}


function importCoins($handle) {
  $c_temp = fgets($handle);
  $c = explode(" ",$c_temp);
  if (is_array($c)) {
    $c = array_map('intval', $c);
  }

  return $c;
}
?>
