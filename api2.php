<?php
require_once("../api/pg.php");

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$distance = intval($_GET['distance']);
$lat = floatval($_GET['lat']);
$lng = floatval($_GET['lng']);

$coords = "";
if(!empty($_GET)) {
	$coords = trim(urldecode($_GET["coords"]));
    $coords = pg_escape_string($coords);
}

$table = "crashes_chicago_2009_2013";

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
		"Crash latitude" AS latitude,
		"Crash longitude" AS longitude
	FROM {$table} c
	WHERE ST_DWithin(c.geom_3435, ST_Transform(ST_GeometryFromText('POINT({$lng} {$lat})',4326), 3435), {$distance})
	--ORDER BY year ASC, month ASC, day ASC
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
		"Crash latitude" AS latitude,
		"Crash longitude" AS longitude
	FROM {$table} c
	WHERE ST_Within(c.geom_4326, ST_GeomFromText('POLYGON(($coords))', 4326))
	--ORDER BY year ASC, month ASC, day ASC
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