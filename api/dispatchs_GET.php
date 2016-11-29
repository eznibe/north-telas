<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/dispatchs.php';

db_connect();

$expand = isset($_GET['expand']) ? $_GET['expand'] : null;
$dispatchCountry = isset($_GET['dispatchCountry']) ? $_GET['dispatchCountry'] : null;

if(isset($_GET['id'])) {
	$value = getDispatch($_GET['id']);
}
else if(isset($expand)) {
	$value = getDispatchs($expand, $_GET['startDate'], $_GET['endDate'], $_GET['filterKey'], $_GET['filterValue']);
}
else if(isset($_GET['carriesOf'])) {
	$value = getDispatchCarries($_GET['carriesOf']);
}
else if(isset($_GET['destinataries'])) {
	$value = getDispatchDestinataries();
}
else if(isset($_GET['nextNumber'])) {
	$value = getNextDispatchNumber();
}
else {

}

//return JSON array
exit(json_encode($value));

// Not possible to use in php 5.2 (server version)
// exit(json_encode($value, JSON_NUMERIC_CHECK));
?>
