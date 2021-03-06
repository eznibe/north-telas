<?php

function getDispatchs($expand, $startDate, $endDate, $filterKey, $filterValue, $seller)
{
	global $country, $dispatchCountry;

	$country = isset($dispatchCountry) ? $dispatchCountry : $country;

	if ($expand == 'NONE') {
		$query = "SELECT *
							FROM dispatchs d
							WHERE d.country = '$country' ";

	} else if ($expand == 'CURRENTS') {
		$query = "SELECT d.*, DATE_FORMAT(dispatchDate,'%d-%m-%Y') as dispatchDate, d.dispatchDate as unformattedDispatchDate
							FROM dispatchs d left join dispatchprevisions dp on dp.dispatchId = d.id left join previsions p on p.id=dp.previsionId
							WHERE d.archived = false AND d.country = '$country' ".
							(isset($seller) ? "and p.seller = '$seller' " : "")
							. "GROUP BY d.id
							HAVING count(*) > 0
							";

		if (isset($seller)) {
			$query .= "UNION
			SELECT d.*, DATE_FORMAT(dispatchDate,'%d-%m-%Y') as dispatchDate, d.dispatchDate as unformattedDispatchDate 
			FROM dispatchs d
			WHERE d.archived = false AND d.country = '$country' 
			AND d.id not in
			(
				SELECT d2.id
				FROM dispatchs d2 join dispatchprevisions dp on dp.dispatchId = d2.id join previsions p on p.id = dp.previsionId
				where d2.archived = false AND d2.country = '$country' 
				group by d2.id
			) ";
		}

		$query .= "ORDER BY number ";

	} else if ($expand == 'HISTORIC') {

		$condition = " AND ( STR_TO_DATE('$startDate', '%d-%m-%Y') <= d.dispatchDate AND STR_TO_DATE('$endDate', '%d-%m-%Y') >= d.dispatchDate ) ";

		if (isset($filterKey) && isset($filterValue)) {
			if ($filterKey == 'orderNumber') {
				$condition .= " AND (dp.$filterKey like '%$filterValue%' OR p.$filterKey like '%$filterValue%')";
			} else {
				$condition .= " AND $filterKey like '%$filterValue%'";
			}
		}

		$query = "SELECT d.*, DATE_FORMAT(dispatchDate,'%d-%m-%Y') as dispatchDate, d.dispatchDate as unformattedDispatchDate
							FROM dispatchs d LEFT JOIN dispatchprevisions dp on d.id = dp.dispatchId LEFT JOIN previsions p on p.id = dp.previsionId
							WHERE d.archived = true AND d.country = '$country'  $condition
							GROUP BY d.id
							ORDER BY d.number desc";
	}

	$result = mysql_query($query);

	if ($expand == 'CURRENTS' || $expand == 'HISTORIC') {

		$rows = array();
		while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

			$query = "SELECT dp.*, coalesce(p.orderNumber, dp.orderNumber) as orderNumber, coalesce(p.client, dp.client) as client
								FROM dispatchs d JOIN dispatchprevisions dp on dp.dispatchId = d.id LEFT JOIN previsions p on p.id = dp.previsionId
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
	$query = "SELECT dp.*, dp.id as dpId, dc.number, dc.type, coalesce(p.orderNumber, dp.orderNumber) as orderNumber, coalesce(p.client, dp.client) as client, p.boat, p.percentage, coalesce(p.sailDescription, p.sailOneDesign, concat(sg.name,' - ',s.description)) as sailName
						FROM dispatchs d JOIN dispatchprevisions dp on dp.dispatchId = d.id
						 								 LEFT JOIN dispatchcarries dc on dc.id = dp.carryId
														 LEFT JOIN previsions p on p.id = dp.previsionId
														 LEFT JOIN sails s on p.sailId = s.id
														 LEFT JOIN sailgroups sg on sg.id=s.sailGroupId
						WHERE dp.dispatchId = '".$row['id']."'";
	$subresult = mysql_query($query);

	$subrows = array();
	while($subrow = mysql_fetch_array($subresult, MYSQL_ASSOC)) {
		array_push($subrows, $subrow);
	}

	$row['previsions'] = $subrows;

	// boxes and tubes
	$query = "SELECT dc.*
						FROM dispatchcarries dc
						WHERE dc.dispatchId = '".$row['id']."' ORDER BY dc.number";
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

	$query = "SELECT *, concat(type, ' ', number) as display FROM dispatchcarries WHERE dispatchId = '$dispatchId'
					  ORDER BY type, number";

	$result = mysql_query($query);

	return fetch_array($result);
}

// get all the destinataries enetered in the systema (the info will be from the last dispatch for that person)
function getDispatchDestinataries()
{
	$query = "SELECT destinatary as name, address, destiny, transport, deliveryType , notes, number, archived
						FROM dispatchs d
						WHERE d.number in
						(
							SELECT max(number) as number FROM dispatchs WHERE destinatary is not null
							GROUP BY destinatary
						)
						ORDER BY destinatary";

	$result = mysql_query($query);

	return fetch_array($result);
}


function getNextDispatchNumber() {
	global $country;

	$count = "SELECT count(*) as count FROM dispatchs WHERE country = '$country'";

	$query = "SELECT (max(number) + 1) as number FROM dispatchs WHERE country = '$country'";

	$countResult = mysql_query($count);

	$countArr = fetch_array($countResult);
	if ($countArr[0]['count'] == 0) {
		return $country == 'ARG' ? '1' : '1001';
	}

	$result = mysql_query($query);

	$arr = fetch_array($result);

	// return mysql_num_rows($result) > 0 ? $arr[0]['number'] : '1';
	return $arr[0]['number'];
}

function saveDispatch($dispatch)
{
	global $country;

	$query = "SELECT * FROM dispatchs d LEFT JOIN dispatchprevisions dp on d.id = dp.dispatchId WHERE d.id = '".$dispatch->id."'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	$obj->method = 'saveDispatch';
	$obj->successful = false;

	$dispatchDate = isset($dispatch->dispatchDate) && $dispatch->dispatchDate!="" ? "STR_TO_DATE('".$dispatch->dispatchDate."', '%d-%m-%Y')" : 'null' ;
	$destinatary = isset($dispatch->destinatary) ? "'".$dispatch->destinatary."'" : 'null' ;
	$destiny = isset($dispatch->destiny) ? "'".$dispatch->destiny."'" : 'null' ;
	$transport = isset($dispatch->transport) ? "'".$dispatch->transport."'" : 'null' ;
	$deliveryType = isset($dispatch->deliveryType) ? "'".$dispatch->deliveryType."'" : 'null' ;
	$address = isset($dispatch->address) ? "'".$dispatch->address."'" : 'null' ;
	$value = isset($dispatch->value) ? $dispatch->value : 'null' ;
	$tracking = isset($dispatch->tracking) ? "'".$dispatch->tracking."'" : 'null' ;
	$notes = isset($dispatch->notes) ? "'".$dispatch->notes."'" : 'null' ;

	if ($num_results != 0)
	{
		// update
		$update = "UPDATE dispatchs SET number = ".$dispatch->number.", dispatchDate = $dispatchDate ".
																		", destinatary = ".$destinatary.", destiny = ".$destiny.", transport = ".$transport.", deliveryType = ".$deliveryType.
																		", Address = ".$address.", value = ".$value.", tracking = ".$tracking.", notes = ".$notes.
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
		$insert = "INSERT INTO dispatchs (id, number, dispatchDate, destinatary, destiny, transport, deliveryType, address, value, tracking, notes, country, closedForSellers)
				VALUES ('".$dispatch->id."', $dispatch->number, $dispatchDate, $destinatary, $destiny, $transport, $deliveryType, $address, $value, $tracking, $notes, '$country', false)" ;

		if(mysql_query($insert)) {
			$obj->successful = true;
			$obj->isNew = true;

			// update to notify all other users of the new dispatch created
			$update = "UPDATE usuarios SET newdispatch = true WHERE id != '".$dispatch->userId."' AND country = '$country' AND role != 'vendedor'";
			if(!mysql_query($update)) {
				$obj->successful = false;
				$obj->update = $update;
			}
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

	$obj->successful = true;

	$update = "UPDATE dispatchs SET archived = true WHERE id = '".$dispatch->id."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
		return $obj;
	}
	else {
		// archive previsions assigned to this dispatch
		$update2 = "UPDATE previsions, dispatchprevisions SET previsions.deletedProductionOn = now(), previsions.deletedProductionBy = '".$dispatch->user." (dispatch)'
								WHERE previsions.id = dispatchprevisions.previsionId and dispatchprevisions.dispatchId = '".$dispatch->id."'";

		if(!mysql_query($update2)) {
			$obj->successful = false;
			$obj->update = $update2;
		}
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

function toggleClosedForSellers($dispatch) {

	$closedForSellers = $dispatch->closedForSellers==1 ? 'true' : 'false';

	$update = "UPDATE dispatchs SET closedForSellers = $closedForSellers WHERE id = '".$dispatch->id."'";

	if(mysql_query($update))
		$obj->successful = true;
	else {
		$obj->successfulUpdate = false;
	}
	$obj->update = $update;

	return $obj;
}

function addPrevision($prevision)
{
	$obj->method = 'addPrevision';
	$obj->successful = false;

	if (isset($prevision->id)) {
		$insert = "INSERT INTO dispatchprevisions (id, dispatchId, previsionId)
						 	VALUES ('".$prevision->dpId."', '".$prevision->dispatchId."', '".$prevision->id."')" ;
	} else {
		// will add not a real prevision but something manually entered by the user
		$insert = "INSERT INTO dispatchprevisions (id, dispatchId, orderNumber)
						 	VALUES ('".$prevision->dpId."', '".$prevision->dispatchId."', '".$prevision->orderNumber."')" ;
	}

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
		$insert = "INSERT INTO dispatchcarries (id, dispatchId, number, measures, weight, type)
							 VALUES ('".$carry->id."', '".$carry->dispatchId."', ".$carry->number.", $measures, $weight, '".$carry->type."')" ;

		if(mysql_query($insert)) {
			$obj->successful = true;
		}
		else {
			$obj->successfulInsert = false;
			$obj->insert = $insert;
		}
	} else {
		$update = "UPDATE dispatchcarries
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

	// delete dispatchprevisions, dispatchcarries, and finally the dispatch
	$query = "DELETE FROM dispatchprevisions WHERE dispatchId = '".$id."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	$query = "DELETE FROM dispatchcarries WHERE dispatchId = '".$id."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	// log in removed dispatchs
	$query = "INSERT INTO removeddispatchs SELECT *, now() FROM dispatchs WHERE id = '".$id."'";
	mysql_query($query);


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
	$query = "DELETE FROM dispatchprevisions WHERE id = '".$dispatchPrevisionId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	return $obj;
}

function deleteDispatchPrevisionExtended($previsionId, $dispatchId) {

	$obj->successful = true;

	// delete
	$query = "DELETE FROM dispatchprevisions WHERE previsionId = '".$previsionId."' AND dispatchId = '".$dispatchId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	return $obj;
}


function deleteCarry($carryId) {

	$obj->successful = true;

	// delete
	$query = "UPDATE dispatchprevisions SET carryId = null WHERE carryId = '".$carryId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	$query = "DELETE FROM dispatchcarries WHERE id = '".$carryId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	return $obj;
}


function editDispatchPrevisionNumberField($prevision, $field) {

	$obj->successful = true;
	$obj->method = "editPrevisionNumberField($field)";
	$obj->prevision = $prevision;

	$update = "UPDATE dispatchprevisions SET $field = ".$prevision->$field." WHERE id = '".$prevision->dpId."'";

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

	$update = "UPDATE dispatchprevisions SET $field = '".$prevision->$field."' WHERE id = '".$prevision->dpId."'";

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

	$update = "UPDATE dispatchprevisions SET carryId = $carryId
						 WHERE id = '".$prevision->dpId."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function isInSomeDispatch($previsionId) {

	$query = "SELECT count(*) as count FROM dispatchprevisions dp where dp.previsionId = '$previsionId'";

	$result = mysql_query($query);

	$rows = fetch_array($result);

	return $rows[0]['count'] == '0' ? false : true;
}


?>
