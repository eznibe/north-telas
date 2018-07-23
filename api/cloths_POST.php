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
		$update = "UPDATE cloths SET name = '".$cloth->name."', stockMin = ".$cloth->stockMin.", 
					groupId = '".$cloth->groupId."', arancelary = '".$cloth->arancelary."'  
					WHERE id = '".$cloth->id."'";

		if(mysql_query($update))
			$obj->successful = true;
	}
	else {
		// insert
		$groupId = $cloth->groupId ? "'".$cloth->groupId."'" : 'null';

		$matchId = uniqid();

		$insert = "INSERT INTO cloths (id, name, stockMin, groupId, matchClothId, country, arancelary) VALUES ('".$cloth->id."', '".$cloth->name."', '".$cloth->stockMin."', $groupId, '$matchId', '$country', '".$cloth->arancelary."')" ;

		if(mysql_query($insert)) {
			$obj->successful = true;
			$obj->isNew = true;

			// NOT NEEDED ANYMORE to create cloth in the other country too
			// $otherCountry = $country == 'ARG' ? 'BRA' : 'ARG';
			// $insert = "INSERT INTO cloths (id, name, stockMin, groupId, matchClothId, country) VALUES ('".uniqid()."', '".$cloth->name."', '".$cloth->stockMin."', $groupId, '$matchId', '$otherCountry')" ;
			//
			// if(!mysql_query($insert)) {
			// 	$obj->successful = false;
			// 	$obj->insert = $insert;
			// }
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
	else if(isset($_GET['copy'])) {
		$value = copyCloth($json, $_GET['clothCountry']);
	}
	else {
		$value = saveCloth($json);
	}

	//return JSON array
	exit(json_encode($value));
}
?>
