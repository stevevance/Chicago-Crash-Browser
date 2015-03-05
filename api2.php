<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require_once("pg.php");
error_reporting(0);

$coords = "";
if(!empty($_GET)) {
	$coords = trim(urldecode($_GET["coords"]));
    $coords = pg_escape_string($coords);
}

// constant for ST_Transform
$NAD83_ILLINOIS_EAST = 3435;
$WGS_84 = 4326;

$q = <<< HEREDOC
SELECT array_to_json(array_agg(row_to_json(t))) as result from (
SELECT
	"collType",
	casenumber,
	"totalInjuries",
	"Total killed" as "totalKilled",
	"No injuries" as "noInjuries",
	month,
	day,
	year,
	latitude,
	longitude
FROM "$table" c
WHERE ST_Within(c.wgs84, ST_GeomFromText('POLYGON(($coords))', $WGS_84))
ORDER BY year ASC, month ASC, day ASC
) as t
HEREDOC;

$result = pg_query($pg, $q);
$total = pg_num_rows($result);

if (!result) {
    echo "An error occurred.\n";
}

echo pg_result_error($result);

$r = pg_fetch_assoc($result);
$result = $r['result'] ? $r['result'] : '[]';
// output JSON
echo <<<HEREDOC
{"response":{"coords": "$coords", "results": "$total"},"crashes": $result}
HEREDOC;
?>