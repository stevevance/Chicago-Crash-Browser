<?php
//echo "test";
require_once("pg.php");
error_reporting(0);

if(!empty($_GET)) {
	$lat = trim($_GET['lat']);
	$lng = trim($_GET['lng']);
	$distance = $_GET['distance'];
	
	$north = trim($_GET["north"]);
	$south = trim($_GET["south"]);
	$east = trim($_GET["east"]);
	$west = trim($_GET["west"]);
}

if(!is_numeric($lat)) { // protect against SQL injection
	$lat = 41.895924;
}
if(!is_numeric($lng)) { // protect
	$lng = -87.654921;
}
if(!is_numeric($north)) { // protect
	$west = -87.93;
	$east = -87.515;
	$north  = 42.0820;
	$south = 41.6300;
}
// TileMill -87.93,41.6300,-87.515,42.0820

if(!is_numeric($distance)) { // protect
	$distance = $_GET['distance'];
	$distance = 150;
}
$distanceMiles = distanceCheck($distance);

$carsToo = false;
	if($_GET['carsToo'] == 1) {
		$carsToo = true;
	}
	if($carsToo == false) {
		$addThis = 'AND(p."PersonType" = 3 OR p."PersonType" = 2)';
	}

$sql3 = 'SELECT
	min(C ."noInjuries") + min(C ."totalInjuries") people,
	min(C ."totalKilled") fatalities,
	min(C ."Crash severity") severity,
	C .casenumber,
	min(C ."totalInjuries") injuries,
	min(C ."noInjuries") noInjuries,
	min(C ."Crash injury severity"),
	min(C ."totalKilled") totalKilled,
	min(C .year) cyear,
	min(C .month) cmonth,
	min(C .day) cday,
	min(C ."Crash latitude") latitude,
	min(C ."Crash longitude") longitude,
	MIN (P ."PersonType") persontype,
	min(c."collType") collisiontype
FROM
	"'.$tableCrashes.'" c JOIN 
	"'.$tablePersons.'" p USING (casenumber)
WHERE
	c."City Code" = 1051 
AND	c."Crash latitude" < '.$north.' AND c."Crash latitude" > '.$south.'
AND c."Crash longitude" > '.$west.' AND c."Crash longitude" < '.$east.' 
 '. $addThis .' 
AND ST_DWithin((SELECT ST_Transform(ST_GeomFromText(\'POINT('.$lng.' '.$lat.')\',4326),3436)), ST_Transform(wgs84, 3436), '.$distance.')
GROUP BY c.casenumber 
ORDER BY
	MIN (C ."year"),
	MIN (C ."month"),
	MIN (C ."day")';
	
$sql4 = 'SELECT * FROM "'.$table.'" c
WHERE
ST_DWithin((SELECT ST_Transform(ST_GeomFromText(\'POINT('.$lng.' '.$lat.')\',4326),3436)), ST_Transform(c.wgs84, 3436), '.$distance.')
AND "Crash latitude"::decimal != 0 
AND "Crash longitude"::decimal != 0
AND	c."Crash latitude"::decimal < '.$north.' AND c."Crash latitude"::decimal > '.$south.'
AND c."Crash longitude"::decimal > '.$west.' AND c."Crash longitude"::decimal < '.$east.' 
ORDER BY c.month ASC, c.day ASC';
// ERROR:  transform: couldn't project point (0 0 0): latitude or longitude exceeded limits (-14)

//echo $choice;
if(!empty($lat) && !empty($lng)) {
	$result = pg_query($pg, $sql4);
	$total = pg_num_rows($result);
}
//echo "<p>".$sql4."</p>";


// output JSON
echo '{"data":[';

$first = true;
$r = pg_fetch_assoc($result);
while($r=pg_fetch_row($result)){
    //  cast results to specific data types

    if($first) {
        $first = false;
    } else {
        echo ',';
    }
    echo json_encode($r);
}
echo ']}';
	
?>