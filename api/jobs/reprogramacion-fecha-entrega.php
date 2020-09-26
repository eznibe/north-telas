<?php

// update delivery date of previsions with % < 4
// cron job: https://www.easycron.com/cron/log/id/2598459

include_once '../../include/headers.php';
include_once '../../include/dbutils.php';
include_once '../../include/main.php';

db_connect();

include_once '../domain/logs.php';

$log->log = 'testing job...';
$log->type = 'job.recalculateDeliveryDate';
$log->user = 'job';

$condition = "p.percentage < 4 AND deletedProductionOn is null AND p.designOnly = false AND p.excludeAutoUpdateDeliveryDate = false";

$query = "SELECT *, DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate FROM previsions p WHERE $condition ORDER BY percentage, week, deliveryDate, orderNumber";
$result = mysql_query($query);
$num_results = mysql_num_rows($result);

$log->log = 'Ejecutando para ' . $num_results . ' previsiones';

$output = "";

$rows = fetch_array($result);
foreach ($rows as $row) {
    $ids .= (isset($ids) ? "," : "") . "'" . $row['id'] . "'";
    $output .= $row['orderNumber'] . "   " . $row['percentage'] . "   " . $row['week'] . "   " . $row['deliveryDate'] . PHP_EOL;
}

if (!isset($_GET['dry'])) {
    
    // update delivery date +1 day
    $update = "UPDATE previsions SET deliveryDate = date_add(deliveryDate, interval 1 day) WHERE id in ($ids)";
    // $update = "UPDATE previsions SET deliveryDate = date_add(deliveryDate, interval 1 day) WHERE id in ('66d25933-0436-45dc-8547-ecdf0d17ed51')";
    
    if(mysql_query($update)) {
        addLog($log);
    } else {
        $log->log = 'ERROR: auto updating deliveryDate'; 
        addLog($log);
    }
    // echo $update;
}

$log->log .= PHP_EOL . PHP_EOL;
$log->log .= 'Nr orden   %   Semana   F.Entrega' . PHP_EOL;
$log->log .= $output;

echo $log->log;
?>