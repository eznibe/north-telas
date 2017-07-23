<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/users.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$user = json_decode($request_payload);

	//var_dump($user);

	if (isset($_GET['acceptNewDispatch'])) {
		$response = acceptNewDispatch($user);
	} else	if (isset($_GET['acceptPrevisionsNotify'])) {
		$response = acceptPrevisionsNotify($user);
	} else	if (isset($_GET['storePrevisionNotify'])) {
		$response = storePrevisionNotify($user);
	} else if (isset($_GET['updateCountry'])) {
		$response = updateCountry($user);
	} else {
		$response->successful = addOrUpdateUser($user);
	}

	//return JSON array
	exit(json_encode($response));
}
?>
