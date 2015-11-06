<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/cloths.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'DELETE') {

		$response = deleteCloth($_GET['clothId']);

		//return JSON array
		exit(json_encode($response));
}
?>
