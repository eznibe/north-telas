<?php

function executeQuery($query) {

	$query = str_replace("\\", "", $query) ;

	if($result = mysql_query($query)) {

		return fetch_array($result);
	}

	return $query;
}


function executeUpdate($query) {

	$query = str_replace("\\", "", $query) ;

	$tok = strtok($query, ";");

	while ($tok !== false) {
	    $result = mysql_query($tok);
	    $tok = strtok(";");
	}

	return $result;
}

function executePostUpdate($payload) {

	$query = str_replace("\\", "", $payload->query) ;

	$tok = strtok($query, ";");

	while ($tok !== false) {
	    $result = mysql_query($tok);
	    $tok = strtok(";");
	}

	return $result;
}

?>
