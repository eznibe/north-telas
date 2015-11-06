<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/boats.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'DELETE') {

	if(isset($_GET['deleteODCloth'])) {

		$response = deleteOneDesignCloth($_GET['odId']);

		//return JSON array
		exit(json_encode($response));
	}
	else if(isset($_GET['deleteODBoat'])) {

		$response = deleteOneDesignBoat($_GET['boat']);

		//return JSON array
		exit(json_encode($response));
	}
}
?>
