<?php

include_once 'previsions.php';

function getPlotters($clothId, $cutted, $search, $upToDate) {

	$orderCondition = "";
	if(isset($clothId))
		$orderCondition = " AND clothId = '$clothId' ";

	$cuttedCondition = "";
	if(isset($cutted) && !isset($upToDate))
		$cuttedCondition = " AND pl.cutted = $cutted ";

	$searchCondition = ""; $searchCondition2 = "";
	if(isset($search)) {
		$searchCondition = " AND p.orderNumber like '$search%' ";
		$searchCondition2 = " AND mp.orderNumber like '$search%' ";
	}

	$upToDateCondition = "";
	if(isset($upToDate)) {
		$upToDateCondition = " AND pl.plotterDate <= STR_TO_DATE('".$upToDate."', '%d-%m-%Y')
													 AND (
													 	 (pl.cuttedOn is null and pl.cutted = false)
														 OR
														 (pl.cuttedOn >= STR_TO_DATE('".$upToDate."', '%d-%m-%Y') and pl.cutted = true)
													 ) ";
	}

	$queryGral = "SELECT *, pl.id as id, coalesce(p.sailDescription, p.sailOneDesign, s.description) as sailName, pl.observations as observations, deliveryDate as unformattedDeliveryDate, DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, p.id as previsionId
		  FROM plotters pl
		  JOIN previsions p on p.id = pl.previsionId
		  JOIN cloths c on c.id = pl.clothId
		  LEFT JOIN sails s on s.id=p.sailId
		  WHERE 1=1 $cuttedCondition $orderCondition $searchCondition $upToDateCondition ORDER BY p.orderNumber, c.name";

	$result = mysql_query($queryGral);

	$rows = fetch_array($result);

	$plotters = array();
	foreach ($rows as $plotter) {

		$query = "SELECT *, c.id as id FROM plotterCuts c JOIN rolls r on r.id = c.rollId WHERE c.plotterId = '".$plotter['id']."'";

		$result = mysql_query($query);

		$subrows = fetch_array($result);

		$plotter['cuts'] = $subrows;

		$plotter['query'] = $queryGral;

		$query = "SELECT * FROM previsioncloth pc JOIN cloths c on c.id=pc.clothId WHERE pc.previsionId = '".$plotter['previsionId']."'";

		$subrows = array();
		foreach (fetch_array(mysql_query($query)) as $subrow) {
			array_push($subrows, $subrow);
		}
		$plotter['cloths'] = $subrows;

		$plotter['designed'] = $plotter['designed']=='1' ? true : false;
		$plotter['oneDesign'] = $plotter['oneDesign']=='1' ? true : false;
		$plotter['greaterThan44'] = $plotter['greaterThan44']=='1' ? true : false;

		array_push($plotters, $plotter);
	}

	// from manualPlotters
	$query = "SELECT *, pl.id as id, DATE_FORMAT(pl.plotterDate,'%d-%m-%Y') as plotterDate, DATE_FORMAT(pl.cuttedOn,'%d-%m-%Y') as cuttedOn
						FROM plotters pl JOIN manualPlotters mp on mp.id = pl.manualPlotterId JOIN cloths c on c.id = pl.clothId
						WHERE 1=1 $cuttedCondition $orderCondition $searchCondition2 $upToDateCondition ORDER BY mp.orderNumber, c.name";

	$result = mysql_query($query);

	$rows = fetch_array($result);

	foreach ($rows as $plotter) {

		$query = "SELECT *, c.id as id FROM plotterCuts c JOIN rolls r on r.id = c.rollId WHERE c.plotterId = '".$plotter['id']."'";

		$result = mysql_query($query);

		$subrows = fetch_array($result);

		$plotter['cuts'] = $subrows;

		array_push($plotters, $plotter);
	}

	return $plotters;
}

