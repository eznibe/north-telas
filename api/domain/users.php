<?php

function getUsers() {

	$query = "SELECT * FROM usuarios order by country, name";
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

	$query = "SELECT u.newdispatch, u.country FROM usuarios u WHERE u.id = '$id'";
	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$obj->existsNewDispatch = $row['newdispatch'];
		$storedCountry = $row['country'];
		if ($obj->existsNewDispatch) {
			$query = "SELECT max(number) as number FROM dispatchs WHERE country = '$storedCountry'";
			$res = mysql_query($query);
			$maxdispatch = mysql_fetch_array($res, MYSQL_ASSOC);
			$obj->number = $maxdispatch['number'];
			$obj->query = $query;
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

function existsPrevisionsNotify($id) {

	$obj->successful = true;
	$obj->method = 'existsPrevisionsNotify';

	$query = "SELECT u.notifyPrevisions, u.country FROM usuarios u WHERE u.id = '$id'";
	$result = mysql_query($query);

	$obj->existsPrevisionsNotify = false;

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$obj->orders = $row['notifyPrevisions'];
		$obj->existsPrevisionsNotify = isset($row['notifyPrevisions']);
	}

	return $obj;
}

function acceptPrevisionsNotify($user) {

	$obj->successful = true;
	$obj->method = 'acceptPrevisionsNotify';

	$update = "UPDATE usuarios SET notifyPrevisions = null WHERE id = '".$user->id."'";
	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function storePrevisionNotify($user) {
	global $country;

	$obj->successful = true;
	$obj->method = 'storePrevisionNotify';

	$orderNumber = $user->orderNumber;
	$userId = $user->id;

	$query = "SELECT group_concat(id SEPARATOR \"', '\") as ids FROM usuarios
					  WHERE country = '$country' AND role != 'vendedor' AND id != '$userId' GROUP BY country";

	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$userIds = "'" . $row['ids'] . "'";
	}

	if ($user->role !== 'vendedor') {
		// in case the user that made the update is not 'seller' update all non sellers + order seller
		// => get seller of the prevision
		$query = "SELECT u.id FROM previsions p join usuarios u on p.seller = u.code where p.orderNumber = '$orderNumber'";

		$result = mysql_query($query);

		while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
			$userIds .= ", '" . $row['id'] . "'";
		}

	} else {
		// in case the user that made the update is a 'seller', then update all users except other sellers
		// => nothing else should be added
	}

	$update = "UPDATE usuarios
						 SET notifyPrevisions = CASE WHEN notifyPrevisions is null THEN '$orderNumber' ELSE concat(substr(notifyPrevisions, 1, 500),', ','$orderNumber') END
						 WHERE id in ($userIds)";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function loadColumnsState($userId, $type) {

	$type = 'columns.' . $type;

	$query = "SELECT value FROM usersmetadata m WHERE userid = '$userId' AND type = '$type'";
	$result = mysql_query($query);
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		return $row['value'];
	}

	return '';
}

function storeColumnsState($data) {
	global $country;

	$obj->successful = true;
	$obj->method = 'storeColumnsState';

	$userId = $data->userId;

	$isNew = true;
	$type = 'columns.' . $data->type;

	$query = "SELECT * FROM usersmetadata WHERE userid = '$userId'";
	$result = mysql_query($query);
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$isNew = false;
	}

	if ($isNew) {
		$update = "INSERT INTO usersmetadata (userid, type, value)
							 VALUES ('$userId', '$type', '". $data->columnsState ."')";
	} else {
		$update = "UPDATE usersmetadata SET value = '" . $data->columnsState . "' WHERE userid = '$userId' AND type = '$type'";
	}

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function updateCountry($user) {

	$obj->successful = true;
	$obj->method = 'updateCountry';

	$update = "UPDATE usuarios SET country = '".$user->country."' WHERE id = '".$user->id."'";
	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function getPlotterUsers() {
	global $country;

	$query = "SELECT u.name FROM usuarios u join plotters p on lower(p.cuttedBy) = lower(u.name) WHERE u.country = '$country' group by u.name order by u.name";
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

	global $country, $sellerCountry;

	$country = isset($sellerCountry) ? $sellerCountry : $country;

	$query = "SELECT distinct(code) as name FROM usuarios u WHERE code is not null AND u.country = '$country' ORDER BY code";
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
		$query = "UPDATE usuarios SET username = '".$user->username."', password = '".$user->password."', name = '".$user->name."', role = '".$user->role."', country = '".$user->country."', code = $code WHERE id = '".$user->id."'";
		if (! mysql_query($query)) {
			// error en update
			$methodResult = false;
		}
	}
	else {
		// insert
		$query = "INSERT INTO usuarios (id, username, password, name, role, code, country) VALUES ('".$user->id."', '".$user->username."', '".$user->password."', '".$user->name."', '".$user->role."', $code, '".$user->country."')";
		if (! mysql_query($query)) {
			// error en insert
			$methodResult = false;
		}
	}

	return $methodResult;
}

?>
