<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/orders.php';

db_connect();



$expand  = isset($_GET['expand']) ? $_GET['expand'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : null;


if(isset($_GET['id'])) {
	$value = getOrder($_GET['id']);
}
else {
	$value = getOrders($status, $_GET['providerId'], $expand);
}

//return JSON array
exit(json_encode($value));
?>