function getPlotter($id) {

	$query = "SELECT * FROM plotters WHERE id = '$id'";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		if($row['manualPlotterId']!=null) {
			// fill with manual plotter table extra data
			$query = "SELECT * FROM manualPlotters WHERE id = '".$row['manualPlotterId']."'";
			$subresult = mysql_query($query);

			while($subrow = mysql_fetch_array($subresult, MYSQL_ASSOC)) {
				$row['sOrder'] = $subrow['sOrder'];
				$row['orderNumber'] = $subrow['orderNumber'];
			}
		}
		else {
			// fill with prevision data
		}

		return $row;
	}

	header('HTTP/1.1 404 Not Found', true, 404);

	$obj->error = "Not found";
	return $obj;
}

function finishPlotter($plotter) {

	$obj->successful = true;
	$obj->successfulRolls = true;
	$obj->method = "finishPlotter";
	$obj->plotter = $plotter;

	// cehck the plotter is not cutted already (prevent from possible errors in ui)
	$query = "SELECT * FROM plotters where id = '".$plotter->id."'";
	$r = mysql_query($query);

	$p = fetch_array($r);

	// unique result
	if(!$p[0]['cutted']) {

		$update = "UPDATE plotters SET cutted = true, cuttedOn = STR_TO_DATE('".$plotter->cutDate."', '%d-%m-%Y'), cuttedBy = '".$plotter->cuttedBy."', cuttedTimestamp = now() WHERE id = '".$plotter->id."'";

		if(!mysql_query($update)) {
			$obj->successful = false;
			$obj->successfulRolls = false;
			$obj->update = $update;
		}

		// discount mts from the mts of the rolls of the plotter
		foreach ($plotter->cuts as $cut) {

			$update = "UPDATE rolls set mts = if(mts-".$cut->mtsCutted." < 0, 0, mts-".$cut->mtsCutted.") where id = '".$cut->rollId."'";

			if(!mysql_query($update)) {
				$obj->successfulRolls = false;
				$obj->updateRolls = $update;
			}
		}
	}
	else {
		$obj->successful = false;
		$obj->successfulRolls = false;
		$obj->update = 'Ya cortado';
	}

	return $obj;
}

function restorePlotter($plotter) {

	$obj->successful = true;
	$obj->successfulRolls = true;
	$obj->method = "restorePlotter";
	$obj->plotter = $plotter;

	$update = "UPDATE plotters SET cutted = false, cuttedOn = null, cuttedBy = null WHERE id = '".$plotter->id."'";

	if(!mysql_query($update))
		$obj->successful = false;

	// increment mts from the mts of the rolls of the plotter
	foreach ($plotter->cuts as $cut) {

		$update = "UPDATE rolls SET mts = mts + ".$cut->mtsCutted." WHERE id = '".$cut->rollId."'";

		if(!mysql_query($update))
			$obj->successfulRolls = false;
	}

	return $obj;
}

function editPlotter($plotter, $field) {

	$obj->successful = true;
	$obj->method = "editPlotter($field)";
	$obj->plotter = $plotter;

	$update = "UPDATE plotters SET $field = '".$plotter->$field."' WHERE id = '".$plotter->id."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function editPlotterPrevision($plotter, $field) {

	$obj->successful = true;
	$obj->method = "editPlotterPrevision($field)";
	$obj->plotter = $plotter;

	// special case when sailName we will be updating always the field sailDescription
	if($field=='sailName') {
		$plotter->sailDescription = $plotter->$field;
		$field = 'sailDescription';
	}

	logPrevisionUpdateFull($plotter->previsionId, 'editPlotterPrevision('.$field.')');

	$update = "UPDATE previsions SET $field = '".$plotter->$field."' WHERE id = '".$plotter->previsionId."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function savePlotterCut($cut) {

	$obj->successful = true;
	$obj->method = "savePlotterCut";
	$obj->cut = $cut;


	$query = "SELECT * FROM plotterCuts c WHERE c.id = '".$cut->id."'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	if($num_results > 0) {
		// update cut
		$query = "UPDATE plotterCuts SET rollId = '".$cut->rollId."', mtsCutted = ".$cut->mtsCutted." WHERE id = '".$cut->id."'";
		$obj->type="updated";
	}
	else {
		// insert cut
		$query = "INSERT INTO plotterCuts VALUES ('".$cut->id."', '".$cut->plotterId."', ".$cut->mtsCutted.", '".$cut->rollId."')";
		$obj->type="inserted";
	}

	if(!mysql_query($query))
		$obj->successful = false;

	return $obj;
}

