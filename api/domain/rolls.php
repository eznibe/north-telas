<?php

function saveRolls($orderProduct) {

	$obj->successful = true;
	$obj->method = "saveRolls";
	$obj->orderProduct = $orderProduct;

	$query = "SELECT * FROM rolls r WHERE r.orderId = '".$orderProduct->orderId."' and r.productId = '".$orderProduct->productId."'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	foreach ($orderProduct->rolls as $roll) {

		$exists = existsRoll($roll, $rows);

		if($exists) {
			// update roll
			$query = "UPDATE rolls SET number = '".$roll->number."', lote = '".$roll->lote."', mtsOriginal = ".$roll->mts.", mts = ".$roll->mts." WHERE id = '".$roll->id."'";
		}
		else if(!$exists && isset($roll->id)){
			// insert roll
			$query = "INSERT INTO rolls (id, productId, type, number, lote, mtsOriginal, mts, orderId, incoming, manual) VALUES ('".$roll->id."', '".$orderProduct->productId."', null, '".$roll->number."', '".$roll->lote."', ".$roll->mts.", ".$roll->mts.", '".$orderProduct->orderId."', true, false)";
		}

		if(!mysql_query($query))
			$obj->successful = false;
	}

	// check to remove deleted rolls
	foreach ($rows as $row) {

		$found=false;
		foreach ($orderProduct->rolls as $roll) {

			if(isset($row['id']) && $row['id'] == $roll->id)
				$found=true;
		}

		if(!$found) {
			$query = "DELETE from rolls where id = '".$row['id']."'";

			if(!mysql_query($query))
				$obj->successful = false;
		}
	}

	return $obj;
}

function existsRoll($roll, $rows) {

	foreach ($rows as $row) {
		if($row['id'] == $roll->id) {
			return true;
		}
	}

	return false;
}


function arriveRolls($orderId, $type) {

	$update = "UPDATE rolls SET incoming = false, type = '$type' WHERE orderId = '$orderId'";

	mysql_query($update);
}

function updateRollType($roll) {

	$obj->successful = true;
	$obj->method = "updateRollType";
	$obj->roll = $roll;

	$update = "UPDATE rolls SET type = '".$roll->type."' WHERE id = '".$roll->id."'";

	mysql_query($update);

	return $obj;
}

function updateRollField($roll, $rollField, $value) {

	$obj->successful = true;
	$obj->method = "updateRollField";
	$obj->roll = $roll;

	// special case mtsOriginal, if that changes also the available mts should be updated
	$extraUpdate = "";
	if($rollField == 'mtsOriginal') {

		$query = "SELECT * FROM rolls r WHERE r.id = '".$roll->id."' ";

		$result = mysql_query($query);

		while($subrow = mysql_fetch_array($result, MYSQL_ASSOC)) { // unique result

			$currentMtsOrig = $subrow['mtsOriginal'];

			$difference = $value - $currentMtsOrig;

			$newMts = $subrow['mts'] + $difference;

			if($newMts < 0)
				$newMts = 0;
		}

		$extraUpdate = ", mts = $newMts ";

		$obj->roll->mts = $newMts;
	}

	$update = "UPDATE rolls SET $rollField = '".$value."' $extraUpdate WHERE id = '".$roll->id."'";

	mysql_query($update);

	return $obj;
}

// Get the rolls of a product
// If the orderId is set -> only those rolls of the order despite the order status
// If not orderId is set -> only those rolls from orders arrived (real stock, incoming=false)
function getRolls($productId, $orderId) {

	$orderIdCondition = "";
	$arrivedCondition = "";
	if(isset($orderId)) {
		$orderIdCondition = "AND r.orderId = '$orderId' ";
	}
	else {
		$arrivedCondition = "AND r.incoming = false ";
	}

	$query = "SELECT * FROM rolls r WHERE r.productId = '$productId' ".$orderIdCondition.$arrivedCondition;

	$result = mysql_query($query);

	return fetch_array($result);
}


function getAllRolls($distincts) {

	$fields = $distincts ? 'DISTINCT(number) as number' : 'r.*';

	$query = "SELECT $fields FROM rolls r ORDER by number";

	$result = mysql_query($query);

	return fetch_array($result);
}


function getRoll($id) {

	$query = "SELECT * FROM rolls WHERE id = '$id'";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		return $row;
	}

	header('HTTP/1.1 404 Not Found', true, 404);

	$obj->error = "Not found";
	return $obj;
}

