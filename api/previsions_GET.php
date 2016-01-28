<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/previsions.php';
include_once 'domain/previsionStates.php';

db_connect();


$designed = isset($_GET['designed']) ? $_GET['designed'] : null;
$expand = isset($_GET['expand']) ? $_GET['expand'] : null;

if(isset($_GET['id'])) {
	$value = getPrevision($_GET['id']);
}
if(isset($_GET['clothId'])) {
	$value = getPrevisions($_GET['clothId'], $designed, $expand, null);
}
else if(isset($_GET['updateAllPrevisionsStates'])) {
	$value = updateAllPrevisionsStates($_GET['updateClothId']);
}
else if(isset($_GET['updatePrevisionState'])) {
	$value = updatePrevisionState($_GET['updateClothId']);
}
else {
	$value = getPrevisions(null, $designed, $expand, null);
}

//return JSON array
exit(json_encode($value));
?>