function toDesignPlotter($plotter) {

	$obj->successful = true;
	$obj->method = 'toDesignPlotter';

	logPrevisionUpdateFull($plotter->previsionId, 'toDesignPlotter');

	// prevision back to in design state
	$update = "UPDATE previsions set designed = false where id = '".$plotter->previsionId."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->updatePrevision = $update;
	}

	// remove all plotters with the same order number
	$query = "SELECT p.* FROM plotters p join previsions pre on pre.id = p.previsionId WHERE pre.orderNumber = '".$plotter->orderNumber."'";

	$result = mysql_query($query);

	$rows = fetch_array($result);
	foreach ($rows as $row) {
		$result = deletePlotter($row['id']);
		if(!$result->successful) {
			$obj->successful = false;
			$obj->query = $result->query;
			$obj->submethod = $result->method;
		}
	}

	return $obj;
}

function deletePlotterCut($cutId) {

	$obj->successful = true;

	// delete
	$query = "DELETE FROM plotterCuts WHERE id = '".$cutId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	return $obj;
}

function deletePlotter($plotterId) {

	$obj->successful = true;
	$obj->method = 'deletePlotter';

	// If plotter to delete is already cutted we need to restablish mts to the rolls
	// (i'm doing a restore plotter just to reuse code, it will be deleted later anywise)
	$query = "SELECT * FROM plotters WHERE id = '$plotterId'";
	$result = mysql_query($query);

	$rows = fetch_array($result); // unique result
	if($rows[0]['cutted']==true || $rows[0]['cutted']=='1') {
		$plotter = new stdClass();
		$plotter->id = $plotterId;
		$plotter->cuts = array();

		$query = "SELECT * FROM plotterCuts WHERE plotterId = '$plotterId'";
		$result = mysql_query($query);

		$rows = fetch_array($result);
		foreach ($rows as $row) {
			$cut = new stdClass();
			$cut->mtsCutted = $row['mtsCutted'];
			$cut->rollId = $row['rollId'];
			array_push($plotter->cuts, $cut);
		}

		restorePlotter($plotter);
	}

	// insert in removed plotters
	$query = "INSERT INTO removedPlotters SELECT *, now() FROM plotters WHERE id = '$plotterId'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	// delete plotter
	$query = "DELETE FROM plotters WHERE id = '".$plotterId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	// delete assigned cuts (Note: plotter cuts assigned but not cutted are not reduced from roll mts so no need to restore nothing here)
	$query = "DELETE FROM plotterCuts WHERE plotterId = '$plotterId'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	// TODO possible after removing a plotter the prevision get in allCutted state -> include info in response
	$prevision = checkAllClothsCutted($rows[0]['previsionId']);
	$obj->allCutted = $prevision['allCutted'];

	return $obj;
}