function getPossibleRolls($clothId, $plotterId, $cutId) {

	$query = "SELECT * FROM rolls r JOIN products p on p.productId = r.productId
		  WHERE p.clothId = '$clothId' AND r.incoming = false AND r.mts > 0 ORDER BY r.number";

	$result = mysql_query($query);

	$rows = fetch_array($result);

	$result = array();
	foreach ($rows as $roll) {
		$roll['display'] = $roll['number'] . " / " . $roll['lote'];

		$differentCut = "";
		if(isset($cutId)) {
			$differentCut = " and pc.id != '$cutId' ";
		}

		// calculate mtsPendingToBeCutted
		$query = "SELECT sum(pc.mtsCutted) as mtsPendingToBeCutted FROM plottercuts pc join plotters p on p.id=pc.plotterId
				WHERE p.cutted=false and pc.rollId = '".$roll['id']."'".$differentCut." group by pc.rollId";

		$qresult = mysql_query($query);

		while($subrow = mysql_fetch_array($qresult, MYSQL_ASSOC)) { // unique result

			$roll['mtsPendingToBeCutted'] = $subrow['mtsPendingToBeCutted'];
		}

		if(!isset($roll['mtsPendingToBeCutted']))
			$roll['mtsPendingToBeCutted'] = 0;

		array_push($result, $roll);
	}

	return $result;
}

function getRollLotes($number) {

	$query = "SELECT * FROM rolls WHERE number = '$number' ORDER by lote";
	$result = mysql_query($query);

	return fetch_array($result);
}

function getRollCuts($rollId, $clothId) {

	$rollIdCondition = isset($rollId) ? " AND pc.rollId = '$rollId'" : "";
	$clothIdCondition = isset($clothId) ? " AND c.id = '$clothId'" : "";

	$query = "SELECT *, DATE_FORMAT(p.cuttedOn,'%d-%m-%Y') as formattedDate, IFNULL(pre.orderNumber, mp.orderNumber) as orderNumber, coalesce(pre.sailDescription, pre.sailOneDesign, s.description) as sailName, p.observations as observations
		FROM plottercuts pc
		JOIN plotters p on p.id = pc.plotterId
		JOIN rolls r on r.id = pc.rollId
		JOIN cloths c on c.id = p.clothId
		LEFT JOIN previsions pre on pre.id = p.previsionId
		LEFT JOIN sails s on s.id = pre.sailId
		LEFT JOIN manualplotters mp on mp.id = p.manualPlotterId
		WHERE p.cutted = true $rollIdCondition $clothIdCondition
		ORDER BY p.cuttedOn desc";
	$result = mysql_query($query);

	return fetch_array($result);
}

function getClothRolls($clothId, $onlyAvailables) {

	$condition = "";
	if(isset($onlyAvailables) && $onlyAvailables=="true") {
		$condition = " AND r.mts > 0";
		//$condition = " having (r.mtsOriginal - coalesce(sum(pc.mtsCutted), 0)) > 0";
	}

//	$query = "SELECT *
//		FROM rolls r
//		JOIN products p on p.productId=r.productId
//		WHERE p.clothId = '$clothId' $condition
//		ORDER BY r.number, r.lote";

		$query = "SELECT r.id, r.number, r.lote, r.type, r.mtsOriginal, coalesce(sum(pc.mtsCutted), 0) as sumCutted, (r.mtsOriginal - coalesce(sum(pc.mtsCutted), 0)) as calculatedMts, r.mts, r.incoming, p.*
							FROM rolls r
							JOIN products p on p.productId=r.productId
							left join plottercuts pc on pc.rollId=r.id
							WHERE p.clothId = '$clothId'
							$condition
							group by r.id, r.number, r.lote, r.type, r.mtsOriginal, r.incoming
							order by r.number";

	$result = mysql_query($query);

	return fetch_array($result);
}

function saveManualRoll($roll) {

	$obj->successful = true;
	$obj->method = "saveManualRoll";
	$obj->roll = $roll;

	$productId = uniqid();

	$query = "INSERT INTO products values ('$productId', 'zz', '".$roll->clothId."', 'code-zz', null)";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	$query = "INSERT INTO rolls (id, productId, type, number, lote, mtsOriginal, mts, orderId, incoming, manual) values ('".$roll->id."', '$productId', '".$roll->type."', '".$roll->number."', '".$roll->lote."', ".$roll->mts.", ".$roll->mts.", '99', false, true)";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

?>
