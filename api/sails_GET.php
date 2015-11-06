<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/sails.php';

db_connect();


$expand  = isset($_GET['expand']) ? $_GET['expand'] : null;
$clothId = isset($_GET['clothId']) ? $_GET['clothId'] : null; 


if(isset($_GET['id'])) {
	$value = getSail($_GET['id']);
}
else if(isset($_GET['onedesign'])) {
	$value = getOneDesignSails();
}
else {
	$value = getSails($clothId, $expand);
}

//return JSON array
exit(json_encode($value));
?>
