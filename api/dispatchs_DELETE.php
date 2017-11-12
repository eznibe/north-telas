<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/dispatchs.php';


db_connect();

// can't use method DELETE because doesn't work on nssudamerica-intranet domain
if($_SERVER['REQUEST_METHOD'] == 'POST') {

	if(isset($_GET['id'])) {
		$response = deleteDispatch($_GET['id']);
	} else if (isset($_GET['dispatchPrevisionId'])) {
		$response = deleteDispatchPrevision($_GET['dispatchPrevisionId']);
	} else if (isset($_GET['previsionId'])) {
		$response = deleteDispatchPrevisionExtended($_GET['previsionId'], $_GET['dispatchId']);
	} else if (isset($_GET['carryId'])) {
		$response = deleteCarry($_GET['carryId']);
	}

	//return JSON array
	exit(json_encode($response));
}
?>
