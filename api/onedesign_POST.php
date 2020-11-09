<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/sails.php';
include_once 'domain/boats.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {
	
	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['updateODModel'])) {
		$value = updateODModel($json);		
	}
	else if(isset($_GET['updateODModelMeasurement'])) {
		$value = saveODModelMeasurement($json);		
	}
	else if(isset($_GET['updateODModelItem'])) {
		$value = saveODModelItem($json);		
	}
	else if(isset($_GET['edit']) && isset($_GET['isNumber']))
		$value = editODModelNumberField($json, $_GET['edit'], $_GET['type']);
	else if(isset($_GET['edit']))
		$value = editODModelField($json, $_GET['edit'], $_GET['type']);

	//return JSON array
	exit(json_encode($value));
}
?>
