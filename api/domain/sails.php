<?php

function getSails($groupId) {

	$query = "SELECT distinct (s.id), s.*, f1.value as valueF1, f1.type as typeF1, f1.fields as fieldsF1, f1.split as splitF1, f2.value as valueF2, f2.fields as fieldsF2, f2.type as typeF2, f2.split as splitF2 ".
		 "FROM sails s LEFT JOIN formulas f1 on s.formulaLower44Id = f1.id LEFT JOIN formulas f2 on s.formulaGreater44Id = f2.id ".
		 "WHERE s.sailGroupId = $groupId ".
		 "ORDER BY s.id, description";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getSailGroups() {

	$query = "SELECT * FROM sailgroups ORDER BY id";

	$result = mysql_query($query);

	return fetch_array($result);
}


function getOneDesignSails() {

	$query = "SELECT sailPrefix as sail FROM onedesign o GROUP BY sailPrefix ORDER BY sailPrefix";

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
