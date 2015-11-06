<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

function deleteUser($id) {
	
	$methodResult = true;
	
	// delete
	$query = "DELETE FROM usuarios WHERE id = '".$id."'";
	if (! mysql_query($query)) {
		// error en update
		$methodResult = false;
	}

	return $methodResult;
}

if($_SERVER['REQUEST_METHOD'] == 'DELETE') {

	if(isset($_GET['id'])) {

		$response->successful = deleteUser($_GET['id']);

		//return JSON array
		exit(json_encode($response));
	}
}
?>
