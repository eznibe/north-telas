<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

function logTiming($log) {

	$obj->successful = true;

	$query = "INSERT INTO timinglogs(method, url, service, time, entity) VALUES ('".$log->method."', '".$log->url."', '".$log->service."', ".$log->time.", '".$log->entity."')";
	if (! mysql_query($query)) {
		// error en insert
		$obj->successful = false;
		$obj->insert = $query;
	}

	return $obj;
}

if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$log = json_decode($request_payload);

	//var_dump($user);

	$response = logTiming($log);

	//return JSON array
	exit(json_encode($response));
}
?>
