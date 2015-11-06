<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/plotters.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'DELETE') {

	if(isset($_GET['cutId'])) {

		$response = deletePlotterCut($_GET['cutId']);

		//return JSON array
		exit(json_encode($response));
	}
	else if(isset($_GET['removePlotter'])) {

		$response = deletePlotter($_GET['id']);

		//return JSON array
		exit(json_encode($response));
	}
	else if(isset($_GET['removeManualPlotter'])) {

		$response = deleteManualPlotter($_GET['id']);

		//return JSON array
		exit(json_encode($response));
	}
}
?>