function deleteManualPlotter($manualPlotterId) {

	$obj->successful = true;
	$obj->method = 'deleteManualPlotter';

	// fetch plotter pointing to this manual plotter
	$query = "SELECT * FROM plotters p WHERE p.manualPlotterId = '$manualPlotterId'";
	$result = mysql_query($query);

	$plotters = fetch_array($result); // unique result

	// delete manual plotter
	$query = "DELETE FROM manualPlotters WHERE id = '$manualPlotterId'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	// insert in removed plotters
	$query = "INSERT INTO removedPlotters SELECT *, now() FROM plotters WHERE manualPlotterId = '".$manualPlotterId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	// delete plotter
	$query = "DELETE FROM plotters WHERE manualPlotterId = '".$manualPlotterId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	// delete assigned cuts (Note: plotter cuts assigned but not cutted are not reduced from roll mts so no need to restore nothing here)
	$query = "DELETE FROM plotterCuts WHERE plotterId = '".$plotters[0]['id']."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}


function saveManualPlotter($plotter) {

	$obj->successful = true;
	$obj->isNew = false;
	$obj->method = "saveManualPlotter";
	$obj->plotter = $plotter;


	$query = "SELECT * FROM plotters p WHERE p.id = '".$plotter->id."'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	if($num_results > 0) {

		// update manual plotter
		$query = "UPDATE manualPlotters SET sOrder = '".$plotter->sOrder."', orderNumber = '".$plotter->orderNumber."' WHERE id = '".$plotter->manualPlotterId."'";

		if(!mysql_query($query)) {
			$obj->successfulMP = false;
			$obj->wrongQuery = $query;
		}

		$query = "UPDATE plotters p SET plotterDate = STR_TO_DATE('".$plotter->plotterDate."', '%d-%m-%Y'), observations = '".$plotter->observations."', clothId = '".$plotter->selectedCloth->id."' WHERE id = '".$plotter->id."'";
		$obj->type="updated";
	}
	else {
		// insert manual plotter
		$id = uniqid();
		if(isset($plotter->orderNumber)) $orderNumber = "'".$plotter->orderNumber."'"; else $orderNumber = 'null';
		$query = "INSERT INTO manualPlotters VALUES ('".$id."', '".$plotter->sOrder."', $orderNumber)";

		if(!mysql_query($query))
			$obj->successfulMP = false;

		if(isset($plotter->observations)) $observations = "'".$plotter->observations."'"; else $observations = 'null';
		$query = "INSERT INTO plotters (id, previsionId, clothId, mtsDesign, plotterDate, manualPlotterId, observations, cutted, cuttedOn)
			  VALUES ('".$plotter->id."', null, '".$plotter->selectedCloth->id."', null, STR_TO_DATE('".$plotter->plotterDate."', '%d-%m-%Y'), '$id', $observations, false, null)";
		$obj->type = "inserted";

		$obj->isNew = true;
	}

	if(!mysql_query($query))
		$obj->successful = false;

	return $obj;
}

function getClothPlotters($clothId, $startDate, $endDate, $userName, $providerName, $groupName, $groupBy) {

	$condition = "";
	if(isset($clothId)) {
		$condition = " AND p.clothId = '$clothId' ";
	}

	if(isset($userName)) {
		$condition .= " AND cuttedBy = '$userName' ";
	}

	if(isset($providerName)) {
		$condition .= " AND prov.name = '$providerName' ";
	}

	if(isset($groupName)) {
		$condition .= " AND g.name = '$groupName' ";
	}

	if(isset($startDate) && isset($endDate)) {
		// all cloths between dates
		$extraCondition = ($startDate=="01-01-1000" && $endDate=="12-12-2999") ? " OR p.cuttedOn is null " : "";
		$condition .= " AND ( STR_TO_DATE('$startDate', '%d-%m-%Y') <= p.cuttedOn AND STR_TO_DATE('$endDate', '%d-%m-%Y') >= p.cuttedOn ) " . $extraCondition;
	}

	$orderByCondition = "p.cuttedOn desc, sortOrderNumber, c.name ";
	$groupByCondition = "p.id ";

	if(isset($groupBy) && $groupBy=='GROUP_BY_CLOTH') {
		$groupByCondition = "c.id ";
		$orderByCondition = "c.name ";
	}

	$query1 = "SELECT c.*, p.*, s.*, pre.*, pc.plotterId, pro.code,
				SUM(pc.mtsCutted) as sumMtsCutted, DATE_FORMAT(p.cuttedOn,'%d-%m-%Y') as formattedDate, IFNULL(pre.orderNumber, mp.orderNumber) as orderNumber, IFNULL(pre.orderNumber, mp.orderNumber) as sortOrderNumber, coalesce(pre.sailDescription, pre.sailOneDesign, s.description) as sailName, p.observations as observations
				FROM cloths c
				JOIN plotters p on p.clothId = c.id
				JOIN plottercuts pc on pc.plotterId = p.id
				JOIN rolls r on r.id = pc.rollId
				LEFT JOIN previsions pre on pre.id = p.previsionId
				LEFT JOIN manualplotters mp on mp.id = p.manualPlotterId
				LEFT JOIN sails s on s.id = pre.sailId
				JOIN groups g on g.id = c.groupId
				JOIN products pro on pro.clothId = c.id
				JOIN providers prov on (prov.id = pro.providerId and pro.productId = r.productId)
				WHERE p.cutted = true $condition and prov.name!='?'
				GROUP BY $groupByCondition
				ORDER BY $orderByCondition";

	$result = mysql_query($query1);

	$rows = fetch_array($result);

	$plotters = array();
	foreach ($rows as $plotter) {

		$query = "SELECT r.*
			FROM plottercuts pc
			JOIN plotters p on pc.plotterId = p.id
			JOIN rolls r on r.id = pc.rollId
			WHERE p.id = '".$plotter['plotterId']."' AND p.cutted = true";
		$result = mysql_query($query);

		$subrows = fetch_array($result);

		$plotter['rolls'] = $subrows;

		//$plotter['query'] = $query1;

		array_push($plotters, $plotter);
	}

	return $plotters;
}


