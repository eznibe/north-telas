<?php

function getSails($groupId) {

	$query = "SELECT distinct (s.id), s.*, f.value as valueF1, f.value2 as valueF2, f.type as typeF1, f.fields as fieldsF1, f.rizo
						FROM sails s
						LEFT JOIN formulas f on s.formulaId = f.id
						WHERE s.sailGroupId = $groupId
						ORDER BY s.id, description";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getSailGroups() {

	$query = "SELECT * FROM sailgroups ORDER BY id";

	$result = mysql_query($query);

	return fetch_array($result);
}


function getOneDesignSails() {
	global $country, $storedCountry;

	$where = "";
	if (isset($storedCountry)) {
		$where = " WHERE country = '$storedCountry' ";
	}

	$query = "SELECT sailPrefix as sail FROM onedesign o $where GROUP BY sailPrefix ORDER BY sailPrefix";

	$result = mysql_query($query);

	return fetch_array($result);
}

function updateSailName($sail) {

	global $country;

	$obj->successful = true;

	if(!isset($sail->sail) || $sail->sail=="") {

		$obj->successful = false;
		$obj->oldName = $sail->oldName;
		return $obj;
	}

	$query = "UPDATE onedesign SET sailPrefix = '".$sail->sail."' WHERE sailPrefix = '".$sail->oldName."'";
	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	} else {
		$queryModel = "SELECT * FROM onedesignmodels WHERE boat = '".$sail->boat."' and sail = '".$sail->sail."' and country = '$country'";
		
		$result = mysql_query($queryModel);
		
		if (mysql_num_rows($result) == 0 || $sail->sail == $sail->oldName) {
			// also update onedesignmodels with the same sail name if the combination boat/sail doesn't exists yet
			$query = "UPDATE onedesignmodels SET sail = '".$sail->sail."' WHERE sail = '".$sail->oldName."'";
			mysql_query($query);
		} else {
			// the combination boat/sail already exists => merge them
			$query = "DELETE FROM onedesignmodels WHERE sail = '".$sail->oldName."'";
			mysql_query($query);
		}

		// the previsions are always updated with the new name
		$query = "UPDATE previsions SET sailOneDesign = '".$sail->sail."' WHERE sailOneDesign = '".$sail->oldName."'";
		mysql_query($query);

		$log->type = 'info.updateSailName';
		$log->log = json_encode($sail);
		$log->user = "backend";
		addLog($log);
	}

	return $obj;
}

function updateSailDesignMinutes($sail) {

	$obj->successful = true;

	$query = "UPDATE sails SET designMinutes = ".$sail->designMinutes." WHERE id = '".$sail->id."'";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

?>
