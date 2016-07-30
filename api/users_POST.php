<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

function addOrUpdateUser($user) {

	$methodResult = true;

	if(isset($user->id)) $id = $user->id; else $id = 'notexistent';

	$query = "SELECT * FROM usuarios WHERE id = '".$id."'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	$code = isset($user->code) ? "'".$user->code."'" : 'null' ;

	if ($num_results != 0)
	{
		// update
		$query = "UPDATE usuarios SET username = '".$user->username."', password = '".$user->password."', name = '".$user->name."', role = '".$user->role."', code = $code WHERE id = '".$user->id."'";
		if (! mysql_query($query)) {
			// error en update
			$methodResult = false;
		}
	}
	else {
		// insert
		$query = "INSERT INTO usuarios (id, username, password, name, role, code) VALUES ('".$user->id."', '".$user->username."', '".$user->password."', '".$user->name."', '".$user->role."', $code)";
		if (! mysql_query($query)) {
			// error en insert
			$methodResult = false;
		}
	}

	return $methodResult;
}

if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$user = json_decode($request_payload);

	//var_dump($user);


	$response->successful = addOrUpdateUser($user);

	//return JSON array
	exit(json_encode($response));
}
?>
