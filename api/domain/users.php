<?php

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

function existsNewDispatch($id) {

	$obj->successful = true;
	$obj->method = 'existsNewDispatch';

	$query = "SELECT u.newdispatch FROM usuarios u WHERE u.id = '$id'";
	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$obj->existsNewDispatch = $row['newdispatch'];
		if ($obj->existsNewDispatch) {
			$query = "SELECT max(number) as number FROM dispatchs";
			$res = mysql_query($query);
			$maxdispatch = mysql_fetch_array($res, MYSQL_ASSOC);
			$obj->number = $maxdispatch['number'];
		}
	}

	return $obj;
}

function acceptNewDispatch($user) {

	$obj->successful = true;
	$obj->method = 'acceptNewDispatch';

	$update = "UPDATE usuarios SET newdispatch = false WHERE id = '".$user->id."'";
	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

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

?>
