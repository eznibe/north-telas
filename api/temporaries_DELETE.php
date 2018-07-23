<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/temporaries.php';


db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['deleteDownload']))
		$value = deleteDownload($json);
	else
		$value = "Not found method";

	//return JSON array
	exit(json_encode($value));
}
?>
