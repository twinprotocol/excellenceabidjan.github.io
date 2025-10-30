<?php
header("Access-Control-Allow-Origin: *");
$url = $_GET['url'] ?? '';
if ($url && filter_var($url, FILTER_VALIDATE_URL)) {
  echo file_get_contents($url);
} else {
  http_response_code(400);
  echo json_encode(["error" => "Invalid URL"]);
}
