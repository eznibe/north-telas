<?php

include_once 'rolls.php';
include_once 'logs.php';

//-- Statuses: TO_BUY, TO_CONFIRM, IN_TRANSIT, ARRIVED, DELETED

function getOrders($status, $providerId, $expand) {
	return getOrdersUpToDate($status, $providerId, $expand, null);
}

function getOrdersUpToDate($status, $providerId, $expand, $upToDate)
{
	global $country;

	$providerCondition = "";
	if(isset($providerId)) {
		$providerCondition = " AND o.providerId = '$providerId'";
	}

	$upToDateCondition = "";
	if(isset($upToDate)) {
		$upToDateCondition = " AND inTransitDate is not null AND inTransitDate <= STR_TO_DATE('".$upToDate."', '%d-%m-%Y')
													 AND
													 (
														 (arriveDate is null and o.status = 'IN_TRANSIT')
														 OR
														 (STR_TO_DATE('".$upToDate."', '%d-%m-%Y') <= arriveDate and o.status = 'ARRIVED')
													 ) ";
	}

	if(isset($status) && !isset($upToDate)) {
		$queryGral = "SELECT *, DATE_FORMAT(orderDate,'%d-%m-%Y') as formattedDate, arriveDate as unformattedArriveDate, DATE_FORMAT(arriveDate,'%d-%m-%Y') as arriveDate, DATE_FORMAT(estimatedArriveDate,'%d-%m-%Y') as estimatedArriveDate FROM orders o
									WHERE o.status = '$status' AND o.country = '$country' $providerCondition $upToDateCondition ORDER BY -o.estimatedArriveDate desc, o.orderDate";
	}
	else {
		$queryGral = "SELECT *, DATE_FORMAT(orderDate,'%d-%m-%Y') as formattedDate, arriveDate as unformattedArriveDate, DATE_FORMAT(arriveDate,'%d-%m-%Y') as arriveDate, DATE_FORMAT(estimatedArriveDate,'%d-%m-%Y') as estimatedArriveDate FROM orders o
									WHERE 1=1 AND o.country = '$country' $providerCondition $upToDateCondition ORDER BY -o.estimatedArriveDate desc, o.orderDate";
	}

	$result = mysql_query($queryGral);

	$rows = array();
	while($orderRow = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$query = "SELECT pt.*, op.*, c.*, pr.name as provider ".
			 "FROM products pt JOIN orderproduct op on pt.productId = op.productId JOIN cloths c on c.id = pt.clothId JOIN providers pr on pr.id = pt.providerId ".
			 "WHERE op.orderId = '".$orderRow['orderId']."'";

		$subresult = mysql_query($query);

		$subrows = array();
		while($subrow = mysql_fetch_array($subresult, MYSQL_ASSOC)) {
			array_push($subrows, $subrow);

			$provider = $subrow['provider'];
		}

		$orderRow['products'] = $subrows;
		if(isset($provider)) {
			$orderRow['provider'] = $provider;
		}

		$orderRow['query'] = $queryGral;

		array_push($rows, $orderRow);
	}

	return $rows;
}

function getInTransit($clothId) {
	return getInTransitUpToDate($clothId, null);
}

function getInTransitUpToDate($clothId, $upToDate) {

	$result = array();
	$orders = getOrdersUpToDate('IN_TRANSIT', null, 'FULL', $upToDate);

	foreach ($orders as $order) {
		foreach ($order['products'] as $product) {

			if($product['clothId'] == $clothId) {
				array_push($result, $order);
			}
		}
	}

	return $result;
}

function getToBuy($clothId) {

	$result = array();
	$addedOrders = array();
	$orders = array_merge(getOrdersUpToDate('TO_BUY', null, 'FULL', null), getOrdersUpToDate('TO_CONFIRM', null, 'FULL', null));

	foreach ($orders as $order) {
		foreach ($order['products'] as $product) {

			if($product['clothId'] == $clothId && !in_array($order['orderId'], $addedOrders)) {
				array_push($result, $order);
				array_push($addedOrders, $order['orderId']);
			}
		}
	}

	return $result;
}


