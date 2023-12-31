<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

if($_SERVER['REQUEST_METHOD'] == 'POST' || $_SERVER['REQUEST_METHOD'] == 'PUT') {

	$request_payload = file_get_contents('php://input');

	$json = json_decode($request_payload);

	addZorglinkLog(json_encode($json), "lifecycle");

	exit($_GET['validationToken']);
}

function addZorglinkLog($msg, $type) {

	$insert = "INSERT INTO zorglink (log, type) VALUES ('".$msg."', '".$type."')";
	// var_dump($insert);
	if (! mysql_query($insert)) {
			// error en insert
			$methodResult->successful = false;
			$methodResult->insert = $insert;
			echo " error ";
	}

	return $methodResult;
}
?>
