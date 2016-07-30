<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

function getUser($user, $passw)
{

	$query = "SELECT * FROM usuarios WHERE username = '$user' AND password = '$passw'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	if ($num_results != 0)
	{
		$row = mysql_fetch_array($result);

		$obj->successful = true;
		$obj->role = $row['role'];
		$obj->sellerCode = $row['code'];
	}
	else {
		$obj->successful = false;
	}

	$obj->user = $user;

	return $obj;
}

if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	$value = getUser($json->user, $json->passw);

	//return JSON array
	exit(json_encode($value));
}
?>
