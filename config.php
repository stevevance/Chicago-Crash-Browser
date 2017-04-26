<?php

// DEFINE constants
$config = array (
	"srid_wgs84"=>4326,
	"srid_illinois_east"=>3435,
	"table_crashes"=>"crashes_chicago_2009_2015"
);

foreach($config as $key=>$val):
	define(strtoupper($key),$val);
endforeach;

// set the path so we can find config.php no matter where this cron file is stored
$path = "/";
set_include_path(get_include_path() . PATH_SEPARATOR . $path);

$path = "../";
set_include_path(get_include_path() . PATH_SEPARATOR . $path);
?>