function getOrder($id) {

	$query = "SELECT *, DATE_FORMAT(orderDate,'%d-%m-%Y') as formattedDate FROM orders WHERE id = '$id'";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		return $row;
	}

	header('HTTP/1.1 404 Not Found', true, 404);

	$obj->error = "Not found";
	return $obj;
}

// Compra a un provider, genera orden (usado en buy_POST)
function buy($provider)
{
	global $country;
	$obj->successful = false;
	$obj->isNew = false;
	$obj->method = 'buy';

	// search order in BUY status for same provider -> if no exists create new order
	$query = "SELECT o.orderId FROM orders o WHERE o.status = 'TO_BUY' and o.providerId = '".$provider->providerId."'";
	$result = mysql_query($query);

	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	if ($num_results > 0) { // unique result
		$orderId = $rows[0]['orderId'];
		$obj->successful = true;
	}
	else {
		$orderId = uniqid();
		// no order for the provider
		$insert = "INSERT INTO orders (orderId, orderDate, estimatedArriveDate, arriveDate, invoiceNumber, status, type, providerId, description, deliveryType, dolar, country)
							 VALUES ('$orderId', null, null, null, null, 'TO_BUY', null, '".$provider->providerId."', null, 'Desconocido', ".$provider->dolar.", '$country')" ;

		if(mysql_query($insert)) {
			$obj->successful = true;
			$obj->isNew = true;
			$obj->insert = $insert;
		}
		else {
			$obj->insert = $insert;
		}
	}

	// insert order product
	$insert = "INSERT INTO orderproduct (opId, orderId, productId, amount, price, temporary)
			   VALUES ('".$provider->opId."', '".$orderId."', '".$provider->productId."', ".$provider->amount.", '".$provider->price."', false)" ;

	if(mysql_query($insert)) {
		$obj->successfulOP = true;
	}

	$obj->provider = $provider;

	return $obj;
}

// Compra a un provider, lo asigna como nueva tela en la orden ya existente
function assignProduct($provider, $orderId)
{
	$obj->successful = false;
	$obj->isNew = false;

	// search cloth in the order -> if no exists create add new order product
	$query = "SELECT op.opId FROM orderproduct op WHERE op.orderId = '$orderId' and op.productId = '".$provider->productId."'";
	$result = mysql_query($query);

	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	if ($num_results > 0) { // unique result
		// we need to add the new amount to the same cloth already in the order
		$opId = $rows[0]['opId'];

		$update = "UPDATE orderproduct SET amount = (amount + ".$provider->amount.") WHERE opId = '$opId'";

		if(mysql_query($update)) {
			$obj->successful = true;
		}
		else {
			$obj->update = $update;
		}
	}
	else {
		$opId = uniqid();

		$insert = "INSERT INTO orderproduct (opId, orderId, productId, amount, price, temporary)
					VALUES ('$opId', '$orderId', '".$provider->productId."', ".$provider->amount.", ".$provider->price.", false)" ;

		if(mysql_query($insert)) {
			$obj->successful = true;
			$obj->isNew = true;
		}
		else {
			$obj->insert = $insert;
		}
	}

	$obj->provider = $provider;

	return $obj;
}

