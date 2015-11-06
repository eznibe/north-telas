<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/providers.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {
	
	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);
	
	if(isset($_GET['updateCode'])) {
		$value = updateProductCode($json);
	}
	else if(isset($_GET['updatePrice'])) {
		$value = updateProductPrice($json);
	}
	else if(isset($_GET['updateName'])) {
		$value = updateProviderName($json);
	}
	else {
		$value = saveNewProduct($json);
	}

	//return JSON array
	exit(json_encode($value));
}
?>
