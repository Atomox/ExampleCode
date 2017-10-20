<?php

function my_vol ($buildings, $start_height = 0, $step = 0, $step_sum = 0, $max_nomatch_height = 0) {

	$my_height = $buildings[0];
	if ($start_height === 0) {
		$start_height = $my_height;
	}

	if ($max_nomatch_height < $my_height) {
		$max_nomatch_height = $my_height;
	}

	// Have we found our right border?
	if ($my_height >= $start_height && $step !== 0) {
		return array(
			'steps' => $step,
			'sum' => $step_sum,
		);
	}
	// Are we at the end of our city?
	elseif(length($buildings) <= 1) {
		return NULL;
	}

	// Continue.
	$result = my_vol(array_shift($buildings), $start_height, $step+1, $step_sum + $my_height, $max_nomatch_height);

	if ($result === NULL) {
		if ($my_height === $max_nomatch_height) {
			return array(
				'steps' => $step,
				'sum' => $step_sum,
			);
		}
		else {
			return NULL;
		}
	}
}

function find_city_flooding () {
	$buildings = array(2,3,2,1,5,4,2,4,1,2);

	$total = 0;
	$next_pos = 0;

	foreach ($buildings AS $position => $height) {
		if ($next_pos > $position) {
			continue;
		}

		// Find volume.
		$my_buildings = array_slice($buildings, $position);
		$my_vol = my_vol($my_buildings, $height);

		if ($my_vol['sum'] > 0) {
			$total += $my_vol;
			$next_pos = $position + $my_vol['steps'];
		}
	}
}