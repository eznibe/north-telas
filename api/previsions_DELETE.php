<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

function deletePrevision($id) {
	
	$obj->successful = true;
	
	// delete
	$query = "DELETE FROM previsionCloth WHERE previsionId = '".$id."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	$query = "DELETE FROM previsions WHERE id = '".$id."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	return $obj;
}

if($_SERVER['REQUEST_METHOD'] == 'DELETE') {

	if(isset($_GET['id'])) {

		$response = deletePrevision($_GET['id']);

		//return JSON array
		exit(json_encode($response));
	}
}
?>
