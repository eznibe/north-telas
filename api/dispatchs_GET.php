<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/dispatchs.php';

db_connect();

$expand = isset($_GET['expand']) ? $_GET['expand'] : null;

if(isset($_GET['id'])) {
	$value = getDispatch($_GET['id']);
}
else if(isset($expand)) {
	$value = getDispatchs($expand, $_GET['startDate'], $_GET['endDate']);
}
else if(isset($_GET['carriesOf'])) {
	$value = getDispatchCarries($_GET['carriesOf']);
}
else {

}

//return JSON array
exit(json_encode($value, JSON_NUMERIC_CHECK));
?>
