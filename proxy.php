<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$url = $_GET['url'] ?? '';

if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid or missing URL"]);
  exit;
}

$context = stream_context_create([
  "http" => ["timeout" => 10, "user_agent" => "Mozilla/5.0"]
]);

$result = @file_get_contents($url, false, $context);

if ($result === false) {
  http_response_code(500);
  echo json_encode(["error" => "Unable to fetch remote data"]);
  exit;
}

echo $result;