function changeStatus($order)
{
	$obj->successful = false;

	// search order in BUY status for same provider -> if no exists create new order
	$query = "SELECT o.orderId, o.status FROM orders o WHERE o.orderId = '".$order->orderId."'";
	$result = mysql_query($query);

	$rows = fetch_array($result); // unique result

	$orderRow = $rows[0];

	$extraSet = "";

	$updatedRolls = array();

	// update the status
	if($orderRow['status'] == 'TO_BUY') {
		$newStatus = 'TO_CONFIRM';
		$extraSet = ", orderDate = CURDATE() ";
	}
	else if($orderRow['status'] == 'TO_CONFIRM') {
		$newStatus = 'IN_TRANSIT';
		$extraSet = ", inTransitDate = CURDATE() ";
	}
	else if($orderRow['status'] == 'IN_TRANSIT') {
		$newStatus = 'ARRIVED';
		$extraSet = ", arriveDate = STR_TO_DATE('".$order->arriveDate."', '%d-%m-%Y') ";

		// if arrived -> update rolls to incoming=false
		foreach ($order->products as $product) {
			$result = arriveRolls($order->orderId, $product->productId, $product->temporary);
			array_push($updatedRolls, $result);
		}
	}

	$update = "UPDATE orders SET status = '$newStatus' $extraSet WHERE orderId = '".$orderRow['orderId']."'" ;

	if(mysql_query($update)) {
		$obj->successful = true;
	}


	$query = "SELECT *, DATE_FORMAT(o.orderDate,'%d-%m-%Y') as formattedDate FROM orders o WHERE o.orderId = '".$order->orderId."'";
	$result = mysql_query($query);
	$rows = fetch_array($result); // unique result

	$order->status = $newStatus;
	$order->orderDate = $rows[0]['orderDate'];
	$order->formattedDate = $rows[0]['formattedDate'];

	$obj->order = $order;

	$obj->updatedRolls = $updatedRolls;

	return $obj;
}

function updateInfo($order) {

	$obj->successful = false;
	$obj->method = 'updateInfo';

	if(isset($order->invoiceNumber)) $invoice = "'".$order->invoiceNumber."'"; else $invoice = "null";
	if(isset($order->type)) $type = "'".$order->type."'"; else $type = "null";
	if(isset($order->description)) $description = "'".$order->description."'"; else $description = "null";
	if(isset($order->deliveryType)) $deliveryType = "'".$order->deliveryType."'"; else $deliveryType = "null";
	if(isset($order->arriveDate) && $order->arriveDate!='') $arriveDate = "STR_TO_DATE('".$order->arriveDate."', '%d-%m-%Y')"; else $arriveDate = "null";
	if(isset($order->estimatedArriveDate) && $order->estimatedArriveDate!='') $estimatedArriveDate = "STR_TO_DATE('".$order->estimatedArriveDate."', '%d-%m-%Y')"; else $estimatedArriveDate = "null";
	if(isset($order->dispatch)) $dispatch = "'".$order->dispatch."'"; else $dispatch = "null";
	if(isset($order->dolar) && $order->dolar!='') $dolar = $order->dolar; else $dolar = "null";


	$update = "UPDATE orders SET invoiceNumber = $invoice, type = $type, description = $description, deliveryType = $deliveryType, arriveDate = $arriveDate, estimatedArriveDate = $estimatedArriveDate, dispatch = $dispatch, dolar = $dolar WHERE orderId = '".$order->orderId."'" ;

	if(mysql_query($update)) {
		$obj->successful = true;
	} else {
		$obj->update = $update;
	}

	return $obj;
}

function updateProductAmount($product) {

	$obj->successful = true;
	$obj->method = 'updateProductAmount';

	$update = "UPDATE orderproduct SET amount = $product->amount WHERE opId = '".$product->opId."'" ;

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function updateProduct($product) {

	$obj->successful = true;
	$obj->method = 'update.orderproduct';

	$temporary = isset($product->temporary) && $product->temporary ? 'true' : 'false';

	$update = "UPDATE orderproduct SET amount = $product->amount, temporary = $temporary ".
			  "WHERE opId = '".$product->opId."'" ;

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;		

		$log->type = $obj->method . " - failed";
	} else {
		$log->type = $obj->method;
	}

	
	$log->log = json_encode($product);
	$log->user = "backend";
	addLog($log);

	return $obj;
}

// validate if the order is ready for next status
//	- que ninguna tela se pase del monto de mts pedido en la asignacion de rollos
function validate($order) {

	$obj->valid = true;

	if($order->status=='IN_TRANSIT') {

		$query = "SELECT op.productId, sum(op.amount)/count(*) as amount, if(sum(r.mtsOriginal) is null, 0, sum(r.mtsOriginal)) as sumMtsRolls  FROM orders o JOIN orderproduct op on op.orderId=o.orderId LEFT JOIN rolls r on r.productId=op.productId WHERE o.orderId = '".$order->orderId."' GROUP BY op.productId";
		$result = mysql_query($query);

		$rows = fetch_array($result); // unique result

		foreach ($rows as $product) {

			if($product['amount'] > $product['sumMtsRolls']) {
				// at least one product buyed more than what is setted in rolls
				$obj->valid = false;
			}
		}
	}

	return $obj;
}


