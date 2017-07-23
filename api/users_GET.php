<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/users.php';

db_connect();

$sellerCountry = isset($_GET['sellerCountry']) ? $_GET['sellerCountry'] : null;

if(isset($_GET['existsNewDispatch'])) {
	$value = existsNewDispatch($_GET['id']);
}
else if(isset($_GET['existsPrevisionsNotify'])) {
	$value = existsPrevisionsNotify($_GET['id']);
}
else if(isset($_GET['loadColumnsState'])) {
	$value = loadColumnsState($_GET['userId'], $_GET['type']);
}
else if(isset($_GET['id'])) {
	$value = getUser($_GET['id']);
}
else if(isset($_GET['roles'])) {
	$value = getRoles();
}
else if(isset($_GET['plotter'])) {
	$value = getPlotterUsers();
}
else if(isset($_GET['sellerCodes'])) {
	$value = getSellerCodes();
}
else {
	$value = getUsers();
}

//return JSON array
exit(json_encode($value));
?>
