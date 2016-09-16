<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

include_once 'domain/logs.php';


if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	$log = json_decode($request_payload);

	if(isset($_GET['files'])) {
		$response = addFilesLog($log);
	} else {
		$response = addLog($log);
	}

	//return JSON array
	exit(json_encode($response));
}
?>
