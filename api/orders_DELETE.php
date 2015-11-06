<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/orders.php';

db_connect();


if($_SERVER['REQUEST_METHOD'] == 'DELETE') {

	if(isset($_GET['removeorder'])) {

		$response = deleteOrder($_GET['orderId']);

		//return JSON array
		exit(json_encode($response));
	}
	else if(isset($_GET['orderproduct'])) {

		$response = deleteOrderProduct($_GET['opId'], $_GET['orderId'], $_GET['productId']);

		//return JSON array
		exit(json_encode($response));
	}
}
?>
