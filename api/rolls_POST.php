<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/rolls.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {
	
	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['updateType'])) {
		$value = updateRollType($json);
	}
	else if(isset($_GET['updateField'])) {
		$value = updateRollField($json, $_GET['updateField'], $_GET['value']);
	}
	else if(isset($_GET['manualRoll'])) {
		$value = saveManualRoll($json);
	}
	else {	
		$value = saveRolls($json);
	}

	//return JSON array
	exit(json_encode($value));
}
?>
