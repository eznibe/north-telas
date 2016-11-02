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
	global $country;

	$query = "SELECT sailPrefix as sail FROM onedesign o WHERE o.country = '$country' GROUP BY sailPrefix ORDER BY sailPrefix";

	$result = mysql_query($query);

	return fetch_array($result);
}

function updateSailName($sail) {

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
	}

	return $obj;
}

?>
