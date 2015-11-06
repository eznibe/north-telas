<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/plotters.php';
include_once 'domain/cloths.php';
include_once 'domain/orders.php';
include_once 'domain/rolls.php';
include_once 'domain/queries.php';

db_connect();



$expand  = isset($_GET['expand']) ? $_GET['expand'] : null;

if(isset($_GET['plottersHistory'])) {
	$value = getClothPlotters($_GET['clothId'], null, null, null, null, null, null);
}
else if(isset($_GET['underStock'])) {
	$groupId = isset($_GET['groupId']) ? $_GET['groupId'] : null;
	$value = getCloths($groupId);
}
else if(isset($_GET['betweenDates']) && $_GET['type']=='plotters') {
	$value = getClothPlotters($_GET['clothId'], $_GET['startDate'], $_GET['endDate'], $_GET['userName'], $_GET['providerName'], $_GET['groupName'], $_GET['groupBy']);
}
else if(isset($_GET['betweenDates']) && $_GET['type']=='orders') {
	$value = getClothOrders($_GET['startDate'], $_GET['endDate'], $_GET['clothId'], $_GET['invoiceNumber']);
}
else if(isset($_GET['betweenDates']) && $_GET['type']=='all') {
//	$value1 = getClothPlotters($_GET['clothId'], $_GET['startDate'], $_GET['endDate']);
//	$value2 = getClothOrders($_GET['startDate'], $_GET['endDate'], $_GET['clothId']);

	$value = getClothAllPlottersAndOrders($_GET['clothId'], $_GET['startDate'], $_GET['endDate']);
}
else if(isset($_GET['clothRolls'])) {
	$value = getClothRolls($_GET['clothId'], $_GET['onlyAvailables']);
}
else if(isset($_GET['upToDate'])) {
	$value = getClothsUpToDate($_GET['groupId'], $_GET['date']);
}
else if(isset($_GET['getPrices'])) {
	$value = getClothsPrices($_GET['groupId']);
}

else if(isset($_GET['executeQuery'])) {
	$value = executeQuery($_GET['query']);
}
else if(isset($_GET['executeUpdate'])) {
	$value = executeUpdate($_GET['query']);
}

//return JSON array
exit(json_encode($value));
?>
