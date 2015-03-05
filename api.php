<?php
//echo "test";
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require_once("pg.php");
error_reporting(0);

if(!empty($_GET)) {
	$lat = trim($_GET['lat']);
	$lng = trim($_GET['lng']);
	$distance = intval($_GET['distance']);

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
if($distance > 500) { // in feet
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

$sql5 = 'SELECT * FROM "'.$table.'" c
WHERE
ST_DWithin((SELECT ST_GeomFromText(\'POINT('.$lng.' '.$lat.')\',4326)), c.wgs84), '.$distance.')
AND latitude::decimal != 0
AND longitude::decimal != 0
AND	latitude::decimal < '.$north.' AND latitude::decimal > '.$south.'
AND longitude::decimal > '.$west.' AND longitude::decimal < '.$east.'
ORDER BY c.month ASC, c.day ASC';

$sql6 = 'SELECT * FROM "'.$table.'" c
WHERE
ST_DWithin((SELECT ST_Transform(ST_GeomFromText(\'POINT('.$lng.' '.$lat.')\',4326),3435)), ST_Transform(c.wgs84, 3435), '.$distance.')
AND	latitude < '.$north.' AND latitude > '.$south.'
AND longitude > '.$west.' AND longitude < '.$east.'
ORDER BY c.month ASC, c.day ASC';

$sql7 = '
SELECT array_to_json(array_agg(row_to_json(t))) as result from (
SELECT "collType", casenumber, "totalInjuries", "Total killed" as "totalKilled", "No injuries" as "noInjuries", month, day, year, latitude, longitude FROM "'.$table.'" c
WHERE
ST_DWithin((SELECT ST_Transform(ST_GeomFromText(\'POINT('.$lng.' '.$lat.')\',4326),3435)), ST_Transform(c.wgs84, 3435), '.$distance.')
AND latitude < '.$north.' AND latitude > '.$south.'
AND longitude > '.$west.' AND longitude < '.$east.'
ORDER BY year ASC, month ASC, day ASC
) as t';

$sql8 = 'SELECT
	"collType",
	casenumber,
	"totalInjuries",
	"Total killed" AS "totalKilled",
	"No injuries" AS "noInjuries",
	MONTH,
	DAY,
	YEAR,
	latitude,
	longitude
FROM
	"'.$table.'" C
WHERE
	ST_DWithin (
		(

				ST_Transform (
					ST_GeomFromText (
						\'POINT('.$lng.' '.$lat.')\',
						4326
					),
					3435
				)
		),
		geom_3435,
		150
	)
ORDER BY
	YEAR ASC,
	MONTH ASC,
	DAY ASC';

// ERROR:  transform: couldn't project point (0 0 0): latitude or longitude exceeded limits (-14)

//echo $choice;
if(!empty($lat) && !empty($lng)) {
	$result = pg_query($pg, $sql7);
	$total = pg_num_rows($result);
}
//echo "<p>".$sql4."</p>";

echo pg_last_error($pg);

$r = pg_fetch_assoc($result);
// output JSON
echo '{"response":{"sql":' . json_encode($sql7) . '},"crashes":' . $r['result'] . '}';
?>