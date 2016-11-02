<?php

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/cloths.php';

db_connect();

function saveCloth($cloth)
{
	global $country;
	
	$query = "SELECT * FROM cloths c WHERE c.id = '".$cloth->id."'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	$obj->successful = false;

	if ($num_results != 0)
	{
		// update
		$update = "UPDATE cloths SET name = '".$cloth->name."', stockMin = ".$cloth->stockMin.", groupId = '".$cloth->groupId."' WHERE id = '".$cloth->id."'";

		if(mysql_query($update))
			$obj->successful = true;
	}
	else {
		// insert
		$groupId = $cloth->groupId ? "'".$cloth->groupId."'" : 'null';

		$insert = "INSERT INTO cloths (id, name, stockMin, groupId, country) VALUES ('".$cloth->id."', '".$cloth->name."', '".$cloth->stockMin."', $groupId, '$country')" ;

		if(mysql_query($insert)) {
			$obj->successful = true;
			$obj->isNew = true;
		}
	}

	$obj->cloth = $cloth;

	return $obj;
}



if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['dolar'])) {
		$value = saveDolar($json);
	}
	else if(isset($_GET['pctNac'])) {
		$value = savePctNac($json);
	}
	else {
		$value = saveCloth($json);
	}

	//return JSON array
	exit(json_encode($value));
}
?>
