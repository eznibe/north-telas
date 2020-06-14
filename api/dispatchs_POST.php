<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/dispatchs.php';


db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['addPrevision']))
		$value = addPrevision($json);
	else if(isset($_GET['saveCarry']))
		$value = saveCarry($json);
	else if(isset($_GET['edit']) && isset($_GET['isNumeric']))
		$value = editDispatchPrevisionNumberField($json, $_GET['edit']);
	else if(isset($_GET['edit']))
		$value = editDispatchPrevisionField($json, $_GET['edit']);
	else if(isset($_GET['updatePrevisionCarry']))
		$value = updateDispatchPrevisionCarry($json);
	else if(isset($_GET['archive']))
		$value = archive($json);
	else if(isset($_GET['restore']))
		$value = restore($json);
	else if(isset($_GET['toggleClosedForSellers']))
		$value = toggleClosedForSellers($json);
	else
		$value = saveDispatch($json);

	//return JSON array
	exit(json_encode($value));
}
?>
