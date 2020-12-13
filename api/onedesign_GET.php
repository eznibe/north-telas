<?php

// Get list of all users or one in particualr if the id is given

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

include_once 'domain/boats.php';

db_connect();



$expand  = isset($_GET['expand']) ? $_GET['expand'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : null;


if(isset($_GET['modelNextSerie'])) {
	$value = calculateOneDesignModelSerie($_GET['boat'], $_GET['sail']);
} 
else if(isset($_GET['modelPrevisions'])) {
	$value = getOneDesignModelPrevisions($_GET['boat'], $_GET['sail'], $_GET['onlyAvailables'], $_GET['onlyAssigned'], $_GET['onlyArchived'], true);
}
else if(isset($_GET['modelMeasurements'])) {
	$value = getOneDesignModelMeasurements($_GET['modelId']);
}
else if(isset($_GET['modelItems'])) {
	$value = getOneDesignModelItems($_GET['modelId']);
}
else if(isset($_GET['onedesignmodels'])) {
	$value = getOneDesignModels($_GET['model'], $_GET['skipLoadPrevisions'], $_GET['boat'], $_GET['sail']);
}
else if(isset($_GET['onedesignmodelsHistoric'])) {
	$value = getOneDesignModelsHistoric();
}
else if(isset($_GET['onedesignmodelsHistoricByModel'])) {
	$value = getOneDesignModelsHistoricByModel($_GET['boat'], $_GET['sail'], $_GET['year']);
}

//return JSON array
exit(json_encode($value));
?>
