<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/logs.php';
include_once 'domain/sails.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {
	
	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['updateSailName'])) {
		$value = updateSailName($json);		
	}
	else if(isset($_GET['designMinutes'])) {
		$value = updateSailDesignMinutes($json);		
	}

	//return JSON array
	exit(json_encode($value));
}
?>
