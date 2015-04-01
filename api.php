<?php
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

// constant for ST_Transform
$NAD83_ILLINOIS_EAST = 3435;
$WGS_84 = 4326;

$sql = <<< HEREDOC
SELECT array_to_json(array_agg(row_to_json(t))) AS result FROM (
SELECT "collType",
	casenumber,
	"totalInjuries",
	"Total killed" as "totalKilled",
	"No injuries" as "noInjuries",
	"Crash severity" as "crashSeverity",
	month,
	day,
	year,
	latitude,
	longitude FROM "$table" c
WHERE
ST_DWithin((SELECT ST_Transform(ST_GeomFromText('POINT( $lng $lat )',$WGS_84),$NAD83_ILLINOIS_EAST)), ST_Transform(c.wgs84, $NAD83_ILLINOIS_EAST), $distance)
AND latitude < $north AND latitude > $south
AND longitude > $west AND longitude < $east
ORDER BY year ASC, month ASC, day ASC
) as t
HEREDOC;

if(!empty($lat) && !empty($lng)) {
	$result = pg_query($pg, $sql);
	$total = pg_num_rows($result);
}

echo pg_last_error($pg);

$r = pg_fetch_assoc($result);
$result = $r['result'] ? $r['result'] : '[]';
echo '{"response":{"sql":' . json_encode($sql) . '},"crashes":' . $result . '}';
?>