<?php

include_once 'cloths.php';

function getGroup($groupId, $expand)
{

	$query = "SELECT * FROM groups g WHERE g.id = '".$groupId."' ORDER BY g.name";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$row['cloths'] = getCloths($groupId, $expand);
		return $row;
	}

	header('HTTP/1.1 404 Not Found', true, 404);

	$obj->error = "Not found";
	return $obj;
}

function getGroups($expand)
{

	$query = "SELECT * FROM groups g ORDER BY g.id";
	$result = mysql_query($query);

	if($expand=='FULL') {

		$rows = array();
		while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

			$row['cloths'] = getCloths($row['id'], $expand);

			array_push($rows, $row);
		}

		return $rows;
	}
	if($expand=='WITH_ROLLS') {

		$rows = array();
		while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

			$row['cloths'] = getCloths($row['id'], $expand);

			array_push($rows, $row);
		}

		return $rows;
	}

	return fetch_array($result);
}

function saveGroup($group) {

	$obj->successful = true;
	$obj->isNew = !isset($group->id);


	if($obj->isNew) {

		$query = "SELECT max(id) as maxid FROM groups";
		$result = mysql_query($query);

		$num_results = mysql_num_rows($result);

		$rows = fetch_array($result);
		
		if ($num_results > 0) { // unique result
			$group->id = $rows[0]['maxid'] + 1;
		}

		// insert new group
		$insert = "INSERT INTO groups VALUES ('".$group->id."', '".$group->name."')" ;

		if(!mysql_query($insert)) {
			$obj->successful = false;
			$obj->insert = $insert;
		}
	}
	else {
		$update = "UPDATE groups SET name = '".$group->name."' WHERE id = '".$group->id."'";

		if(!mysql_query($update)) {
			$obj->successful = false;

		}
		$obj->update = $update;
	}

	$obj->group = $group;

	return $obj;
}

?>
