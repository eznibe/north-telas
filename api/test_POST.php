<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';


if($_SERVER['REQUEST_METHOD'] == 'POST' || $_SERVER['REQUEST_METHOD'] == 'PUT') {

	$request_payload = file_get_contents('php://input');

	$log = json_decode($request_payload);

//	$response = addLog($log);

	//return JSON array
//	exit(json_encode($log));
	exit("Done: ".$request_payload.' - '.$log->key.' - '.$log->payload. ' - ' .$_GET['payload']);
}
?>
