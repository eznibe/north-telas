<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/temporaries.php';


db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['fileDownload']))
		$value = addTemporariesFileDownload($json);
	else if(isset($_GET['saveDispatch']))
		$value = saveDispatch($json);
	else if(isset($_GET['saveFile']))
		$value = saveFile($json);
	else if(isset($_GET['saveDownload']))
		$value = saveDownload($json);
	else if(isset($_GET['editFile']))
		$value = editFileField($json, $_GET['field'], $_GET['isNumber']);
	else if(isset($_GET['editDispatch']))
		$value = editDispatchField($json, $_GET['field'], $_GET['isDate']);
	else if(isset($_GET['filesList']))
		$value = getDispatchFiles(null, $json);
	else
		$value = "Not found method";

	//return JSON array
	exit(json_encode($value));
}
?>
