<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/previsions.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['designed']))
		$value = setDesigned($json);
	else if(isset($_GET['updateMts']))
		$value = updateMts($json);
	else if(isset($_GET['edit']))
			$value = editPrevisionField($json, $_GET['field']);
	else
		$value = savePrevision($json);

	//return JSON array
	exit(json_encode($value));
}
?>
