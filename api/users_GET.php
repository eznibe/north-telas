<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

function getUsers()
{

	$query = "SELECT * FROM usuarios order by name";
	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		array_push($rows, $row);
	}

	return $rows;
}

function getUser($id) {

	$query = "SELECT * FROM usuarios WHERE id = '$id'";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		return $row;
	}

	header('HTTP/1.1 404 Not Found', true, 404);

	$obj->error = "Not found";
	return $obj;
}

function getPlotterUsers()
{

	$query = "SELECT u.name FROM usuarios u join plotters p on lower(p.cuttedBy) = lower(u.name) group by u.name order by u.name";
	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		array_push($rows, $row);
	}

	return $rows;
}

function getRoles() {

	$query = "SELECT * FROM roles ORDER BY id";
	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		array_push($rows, $row);
	}

	return $rows;
}

function getSellerCodes() {

	$query = "SELECT distinct(code) as name FROM usuarios WHERE code is not null ORDER BY code";
	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		array_push($rows, $row);
	}

	return $rows;
}


if(isset($_GET['id'])) {
	$value = getUser($_GET['id']);
}
else if(isset($_GET['roles'])) {
	$value = getRoles();
}
else if(isset($_GET['plotter'])) {
	$value = getPlotterUsers();
}
else if(isset($_GET['sellerCodes'])) {
	$value = getSellerCodes();
}
else {
	$value = getUsers();
}

//return JSON array
exit(json_encode($value));
?>
