<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

function saveDjai($djai)
{

	$query = "SELECT * FROM djais d WHERE d.number = '".$djai->number."'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	$obj->successful = false;
	$obj->isNew = false;

	if ($num_results != 0)
	{
		// update (no fields for the moment to update)
		
//		if(mysql_query($update))
			$obj->successful = true;
	}
	else {
		// insert
		foreach ($djai->cloths as $cloth) {

			$insert = "INSERT INTO djais VALUES ('".$cloth->djaiId."', '".$djai->number."', curdate(), '".$cloth->amount."', '".$cloth->id."')" ;

			if(mysql_query($insert)) {
				$obj->successful = true;
				$obj->isNew = true;
			}
		}
	}

	if($obj->successful && !$obj->isNew) {
		handleCloths($djai, $rows, $obj);
	}

	$obj->djai = $djai;

	return $obj;
}

function handleCloths($djai, $currentDjais, $obj) {

	$obj->successfulCloths = true;

	foreach ($djai->cloths as $cloth) {

		$exists = existsCloth($cloth, $currentDjais);

		if($exists) {
			// update c
			$query = "UPDATE djais SET clothId = '".$cloth->id."', amount = ".$cloth->amount." WHERE id = '".$cloth->djaiId."'";
		}
		else {
			// insert c
			$query = "INSERT INTO djais VALUES ('".$cloth->djaiId."', '".$djai->number."', null, '".$cloth->amount."', '".$cloth->id."')";
		}

var_dump("debug (exists $exists) check: ".$query);

		if($query && !mysql_query($query)) {
			$obj->successfulCloths = false;
		}
	}

	// check to remove deleted cloth
	foreach ($currentDjais as $row) {

		$found=false;
		foreach ($djai->cloths as $cloth) {

			if(isset($row['id']) && $row['id'] == $cloth->djaiId)
				$found=true;
		}

		if(!$found) {
			$query = "DELETE from djais where id = '".$row['id']."'";

			if(!mysql_query($query)) {
				$obj->successfulCloths = false;
			}
		}
	}
}

function existsCloth($cloth, $currentDjais) {

	foreach ($currentDjais as $row) {
		if($row['clothId'] == $cloth->id) {
			return true;
		}
	}

	return false;
}


if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	$value = saveDjai($json);

	//return JSON array
	exit(json_encode($value));
}
?>
