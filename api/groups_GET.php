<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/groups.php';

db_connect();


$expand  = isset($_GET['expand']) ? $_GET['expand'] : null;

if(isset($_GET['id'])) {
	$value = getGroup($_GET['id'], $expand);
}
else {
	$value = getGroups($expand);
}

//return JSON array
exit(json_encode($value));
?>
