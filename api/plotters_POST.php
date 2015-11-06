<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/plotters.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['saveCut']))
		$value = savePlotterCut($json);
	else if(isset($_GET['cutted']))
		$value = finishPlotter($json);
	else if(isset($_GET['manualPlotter']))
		$value = saveManualPlotter($json);
	else if(isset($_GET['restore']))
		$value = restorePlotter($json);
	else if(isset($_GET['toDesign']))
		$value = toDesignPlotter($json);
	else if(isset($_GET['edit']))
		$value = editPlotter($json, $_GET['field']);
	else if(isset($_GET['editPlotterPrevision']))
		$value = editPlotterPrevision($json, $_GET['field']);

	//return JSON array
	exit(json_encode($value));
}
?>
