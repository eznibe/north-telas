<?php

function fetch_array($result) {
	
	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
			
		array_push($rows, $row);
	}

	return $rows;
}

?>
