<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/rolls.php';

db_connect();



$expand  = isset($_GET['expand']) ? $_GET['expand'] : null;


if(isset($_GET['id'])) {
	$value = getRolls($_GET['id']);
}
else if(isset($_GET['all'])) {
	$distincts = isset($_GET['distincts']) ? $_GET['distincts'] : false;
	$value = getAllRolls($distincts);	
}
else if(isset($_GET['possibleRolls'])) {
	$value = getPossibleRolls($_GET['clothId'], $_GET['plotterId']);	
}
else if(isset($_GET['lotes'])) {
	$value = getRollLotes($_GET['rollNumber']);	
}
else if(isset($_GET['cuts'])) { // all the cuts of the given roll

	$rollId = isset($_GET['rollId']) ? $_GET['rollId'] : null;
	$clothId = isset($_GET['clothId']) ? $_GET['clothId'] : null;

	$value = getRollCuts($rollId, $clothId);	
}
else {
	$value = getRolls($_GET['productId'], $_GET['orderId']);
}

//return JSON array
exit(json_encode($value));
?>
