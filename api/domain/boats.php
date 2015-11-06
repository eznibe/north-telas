<?php

function getBoats() {

	$prevBoat="";
	$prevSufix="";

	$query = "SELECT od.*, b.id as boatId FROM onedesign od join boats b on b.boat = od.boat ORDER BY boat, sailPrefix";

	$result = mysql_query($query);

	$boats = array(); $cloths = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		if($prevBoat == "" || $prevBoat != $row['boat']) {

			$boat = new stdClass();
			$boat->boat = $row['boat'];
			$boat->boatId = $row['boatId'];

			array_push($boats, $boat);

			$prevBoat = $row['boat'];
			$prevSufix="";

			$type = array();

			if(!isset($type[$row['sailPrefix']]))
				$type[$row['sailPrefix']] = array();


			$cloth = new stdClass();
			$cloth->id = $row['clothId'];
			$cloth->mts = $row['mts'];

			array_push($type[$row['sailPrefix']], $cloth);

			$boat->cloths = $type;
		}
		else {
			if(!isset($type[$row['sailPrefix']]))
				$type[$row['sailPrefix']] = array();

			$cloth = new stdClass();
			$cloth->id = $row['clothId'];
			$cloth->mts = $row['mts'];

			array_push($type[$row['sailPrefix']], $cloth);

			$boat->cloths = $type;
		}
	}

	return $boats;
}


function getOneDesignBoats() {

	$query = "SELECT boat FROM onedesign GROUP BY boat ORDER BY boat";

	$result = mysql_query($query);

	$boats = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$query = "SELECT sailPrefix as sail FROM onedesign WHERE boat = '".$row['boat']."' GROUP BY sail ORDER BY sail";

		$resultsails = mysql_query($query);

		$sails = array();
		while($rowSail = mysql_fetch_array($resultsails, MYSQL_ASSOC)) {
			$sail = new stdClass();
			$sail->sail = $rowSail['sail'];

			// default cloths of every sail
			$query = "SELECT o.*, c.name FROM onedesign o JOIN cloths c on c.id = o.clothId WHERE boat = '".$row['boat']."' AND sailPrefix = '".$rowSail['sail']."' ORDER BY c.name";

			$resultcloths = mysql_query($query);

			$cloths = array();
			while($rowCloth = mysql_fetch_array($resultcloths, MYSQL_ASSOC)) {
				$cloth = new stdClass();
				$cloth->clothId = $rowCloth['clothId'];
				$cloth->name = $rowCloth['name'];
				$cloth->mts = $rowCloth['mts'];
				$cloth->odId = $rowCloth['id'];

				array_push($cloths, $cloth);
			}

			$sail->cloths = $cloths;

			array_push($sails, $sail);
		}

		$boat = new stdClass();
		$boat->boat = $row['boat'];
		$boat->uiId = uniqid();
		$boat->sails = $sails;

		array_push($boats, $boat);
	}

	return $boats;
}

function saveOneDesign($onedesign) {

	$obj->successful = true;

	$query = "INSERT INTO onedesign VALUES ('".$onedesign->id."', '".$onedesign->boat."', '".$onedesign->sail."', '".$onedesign->clothId."', ".$onedesign->mts.")";
	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}
	else {
		$query = "SELECT o.*, o.sailPrefix as sail, c.name as cloth FROM onedesign o JOIN cloths c on c.id = o.clothId WHERE o.id = '".$onedesign->id."'";

		$result = mysql_query($query);

		$rows = fetch_array($result);

		$obj->onedesign = new stdClass();
		$obj->onedesign = $rows[0];
	}

	return $obj;
}

function updateBoatName($boat) {

	$obj->successful = true;

	if(!isset($boat->boat) || $boat->boat=="") {

		$obj->successful = false;
		$obj->oldName = $boat->oldName;
		return $obj;
	}

	$query = "UPDATE onedesign SET boat = '".$boat->boat."' WHERE boat = '".$boat->oldName."'";
	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function deleteOneDesignCloth($odId) {

	$obj->successful = true;

	$query = "DELETE FROM onedesign WHERE id = '$odId'";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function deleteOneDesignBoat($boat) {

	$obj->successful = true;

	$query = "DELETE FROM onedesign WHERE boat = '$boat'";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function getOneDesignCloths($boat, $sail) {

	$query = "SELECT * FROM onedesign WHERE boat = '$boat' AND sailPrefix = '$sail'";

	$result = mysql_query($query);

	return fetch_array($result);
}

?>
