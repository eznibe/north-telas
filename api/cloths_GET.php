<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/cloths.php';

db_connect();


$expand  = isset($_GET['expand']) ? $_GET['expand'] : null;
$groupId = isset($_GET['groupId']) ? $_GET['groupId'] : null;
$previsionCountry = isset($_GET['previsionCountry']) ? $_GET['previsionCountry'] : null;
$clothCountry = isset($_GET['clothCountry']) ? $_GET['clothCountry'] : null;

if(isset($_GET['id'])) {
	$value = getCloth($_GET['id']);
}
else if(isset($_GET['dolar'])) {
	$value = getDolar();
}
else if(isset($_GET['historicdolar'])) {
	$value = getHistoricDolar();
}
else if(isset($_GET['pctNac'])) {
	$value = getPctNac();
}
else if(isset($_GET['inflation'])) {
	$value = getInflation();
}
else if(isset($_GET['matchIds'])) {
	$value = getClothsWithMatchIdsInCountry($_GET['matchIds'], $previsionCountry);
}
else {
	$value = getCloths($groupId, $expand);
}

//return JSON array
exit(json_encode($value));
?>
