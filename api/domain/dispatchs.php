<?php

function getDispatchs($expand, $startDate, $endDate)
{

	if ($expand == 'NONE') {
		$query = "SELECT *
							FROM dispatchs d";
	} else if ($expand == 'CURRENTS') {
		$query = "SELECT *, DATE_FORMAT(dispatchDate,'%d-%m-%Y') as dispatchDate, d.dispatchDate as unformattedDispatchDate
							FROM dispatchs d
							WHERE d.archived = false
							ORDER BY d.dispatchDate";

	} else if ($expand == 'HISTORIC') {

		$condition .= " AND ( STR_TO_DATE('$startDate', '%d-%m-%Y') <= d.dispatchDate AND STR_TO_DATE('$endDate', '%d-%m-%Y') >= d.dispatchDate ) ";

		$query = "SELECT *, DATE_FORMAT(dispatchDate,'%d-%m-%Y') as dispatchDate, d.dispatchDate as unformattedDispatchDate
							FROM dispatchs d
							WHERE d.archived = true  $condition
							ORDER BY d.dispatchDate";
	}

	$result = mysql_query($query);

	if ($expand == 'CURRENTS' || $expand == 'HISTORIC') {

		$rows = array();
		while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

			$query = "SELECT dp.*, p.orderNumber
								FROM dispatchs d JOIN dispatchPrevisions dp on dp.dispatchId = d.id JOIN previsions p on p.id = dp.previsionId
								WHERE dp.dispatchId = '".$row['id']."'";
			$subresult = mysql_query($query);

			$subrows = array();
			while($subrow = mysql_fetch_array($subresult, MYSQL_ASSOC)) {
				array_push($subrows, $subrow);
			}

			$row['previsions'] = $subrows;

			array_push($rows, $row);
		}

		return $rows;

	} else {
		return fetch_array($result);
	}
}

function getDispatch($id) {

	$query = "SELECT *, DATE_FORMAT(dispatchDate,'%d-%m-%Y') as dispatchDate, d.dispatchDate as unformattedDispatchDate
						FROM dispatchs d
						WHERE d.id = '$id'";
	$result = mysql_query($query);

	$row = mysql_fetch_array($result, MYSQL_ASSOC);

	if(!isset($row)) {
		header('HTTP/1.1 404 Not Found', true, 404);

		$obj->error = "Not found";
		return $obj;
	}

	// previsions
	$query = "SELECT dp.*, dp.id as dpId, dc.number, dc.type, p.orderNumber, p.client, p.boat, p.percentage, coalesce(p.sailDescription, p.sailOneDesign, s.description) as sailName
						FROM dispatchs d JOIN dispatchPrevisions dp on dp.dispatchId = d.id
						 								 LEFT JOIN dispatchCarries dc on dc.id = dp.carryId
														 JOIN previsions p on p.id = dp.previsionId
														 LEFT JOIN sails s on p.sailId = s.id
						WHERE dp.dispatchId = '".$row['id']."'";
	$subresult = mysql_query($query);

	$subrows = array();
	while($subrow = mysql_fetch_array($subresult, MYSQL_ASSOC)) {
		array_push($subrows, $subrow);
	}

	$row['previsions'] = $subrows;

	// boxes and tubes
	$query = "SELECT dc.*
						FROM dispatchCarries dc
						WHERE dc.dispatchId = '".$row['id']."'";
	$subresult = mysql_query($query);

	$boxes = array();
	$tubes = array();
	while($subrow = mysql_fetch_array($subresult, MYSQL_ASSOC)) {
		if ($subrow['type'] == 'BOX') {
			array_push($boxes, (object)$subrow);
		} else {
			array_push($tubes, (object)$subrow);
		}
	}

	$row['boxes'] = $boxes;
	$row['tubes'] = $tubes;

	return $row;
}

function getDispatchCarries($dispatchId)
{

	$query = "SELECT *, concat(type, ' ', number) as display FROM dispatchCarries WHERE dispatchId = '$dispatchId'
					  ORDER BY type, number";

	$result = mysql_query($query);

	return fetch_array($result);
}


function saveDispatch($dispatch)
{

	$query = "SELECT * FROM dispatchs d LEFT JOIN dispatchPrevisions dp on d.id = dp.dispatchId WHERE d.id = '".$dispatch->id."'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	$obj->method = 'saveDispatch';
	$obj->successful = false;

	$dispatchDate = isset($dispatch->dispatchDate) ? "STR_TO_DATE('".$dispatch->dispatchDate."', '%d-%m-%Y')" : 'null' ;
	$destinatary = isset($dispatch->destinatary) ? "'".$dispatch->destinatary."'" : 'null' ;
	$destiny = isset($dispatch->destiny) ? "'".$dispatch->destiny."'" : 'null' ;
	$transport = isset($dispatch->transport) ? "'".$dispatch->transport."'" : 'null' ;
	$deliveryType = isset($dispatch->deliveryType) ? "'".$dispatch->deliveryType."'" : 'null' ;
	// $ = isset($dispatch->) ? "'".$dispatch->."'" : 'null' ;
	// $ = isset($dispatch->) ? "'".$dispatch->."'" : 'null' ;

	if ($num_results != 0)
	{
		// update
		$update = "UPDATE dispatchs SET number = '".$dispatch->number."', dispatchDate = $dispatchDate ".
																		", destinatary = ".$destinatary.", destiny = ".$destiny.", transport = ".$transport.", deliveryType = ".$deliveryType.
																		" WHERE id = '".$dispatch->id."'";

		if(mysql_query($update))
			$obj->successful = true;
		else {
			$obj->successfulUpdate = false;
			$obj->update = $update;
		}
	}
	else {
		// insert
		$insert = "INSERT INTO dispatchs (id, number, dispatchDate, destinatary, destiny, transport, deliveryType)
				VALUES ('".$dispatch->id."', '".$dispatch->number."', $dispatchDate, $destinatary, $destiny, $transport, $deliveryType)" ;

		if(mysql_query($insert)) {
			$obj->successful = true;
			$obj->isNew = true;
		}
		else {
			$obj->successfulInsert = false;
			$obj->insert = $insert;
		}
	}

	if($obj->successful) {
		// handlePrevisions($dispatch, $rows, $obj);
	}

	$obj->dispatch = $dispatch;

	return $obj;
}

