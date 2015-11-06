<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/plotters.php';

db_connect();


$cutted = isset($_GET['cutted']) ? $_GET['cutted'] : 'false';
$clothId = isset($_GET['clothId']) ? $_GET['clothId'] : null;

if(isset($_GET['search'])) {
	$value = getPlotters($clothId, null, $_GET['search'], null);
}
else {
	$value = getPlotters($clothId, $cutted, null, null);
}

//return JSON array
exit(json_encode($value));
?>
