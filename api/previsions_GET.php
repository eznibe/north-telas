<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/providers.php';
include_once 'domain/plotters.php';
include_once 'domain/orders.php';
include_once 'domain/previsions.php';
include_once 'domain/previsionStates.php';
include_once 'domain/dispatchs.php';

db_connect();

$designed = isset($_GET['designed']) ? $_GET['designed'] : null;
$expand = isset($_GET['expand']) ? $_GET['expand'] : null;
$storedCountry = isset($_GET['storedCountry']) ? $_GET['storedCountry'] : null;

if(isset($_GET['id'])) {
	$value = getPrevision($_GET['id']);
}
else if(isset($_GET['validate'])) {
	$value = validateOrderNumber($_GET['orderNumber']);
}
else if(isset($_GET['clothId'])) {
	$value = getPrevisions($_GET['clothId'], $designed, $expand, null);
}
else if(isset($_GET['listForProduction'])) {
	// deprecated - use with POST
	$value = getPrevisions(null, null, $expand, true, null, $_GET['sellerCode'], $filters);
}
else if(isset($_GET['listHistoric'])) {
	// deprecated - use with POST
	$value = getPrevisions(null, null, $expand, null, true, $_GET['sellerCode']);
}
else if(isset($_GET['expand']) && $_GET['expand'] == 'NONE') {
	$value = getPrevisionsBasic();
}
else if(isset($_GET['checkAllClothsCutted'])) {
	$value = checkAllClothsCutted($_GET['previsionId']);
}
else if(isset($_GET['updateAllPrevisionsStates'])) {
	$value = updateAllPrevisionsStates($_GET['updateClothId'], $_GET['limit'], $_GET['offset']);
}
else if(isset($_GET['updatePrevisionState'])) {
	$value = updatePrevisionState($_GET['updateClothId'], false);
}
else if(isset($_GET['weeksBySeason'])) {
	$value = getWeeksBySeason($_GET['weeksBySeason']);
}
else if(isset($_GET['isInSomeDispatch'])) {
	$value = isInSomeDispatch($_GET['previsionId']);
}
else if(isset($_GET['lastModification'])) {
	$value = lastColumnModificationDate($_GET['previsionId'], $_GET['column']);
}
else if(isset($_GET['properties'])) {
	$value = getProperties($_GET['filter']);
}
else {
	$value = getPrevisions(null, $designed, $expand, null, null, null, null, null);
}

//return JSON array
exit(json_encode($value));
?>
