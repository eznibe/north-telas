<?php

include_once 'logs.php';

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
			logRollPreviousModification($roll->id, 'rolls.saveRolls', null);

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


function arriveRolls($orderId, $productId, $isTemporary) {

	$obj->successful = false;

	logRollPreviousModification(null, 'rolls.arriveRolls', "orderId = $orderId");

	$type = $isTemporary ? 'TEMP' : 'DEF';

	$update = "UPDATE rolls SET incoming = false, type = '$type' WHERE orderId = '$orderId' and productId = '".$productId."'";

	if (mysql_query($update)) {
		$obj->successful = true;
	}

	$obj->update = $update;

	return $obj;
}

function updateRollType($roll) {

	$obj->successful = true;
	$obj->method = "updateRollType";
	$obj->roll = $roll;

	logRollPreviousModification($roll->id, 'rolls.updateRollType', null);

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

	// special case mts, a plotter and plottercut should be created for the corrected mts in order to allow reports to get the available mts correctly
	if($rollField == 'mts') {

		$query = "SELECT r.*, p.clothId FROM rolls r join products p on r.productId=p.productId WHERE r.id = '".$roll->id."' ";

		$result = mysql_query($query);

		while($subrow = mysql_fetch_array($result, MYSQL_ASSOC)) { // unique result

			$currentMts = $subrow['mts'];

			$difference = $currentMts - $value;

			$newPlotterId = uniqid();

			$insert = "INSERT INTO plotters (id, plotterDate, clothId, observations, cutted, cuttedOn, cuttedBy)
								 VALUES ('$newPlotterId', CURRENT_DATE, '".$subrow['clothId']."', 'Plotter especial, roll mts corrección', true, CURRENT_DATE, 'automatic')";

			mysql_query($insert);

			$insert = "INSERT INTO plottercuts (id, plotterId, mtsCutted, rollId)
								 VALUES (uuid(), '$newPlotterId', $difference, '".$roll->id."')";

			mysql_query($insert);
		}
	}

	$obj->log = logRollPreviousModification($roll->id, "rolls.updateRollField($rollField)", null);

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

	$query = "SELECT *, DATE_FORMAT(p.cuttedOn,'%d-%m-%Y') as formattedDate, IFNULL(pre.orderNumber, mp.orderNumber) as orderNumber, coalesce(pre.sailDescription, pre.sailOneDesign, concat(sg.name,' - ',s.description)) as sailName, p.observations as observations
		FROM plottercuts pc
		JOIN plotters p on p.id = pc.plotterId
		JOIN rolls r on r.id = pc.rollId
		JOIN cloths c on c.id = p.clothId
		LEFT JOIN previsions pre on pre.id = p.previsionId
		LEFT JOIN sails s on s.id = pre.sailId
		LEFT JOIN sailgroups sg on sg.id=s.sailGroupId
		LEFT JOIN manualplotters mp on mp.id = p.manualPlotterId
		WHERE p.cutted = true $rollIdCondition $clothIdCondition
		ORDER BY p.cuttedOn desc";
	$result = mysql_query($query);

	return fetch_array($result);
}

function getClothRolls($clothId, $onlyAvailables) {

	global $country;

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

		$query = "SELECT r.id, r.number, r.lote, r.type, r.mtsOriginal, coalesce(sum(pc.mtsCutted), 0) as sumCutted, (r.mtsOriginal - coalesce(sum(pc.mtsCutted), 0)) as calculatedMts, r.mts, r.incoming, o.status as orderStatus, p.*
							FROM rolls r
							JOIN products p on p.productId=r.productId
							JOIN providers pro on pro.id = p.providerId
							left join plottercuts pc on pc.rollId=r.id
							left join orders o on o.orderId=r.orderId
							WHERE p.clothId = '$clothId' AND pro.country = '$country'
							$condition
							group by r.id, r.number, r.lote, r.type, r.mtsOriginal, r.incoming, o.status
							order by r.number";

	$result = mysql_query($query);

	return fetch_array($result);
}

function saveManualRoll($roll) {

	$obj->successful = true;
	$obj->method = "saveManualRoll";
	$obj->roll = $roll;

	$productId = uniqid();

	// get one provider of the cloth to add this manual roll to
	$query = "SELECT pt.productId FROM providers p right join products pt on p.id = pt.providerId WHERE pt.clothId = '".$roll->clothId."' and pt.providerId != 'zz'";

	$result = mysql_query($query);
	$rows = fetch_array($result);

	if (count($rows) > 0) {
		$productId = $rows[0]['productId'];
	} else {

		$query = "INSERT INTO products values ('$productId', 'zz', '".$roll->clothId."', 'code-zz', null)";

		if(!mysql_query($query)) {
			$obj->successful = false;
			$obj->query = $query;
		}
	}

	$query = "INSERT INTO rolls (id, productId, type, number, lote, mtsOriginal, mts, orderId, incoming, manual) values ('".$roll->id."', '$productId', '".$roll->type."', '".$roll->number."', '".$roll->lote."', ".$roll->mts.", ".$roll->mts.", '99', false, true)";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

?>
