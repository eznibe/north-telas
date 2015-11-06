<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

function addLog($log) {

	$methodResult->successful = true;

	$insert = "INSERT INTO logs (type, log) VALUES ('".$log->type."', \"".$log->log."\")";
	if (! mysql_query($insert)) {
			// error en insert
			$methodResult->successful = false;
			$methodResult->insert = $insert;
	}

	return $methodResult;
}

if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	$log = json_decode($request_payload);

	$response = addLog($log);

	//return JSON array
	exit(json_encode($response));
}
?>
