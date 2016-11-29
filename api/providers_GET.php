<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/providers.php';

db_connect();


$expand  = isset($_GET['expand']) ? $_GET['expand'] : null;
$clothId = isset($_GET['clothId']) ? $_GET['clothId'] : null;
$country = isset($_GET['country']) ? $_GET['country'] : 'ARG';


if(isset($_GET['id'])) {
	$value = getProvider($_GET['id']);
}
else {
	$value = getProviders($clothId, $expand);
}

//return JSON array
exit(json_encode($value));
?>
