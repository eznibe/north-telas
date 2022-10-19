<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/logs.php';
include_once 'domain/providers.php';
include_once 'domain/plotters.php';
include_once 'domain/orders.php';
include_once 'domain/previsions.php';
include_once 'domain/previsionStates.php';


db_connect();

$storedCountry = isset($_GET['storedCountry']) ? $_GET['storedCountry'] : null;


if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['designed']))
		$value = setDesigned($json);
	else if(isset($_GET['updateMts']))
		$value = updateMts($json);
	else if(isset($_GET['edit']) && isset($_GET['isNumber']))
		$value = editPrevisionNumberField($json, $_GET['field']);
	else if(isset($_GET['edit']))
		$value = editPrevisionField($json, $_GET['field']);
	else if(isset($_GET['updatePrevisionState']) && isset($_GET['clothIds']))
		$value = updatePrevisionState($_GET['clothIds'], false);
	else if(isset($_GET['updatePrevisionState']) && isset($_GET['deliveryType']))
		$value = updatePrevisionStateWithDeliveryType($_GET['deliveryType']);
	else if(isset($_GET['updateAllPrevisionsStates']))
		$value = updateAllPrevisionsStates();
	else if(isset($_GET['acceptStateChange']))
		$value = acceptStateChange($json);
	else if(isset($_GET['weeksBySeason']))
		$value = updateWeeksBySeason($json);
	else if(isset($_GET['properties']))
		$value = updateProperties($json);
	else if(isset($_GET['listForProduction'])) {
		$value = getPrevisions(null, null, $expand, true, null, $_GET['sellerCode'], $_GET['offset'], $json);
	}
	else if(isset($_GET['listForDesign'])) {
		$value = getPrevisions(null, 'false', $expand, null, null, $_GET['code'], $_GET['offset'], $json);
	}
	else if(isset($_GET['listHistoric'])) {
		$value = getPrevisions(null, null, $expand, null, true, $_GET['sellerCode'], $_GET['offset'], $json);
	}
	else if(isset($_GET['weekUp'])) {
		$value = weekUp($json);
	}
	else if(isset($_GET['weekDown'])) {
		$value = weekDown($json);
	}
	else
		$value = savePrevision($json);

	//return JSON array
	exit(json_encode($value));
}
?>