function getClothOrders($startDate, $endDate, $clothId, $invoiceNumber, $providerName, $groupName) {

	global $country;

	// all cloths between dates
	$condition  = " AND STR_TO_DATE('$startDate', '%d-%m-%Y') <= o.arriveDate AND STR_TO_DATE('$endDate', '%d-%m-%Y') >= o.arriveDate ";

	$condition .= isset($clothId) ? " AND c.id = '$clothId'" : " AND c.country = '$country'";

	$condition .= isset($invoiceNumber) ? " AND o.invoiceNumber like '$invoiceNumber%'" : '';

	$condition .= isset($providerName) ? " AND prov.name like '$providerName'" : '';

	$condition .= isset($groupName) ? " AND gr.name like '$groupName'" : '';

	$query = "SELECT *, SUM(r.mtsOriginal) as sumMts,
											DATE_FORMAT(o.arriveDate,'%d-%m-%Y') as formattedDate,
											prov.name as provider,
											c.name as name
		FROM cloths c
		JOIN groups gr on gr.id = c.groupId
		JOIN products pr on pr.clothId = c.id
		JOIN providers prov on prov.id = pr.providerId
		JOIN orderproduct op on op.productId = pr.productId
		JOIN orders o on o.orderId = op.orderId
		JOIN rolls r on (r.orderId = o.orderId and r.productId = pr.productId)
		WHERE o.status = 'ARRIVED' $condition
		GROUP BY c.id, o.orderId, o.arriveDate
		ORDER BY o.arriveDate desc, c.name";

	$result = mysql_query($query);

	$rows = fetch_array($result);

	$orders = array();
	foreach ($rows as $order) {

		$subquery = "SELECT *
			FROM rolls r
			WHERE r.orderId = '".$order['orderId']."' AND r.productId = '".$order['productId']."'";
		$result = mysql_query($subquery);

		$subrows = fetch_array($result);

		$order['rolls'] = $subrows;

$order['bigquery']  = $query;

		array_push($orders, $order);
	}

	return $orders;
}

function deleteOrder($orderId) {

	$response->successful = true;
	$response->method = 'deleteOrder';

	$query = "DELETE FROM orderproduct WHERE orderId = '$orderId'";
	if(!mysql_query($query)) {
		$response->successful = false;
		$response->delete = $query;
	}

	$query = "DELETE FROM rolls WHERE orderId = '$orderId'";
	if(!mysql_query($query)) {
		$response->successful = false;
		$response->delete = $query;
	}


	$query = "SELECT * FROM orders o join orderproduct op on o.orderId=op.orderId WHERE o.orderId = '$orderId'";
	$result = mysql_query($query);

	$rows = fetch_array($result);

	if(count($rows)==0) {

		$query = "DELETE FROM orders WHERE orderId = '$orderId'";
		if(!mysql_query($query)) {
			$response->successful = false;
			$response->delete = $query;
		}
		else {
			$response->orderDeleted = true;
		}
	}

	return $response;
}

function deleteOrderProduct($opId, $orderId, $productId) {

	$response->successful = true;

	$query = "DELETE FROM orderproduct WHERE opId = '$opId'";
	if(!mysql_query($query)) {
		$response->successful = false;
		$response->delete = $query;
	}

	$query = "DELETE FROM rolls WHERE productId = '$productId' and orderId = '$orderId'";
	if(!mysql_query($query)) {
		$response->successful = false;
		$response->delete = $query;
	}


	$query = "SELECT * FROM orders o join orderproduct op on o.orderId=op.orderId WHERE o.orderId = '$orderId'";
	$result = mysql_query($query);

	$rows = fetch_array($result);

	if(count($rows)==0) {

		$query = "DELETE FROM orders WHERE orderId = '$orderId'";
		if(!mysql_query($query)) {
			$response->successful = false;
			$response->delete = $query;
		}
		else {
			$response->orderDeleted = true;
		}
	}

	return $response;
}

?>
