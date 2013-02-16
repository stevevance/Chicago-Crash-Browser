<?php
function distanceCheck($distance) {
	$maxDistance = 1000;
	if($distance > $maxDistance) {
		$distance = $maxDistance;
	}
	$distanceMiles = $distance/5280;
	return $distanceMiles;
}
?>