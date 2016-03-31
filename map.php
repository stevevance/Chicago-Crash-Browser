<?php
header('Content-Type: application/json');

function get_map($method, $place) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, "http://www.chicagocityscape.com/php/api.map.php?method={$method}&place={$place}");
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $response = curl_exec($ch);
  curl_close($ch);

  return $response;
}

echo get_map($_GET['method'], $_GET['place']);
?>