<?php

// Get list of all users or one in particular if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/boats.php';

db_connect();


$expand  = isset($_GET['expand']) ? $_GET['expand'] : null;
$clothId = isset($_GET['clothId']) ? $_GET['clothId'] : null; 


if(isset($_GET['id'])) {
	$value = getBoat($_GET['id']);
}
else if(isset($_GET['onedesign'])) {
	$value = getOneDesignBoats($_GET['onedesign']);
}
else if(isset($_GET['onedesignCloths'])) {
	$value = getOneDesignCloths($_GET['boat'], $_GET['sail']);
}
else {
	$value = getBoats();
}

//return JSON array
exit(json_encode($value));
?>
