<?php
require_once("config.php");
require_once("pg.php");
require_once("functions.php");

// foreach ($argv as $arg) {
//     $e=explode("=",$arg);
//     if(count($e)==2)
//         $_GET[$e[0]]=$e[1];
//     else
//         $_GET[$e[0]]=0;
// }

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$distance = intval($_GET['distance']);
$lat = floatval($_GET['lat']);
$lng = floatval($_GET['lng']);

$coords = "";
if(!empty($_GET) & isset($_GET['coords'])):
	$coords = trim(urldecode($_GET["coords"]));
    $coords = pg_escape_string($coords);
endif;

$table = TABLE_CRASHES;
if($distance):
	$q = <<<HEREDOC
	SELECT * FROM (
	SELECT
		"collType",
		casenumber,
		"totalInjuries",
		"totalKilled",
		"noInjuries",
		"Crash severity" as "crashSeverity",
		month,
		day,
		year,
		st_y(geom_4326) AS latitude,
		st_x(geom_4326) AS longitude
	FROM {$table} c
	WHERE ST_DWithin(c.geom_3435, ST_Transform(ST_GeometryFromText('POINT({$lng} {$lat})',4326), 3435), {$distance})
	) as t
HEREDOC;
else:
	$q = <<<HEREDOC
	SELECT * FROM (
	SELECT
		"collType",
		casenumber,
		"totalInjuries",
		"totalKilled",
		"noInjuries",
		"Crash severity" as "crashSeverity",
		month,
		day,
		year,
		st_y(geom_4326) AS latitude,
		st_x(geom_4326) AS longitude
	FROM {$table} c
	WHERE ST_Within(c.geom_4326, ST_GeomFromText('POLYGON(($coords))', 4326))
	) as t
HEREDOC;
endif;

$result = pg_query($pg, $q);
$total = pg_num_rows($result);

if (!$result) {
    echo "An error occurred.\n";
    echo $q;
    echo pg_result_error($result);
}

$crashes = json_encode(pg_fetch_all($result));
$query = json_encode($q);
//, "sql": {$query}
$response = <<<EOF
{"response":{"coords": "{$coords}", "results": "$total"},"crashes": {$crashes} }
EOF;

echo $response;
?>