function archive($dispatch) {

	$update = "UPDATE dispatchs SET archived = true WHERE id = '".$dispatch->id."'";

	if(mysql_query($update))
		$obj->successful = true;
	else {
		$obj->successfulUpdate = false;
		$obj->update = $update;
	}

	return $obj;
}

function restore($dispatch) {

	$update = "UPDATE dispatchs SET archived = false WHERE id = '".$dispatch->id."'";

	if(mysql_query($update))
		$obj->successful = true;
	else {
		$obj->successfulUpdate = false;
		$obj->update = $update;
	}

	return $obj;
}

function addPrevision($prevision)
{
	$obj->method = 'addPrevision';
	$obj->successful = false;

	$insert = "INSERT INTO dispatchPrevisions (id, dispatchId, previsionId)
						 VALUES ('".$prevision->dpId."', '".$prevision->dispatchId."', '".$prevision->id."')" ;

	if(mysql_query($insert)) {
		$obj->successful = true;
	}
	else {
		$obj->successfulInsert = false;
		$obj->insert = $insert;
	}

	$obj->dispatch = $dispatch;

	return $obj;
}

function saveCarry($carry)
{
	$obj->method = 'saveCarry';
	$obj->successful = false;

	$measures = isset($carry->measures) ? "'".$carry->measures."'" : 'null' ;
	$weight = isset($carry->weight) ? $carry->weight : 'null' ;

	if (isset($carry->isNew)) {
		$insert = "INSERT INTO dispatchCarries (id, dispatchId, number, measures, weight, type)
							 VALUES ('".$carry->id."', '".$carry->dispatchId."', ".$carry->number.", $measures, $weight, '".$carry->type."')" ;

		if(mysql_query($insert)) {
			$obj->successful = true;
		}
		else {
			$obj->successfulInsert = false;
			$obj->insert = $insert;
		}
	} else {
		$update = "UPDATE dispatchCarries
							 SET number = ".$carry->number.", measures = $measures, weight = $weight
							 WHERE id = '".$carry->id."'" ;

		if(mysql_query($update)) {
			$obj->successful = true;
		}
		else {
			$obj->successfulUpdate = false;
			$obj->update = $update;
		}
	}

	$obj->carry = $carry;

	return $obj;
}


function deleteDispatch($id) {

	$obj->successful = true;

	// delete dispatchPrevisions, dispatchCarries, and finally the dispatch
	$query = "DELETE FROM dispatchPrevisions WHERE dispatchId = '".$id."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	$query = "DELETE FROM dispatchCarries WHERE dispatchId = '".$id."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	$query = "DELETE FROM dispatchs WHERE id = '".$id."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function deleteDispatchPrevision($dispatchPrevisionId) {

	$obj->successful = true;

	// delete
	$query = "DELETE FROM dispatchPrevisions WHERE id = '".$dispatchPrevisionId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	return $obj;
}

function deleteCarry($carryId) {

	$obj->successful = true;

	// delete
	$query = "UPDATE dispatchPrevisions SET carryId = null WHERE carryId = '".$carryId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	$query = "DELETE FROM dispatchCarries WHERE id = '".$carryId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	return $obj;
}


function editDispatchPrevisionNumberField($prevision, $field) {

	$obj->successful = true;
	$obj->method = "editPrevisionNumberField($field)";
	$obj->prevision = $prevision;

	$update = "UPDATE dispatchPrevisions SET $field = ".$prevision->$field." WHERE id = '".$prevision->dpId."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function editDispatchPrevisionField($prevision, $field) {

	$obj->successful = true;
	$obj->method = "editPrevisionField($field)";
	$obj->prevision = $prevision;

	$update = "UPDATE dispatchPrevisions SET $field = '".$prevision->$field."' WHERE id = '".$prevision->dpId."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function updateDispatchPrevisionCarry($prevision) {

	$obj->successful = true;
	$obj->method = "updateDispatchPrevisionCarry";
	$obj->prevision = $prevision;

	$carryId = isset($prevision->carryId) ? "'".$prevision->carryId."'" : 'null' ;

	$update = "UPDATE dispatchPrevisions SET carryId = $carryId
						 WHERE id = '".$prevision->dpId."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}


?>