function getClothAllPlottersAndOrders($clothId, $startDate, $endDate) {

	$condition = "";
	if(isset($clothId)) {
		$conditionP = " AND clothId = '$clothId' ";
		$conditionO = " AND clothId = '$clothId' ";
	}

	if(isset($startDate) && isset($endDate)) {
		// all cloths between dates
		$extraCondition = ($startDate=="01-01-1000" && $endDate=="12-12-2999") ? " OR p.cuttedOn is null " : "";
		$conditionP .= " AND ( STR_TO_DATE('$startDate', '%d-%m-%Y') <= p.cuttedOn AND STR_TO_DATE('$endDate', '%d-%m-%Y') >= p.cuttedOn ) " . $extraCondition;

		$conditionO .= " AND STR_TO_DATE('$startDate', '%d-%m-%Y') <= o.arriveDate AND STR_TO_DATE('$endDate', '%d-%m-%Y') >= o.arriveDate ";
	}

	$query = "SELECT * FROM
		(
		SELECT c.name, SUM(pc.mtsCutted) as sumMts, DATE_FORMAT(p.cuttedOn,'%d-%m-%Y') as formattedDate, coalesce(p.cuttedOn) as date,
		       IFNULL(pre.orderNumber, mp.orderNumber) as orderNumber,
		       IFNULL(pre.orderNumber, mp.orderNumber) as sortOrderNumber,
		       null as invoiceNumber,
		       null as orderId, null as productId, pc.plotterId
		FROM cloths c
		JOIN plotters p on p.clothId = c.id
		JOIN plottercuts pc on pc.plotterId = p.id
		LEFT JOIN previsions pre on pre.id = p.previsionId
		LEFT JOIN manualplotters mp on mp.id = p.manualPlotterId
		LEFT JOIN sails s on s.id = pre.sailId
		WHERE p.cutted = true $conditionP
		GROUP BY p.id
		UNION
		SELECT c.name, SUM(r.mtsOriginal) as sumMts, DATE_FORMAT(o.arriveDate,'%d-%m-%Y') as formattedDate, coalesce(o.arriveDate) as date,
	   	       null as orderNumber, null as sortOrderNumber, invoiceNumber,
		       o.orderId, pr.productId, null as plotterId
		FROM cloths c
		JOIN products pr on pr.clothId = c.id
		JOIN providers prov on prov.id = pr.providerId
		JOIN orderproduct op on op.productId = pr.productId
		JOIN orders o on o.orderId = op.orderId
		JOIN rolls r on (r.orderId = o.orderId and r.productId = pr.productId)
		WHERE o.status = 'ARRIVED' $conditionO
		GROUP BY c.id, o.arriveDate
		) tot
		ORDER BY tot.date desc, tot.name, tot.sortOrderNumber, tot.invoiceNumber";

	$result = mysql_query($query);

	$rows = fetch_array($result);

	$results = array();
	foreach ($rows as $row) {

		if(isset($row['plotterId'])) {
			$query = "SELECT r.*
				FROM plottercuts pc
				JOIN plotters p on pc.plotterId = p.id
				JOIN rolls r on r.id = pc.rollId
				WHERE p.id = '".$row['plotterId']."' AND p.cutted = true";
		}
		else {
			$query = "SELECT *
				FROM rolls r
				WHERE r.orderId = '".$row['orderId']."' AND r.productId = '".$row['productId']."'";
		}

		$result = mysql_query($query);

		$subrows = fetch_array($result);

		$row['rolls'] = $subrows;

		array_push($results, $row);
	}

	return $results;
}

?>
