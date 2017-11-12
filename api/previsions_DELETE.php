<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/previsions.php';

db_connect();

// can't use method DELETE because doesn't work on nssudamerica-intranet domain
if($_SERVER['REQUEST_METHOD'] == 'POST') {

	if(isset($_GET['id'])) {

		$response = deletePrevision($_GET['id']);

		//return JSON array
		exit(json_encode($response));
	}
}
?>
