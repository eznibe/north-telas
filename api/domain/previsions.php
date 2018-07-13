<?php

include_once 'logs.php';

function getPrevisions($clothId, $designed, $expand, $production, $historic, $sellerCode, $offset, $filters)
{
	global $country, $storedCountry;

	$countryCondition = " AND p.country = '$country' ";

	$designedCondition = "";
	if(isset($designed)) {
		$designedCondition = " AND p.designed = $designed ";

		if ($designed == 'false' && isset($storedCountry) && $storedCountry == 'ARG') {
			// list for design page -> remove country condition only if user stored country is not BRA
			$countryCondition = "";
		}
	}

	$productionCondition = "";
	$productionOrderBy = "";
	if(isset($production)) {
		$productionCondition = " AND p.deletedProductionOn is null AND p.designOnly = false ";
		$productionOrderBy = "p.week, ";
	}

	$historicCondition = "";
	if(isset($historic)) {
		$historicCondition = " AND p.deletedProductionOn is not null AND p.designOnly = false ";//and p.deletedProductionOn > '2016-06-01' ";
		$productionOrderBy = "p.orderNumber, ";
	}

	$sellerCondition = "";
	if(isset($sellerCode)) {
		$sellerCondition = " AND p.seller = '$sellerCode'";
	}

	// create QUERY according to requested place
	$query = '';
	if(isset($clothId)) {

		$query = "SELECT p.*, coalesce(p.sailDescription, p.sailOneDesign, concat(sg.name,' - ',s.description)) as sailName, deliveryDate as unformattedDeliveryDate,
									   DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, DATE_FORMAT(tentativeDate,'%d-%m-%Y') as tentativeDate, DATE_FORMAT(productionDate,'%d-%m-%Y') as productionDate, DATE_FORMAT(infoDate,'%d-%m-%Y') as infoDate, DATE_FORMAT(advanceDate,'%d-%m-%Y') as advanceDate
							FROM previsions p LEFT JOIN sails s on s.id=p.sailId LEFT JOIN sailgroups sg on sg.id=s.sailGroupId JOIN previsioncloth pc on pc.previsionId=p.id
							WHERE pc.clothId = '$clothId' AND p.country = '$country' $designedCondition ORDER by p.deliveryDate, p.id";

	}	else if (isset($expand) && $expand == 'LIST') {
		// for the prevision cards page
		$query = "SELECT p.*, coalesce(p.sailDescription, p.sailOneDesign, concat(sg.name,' - ',s.description)) as sailName, deliveryDate as unformattedDeliveryDate, ".
							"       DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, DATE_FORMAT(tentativeDate,'%d-%m-%Y') as tentativeDate, DATE_FORMAT(productionDate,'%d-%m-%Y') as productionDate, DATE_FORMAT(infoDate,'%d-%m-%Y') as infoDate, DATE_FORMAT(advanceDate,'%d-%m-%Y') as advanceDate, DATE_FORMAT(deletedProductionOn,'%d-%m-%Y') as deletedProductionOn ".
							"FROM previsions p LEFT JOIN sails s on s.id=p.sailId LEFT JOIN sailgroups sg on sg.id=s.sailGroupId ".
							"WHERE 1=1 AND p.country = '$country' AND (p.designed = false OR p.stateAccepted = false) ORDER by p.deliveryDate, p.orderNumber "
							;
	} else {
		// for the production and historic list (also design list)
		$filter = createFilterCondition($filters);
		$orderBy = createOrderByCondition($filters);

		$limit = isset($filters->limit) ? "LIMIT ".$filters->limit : "";
		$offset = isset($offset) ? "OFFSET ".$offset : "";

		$select = "SELECT p.*, coalesce(p.sailDescription, p.sailOneDesign, concat(sg.name,' - ',s.description)) as sailName, deliveryDate as unformattedDeliveryDate, d.id as dispatchId, d.number as dispatch, ".
							"       DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, DATE_FORMAT(tentativeDate,'%d-%m-%Y') as tentativeDate, DATE_FORMAT(productionDate,'%d-%m-%Y') as productionDate, DATE_FORMAT(infoDate,'%d-%m-%Y') as infoDate, DATE_FORMAT(advanceDate,'%d-%m-%Y') as advanceDate, DATE_FORMAT(deletedProductionOn,'%d-%m-%Y') as deletedProductionOn ";
		$body =   "FROM previsions p LEFT JOIN sails s on s.id=p.sailId LEFT JOIN sailgroups sg on sg.id=s.sailGroupId LEFT JOIN dispatchprevisions dp on dp.previsionId = p.id LEFT JOIN dispatchs d on d.id = dp.dispatchId ".
							"WHERE 1=1 AND p.orderNumber != '' $countryCondition $filter $designedCondition $productionCondition $historicCondition $sellerCondition ".
							"ORDER by $orderBy $productionOrderBy -p.deliveryDate desc, p.orderNumber ";
		$footer = "$limit $offset"
							;

		$query = $select . $body . $footer;
	}

 // 	return $query;

 	$count = "SELECT count(*) as count " . $body;
	$result = mysql_query($count);
	$count = fetch_array($result);
	$count = $count[0]['count'];
	// return $count;

	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$query = "SELECT * FROM previsioncloth pc JOIN cloths c on c.id=pc.clothId WHERE pc.previsionId = '".$row['id']."'";

		$subresult = mysql_query($query);

		$subrows = array();
		while($subrow = mysql_fetch_array($subresult, MYSQL_ASSOC)) {
			array_push($subrows, $subrow);
		}

		$row['cloths'] = $subrows;

		// $row['subquery'] = $query;

		$row['designed'] = $row['designed']==1 ? true : false;
		$row['oneDesign'] = $row['oneDesign']==1 ? true : false;
		$row['greaterThan44'] = $row['greaterThan44']==1 ? true : false;
		$row['excludeFromStateCalculation'] = $row['excludeFromStateCalculation']==1 ? true : false;
		$row['excludeFromTemporariesCalculation'] = $row['excludeFromTemporariesCalculation']==1 ? true : false;
		$row['designOnly'] = $row['designOnly']==1 ? true : false;

		$row['count'] = $count;

		array_push($rows, $row);
	}

	return $rows;
}

function getPrevisionsBasic()
{
	global $country;

	$query = "SELECT p.id, p.orderNumber, p.boat, p.percentage, p.client,
									 coalesce(p.sailDescription, p.sailOneDesign, s.description) as sailName
						FROM previsions p LEFT JOIN sails s on s.id=p.sailId WHERE p.country = '$country'";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getPrevisionsUpToDate($clothId, $upToDate) {

	global $country;

	$query = "SELECT p.*, coalesce(p.sailDescription, p.sailOneDesign, concat(sg.name,' - ',s.description)) as sailName, deliveryDate as unformattedDeliveryDate, DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, plog.mts
						FROM previsions p LEFT JOIN sails s LEFT JOIN sailgroups sg on sg.id=s.sailGroupId on s.id=p.sailId
						JOIN (select * from previsionlogs pl order by date desc) plog on (plog.previsionId = p.id )
						WHERE plog.clothId = '$clothId'
							AND p.createdOn <= STR_TO_DATE('".$upToDate."', '%d-%m-%Y') AND (p.designedOn is null OR date(p.designedOn) >= STR_TO_DATE('".$upToDate."', '%d-%m-%Y'))
							AND plog.date <= STR_TO_DATE('".$upToDate."', '%d-%m-%Y')
							AND p.country = '$country'
						ORDER by p.deliveryDate, p.id, plog.date desc";

	$result = mysql_query($query);

	$rows = array();
	$lastPrevisionId = "";
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		if($lastPrevisionId != $row['id']) {
			$row['designed'] = $row['designed']==1 ? true : false;
			$row['oneDesign'] = $row['oneDesign']==1 ? true : false;

			array_push($rows, $row);
		}

		$lastPrevisionId = $row['id'];
	}

	return $rows;
}

function getPrevision($id) {

	$query = "SELECT *, DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate FROM previsions WHERE id = '$id'";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$row['successful'] = true;
		return $row;
	}

	$obj = array();
	$obj['successful'] = false;

	return $obj;
}

// check if the given orderNumber already exist in the system
function validateOrderNumber($orderNumber) {

	global $country;

	$obj->valid = true;

	$query = "SELECT * FROM previsions p WHERE p.orderNumber = '$orderNumber' and p.country = '$country' and id not like '%-prev%'";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$obj->valid = false;
		$obj->previsionId = $row['id'];
		return $obj;
	}

	return $obj;
}

function checkAllClothsCutted($id) {

	$query = "SELECT count(*) as count FROM plotters WHERE previsionId = '$id' and cutted = false";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$allCutted = $row['count'] == "0";
	}

	$prevision = getPrevision($id);

	$prevision['allCutted'] = $allCutted;

	return $prevision;
}


function savePrevision($prevision)
{
	$query = "SELECT * FROM previsions p LEFT JOIN previsioncloth pc on p.id = pc.previsionId WHERE p.id = '".$prevision->id."'";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	$obj->method = 'savePrevision';
	$obj->successful = false;

	$observations = isset($prevision->observations) ? $prevision->observations : '' ;
	$productionObservations = isset($prevision->productionObservations) ? $prevision->productionObservations : '' ;
	$designObservations = isset($prevision->designObservations) ? $prevision->designObservations : '' ;
	$boat = isset($prevision->boat) ? $prevision->boat : '' ;
	$client = isset($prevision->client) ? $prevision->client : '' ;
	$sailId = isset($prevision->sailId) && $prevision->sailId!='' ? $prevision->sailId : 'null' ;
	$sailGroupId = isset($prevision->sailGroupId) && $prevision->sailGroupId!='' ? $prevision->sailGroupId : 'null' ;
	$sailDescription = isset($prevision->sailDescription) && $prevision->sailDescription!='' ? "'".$prevision->sailDescription."'" : 'null' ;
	$sailOneDesign = isset($prevision->sailOneDesign) ? "'".$prevision->sailOneDesign."'" : 'null' ;
	$oneDesign = $prevision->oneDesign==1 ? 'true' : 'false';
	$excludeFromStateCalculation = $prevision->excludeFromStateCalculation==1 ? 'true' : 'false';
	$excludeFromTemporariesCalculation = $prevision->excludeFromTemporariesCalculation==1 ? 'true' : 'false';
	$greaterThan44 = $prevision->greaterThan44==1 ? 'true' : 'false';
	$p = isset($prevision->p) && trim($prevision->p)!='' ? $prevision->p : 'null' ;
	$e = isset($prevision->e) && trim($prevision->e)!='' ? $prevision->e : 'null' ;
	$i = isset($prevision->i) && trim($prevision->i)!='' ? $prevision->i : 'null' ;
	$j = isset($prevision->j) && trim($prevision->j)!='' ? $prevision->j : 'null' ;
	$area = isset($prevision->area) && trim($prevision->area)!='' ? $prevision->area : 'null' ;
	$rizo = isset($prevision->rizo) && trim($prevision->rizo)!='' ? $prevision->rizo : 'null' ;
	$country = isset($prevision->country) && trim($prevision->country)!='' ? $prevision->country : 'ARG' ;
	$deliveryDateManuallyUpdated = $prevision->deliveryDateManuallyUpdated == '1' ? 'true' : 'false';

	$week = isset($prevision->week) && trim($prevision->week)!='' ? $prevision->week : 'null' ;
	$priority = isset($prevision->priority) && trim($prevision->priority)!='' ? $prevision->priority : 'null' ;
	$line = isset($prevision->line) && trim($prevision->line)!='' ? "'".$prevision->line."'" : 'null' ;
	$seller = isset($prevision->seller) && trim($prevision->seller)!='' ? "'".$prevision->seller."'" : 'null' ;
	$advance = isset($prevision->advance) && trim($prevision->advance)!='' ? $prevision->advance : 'null' ;
	$percentage = isset($prevision->percentage) && trim($prevision->percentage)!='' ? $prevision->percentage : 'null' ;
	$tentativeDate = isset($prevision->tentativeDate) && trim($prevision->tentativeDate)!='' ? "STR_TO_DATE('".$prevision->tentativeDate."', '%d-%m-%Y')" : 'null' ;
	$productionDate = isset($prevision->productionDate) && trim($prevision->productionDate)!='' ? "STR_TO_DATE('".$prevision->productionDate."', '%d-%m-%Y')" : 'null' ;
	$infoDate = isset($prevision->infoDate) && trim($prevision->infoDate)!='' ? "STR_TO_DATE('".$prevision->infoDate."', '%d-%m-%Y')" : 'null' ;
	$advanceDate = isset($prevision->advanceDate) && trim($prevision->advanceDate)!='' ? "STR_TO_DATE('".$prevision->advanceDate."', '%d-%m-%Y')" : 'null' ;
	$dispatchId = isset($prevision->dispatchId) && trim($prevision->dispatchId)!='' ? "'".$prevision->dispatchId."'" : 'null' ;

	$designer = isset($prevision->designer) && trim($prevision->designer)!='' ? $prevision->designer : '' ;
	$designHours = isset($prevision->designHours) && trim($prevision->designHours)!='' ? $prevision->designHours : 'null' ;
	$designWeek = isset($prevision->designWeek) && trim($prevision->designWeek)!='' ? $prevision->designWeek : 'null' ;
	$designOnly = $prevision->designOnly==1 ? 'true' : 'false';
	$designOnlyCloth = isset($prevision->designOnlyCloth) && trim($prevision->designOnlyCloth)!='' ? $prevision->designOnlyCloth : '' ;

	if ($num_results != 0)
	{
		logPrevisionUpdateFull($prevision->id, 'savePrevision');
		// update
		$update = "UPDATE previsions SET orderNumber = '".$prevision->orderNumber."', deliveryDate = STR_TO_DATE('".$prevision->deliveryDate."', '%d-%m-%Y'), client = '".$client."', sailId = $sailId, sailGroupId = $sailGroupId, sailDescription = $sailDescription, boat = '".$boat."', type = '".$prevision->type."', oneDesign = ".$oneDesign.", greaterThan44 = ".$greaterThan44.
																		", p = ".$p.", e = ".$e.", i = ".$i.", j = ".$j.", area = ".$area.", sailOneDesign = $sailOneDesign, observations = '$observations'".
																		", productionObservations = '$productionObservations', designObservations = '$designObservations', dispatchId = $dispatchId".
																		", week = $week, priority = $priority, line = $line, seller = $seller, advance = $advance, percentage = $percentage".
																		", tentativeDate = $tentativeDate, productionDate = $productionDate, infoDate = $infoDate, advanceDate = $advanceDate, rizo = $rizo, country = '$country'".
																		", deliveryDateManuallyUpdated = $deliveryDateManuallyUpdated, excludeFromStateCalculation = $excludeFromStateCalculation, excludeFromTemporariesCalculation = $excludeFromTemporariesCalculation".
																		", designer = '$designer', designHours = $designHours, designWeek = $designWeek, designOnly = $designOnly, designOnlyCloth = '$designOnlyCloth'".
																		" WHERE id = '".$prevision->id."'";

		if(mysql_query($update)) {
			$obj->successful = true;
			;
		}
		else {
			$obj->successfulUpdate = false;
			$obj->update = $update;
		}
	}
	else {
		// insert
		$insert = "INSERT INTO previsions (id, orderNumber, deliveryDate, client, sailId, sailGroupId, sailDescription, boat,
				type, designed, oneDesign, greaterThan44, p, e, i,j, area, sailOneDesign, observations, productionObservations, designObservations,
				week, priority, line, seller, advance, percentage, tentativeDate, productionDate, infoDate, advanceDate, dispatchId, rizo, country, excludeFromStateCalculation, excludeFromTemporariesCalculation,
			  designer, designHours, designWeek, designOnly, designOnlyCloth)
				VALUES ('".$prevision->id."', '".$prevision->orderNumber."', STR_TO_DATE('".$prevision->deliveryDate."', '%d-%m-%Y'), '".$client."', $sailId, $sailGroupId, $sailDescription, '".$boat."', '".$prevision->type."', false, ".$oneDesign.", ".$greaterThan44.", ".
								$p.", ".$e.", ".$i.", ".$j.", ".$area.", $sailOneDesign, '$observations', '$productionObservations', '$designObservations',
								$week, $priority, $line, $seller, $advance, $percentage, $tentativeDate, $productionDate, $infoDate, $advanceDate, $dispatchId, $rizo, '$country', $excludeFromStateCalculation, $excludeFromTemporariesCalculation,
								'$designer', $designHours, $designWeek, $designOnly, '$designOnlyCloth')" ;

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
		handleCloths($prevision, $rows, $obj);
	}

	$obj->prevision = $prevision;

	return $obj;
}

function handleCloths($prevision, $rows, $obj) {

	$obj->successfulCloths = true;

	foreach ($prevision->cloths as $cloth) {

		$row = existsCP($cloth, $rows);

		$log  = "";
		$log2 = "";

		if($row != null) {
			// update pc
			$query = "UPDATE previsioncloth SET clothId = '".$cloth->id."', mts = ".$cloth->mts." WHERE cpId = '".$cloth->cpId."'";

			if($row['clothId'] != $cloth->id) {
				// different cloth, we should mark in the log as deleted and create a new one
				$log  = "INSERT INTO previsionlogs (id, previsionId, clothId, mts, action, user) VALUES (UUID(), '".$prevision->id."', '".$row['clothId']."', 0, 2, '".$prevision->modifiedBy."')";
				$log2 = "INSERT INTO previsionlogs (id, previsionId, clothId, mts, action, user) VALUES (UUID(), '".$prevision->id."', '".$cloth->id."', ".$cloth->mts.", 0, '".$prevision->modifiedBy."')";
			}
			else if($row['mts'] != $cloth->mts) {
				// only mts changed, same cloth
				$log = "INSERT INTO previsionlogs (id, previsionId, clothId, mts, action, user) VALUES (UUID(), '".$prevision->id."', '".$cloth->id."', ".$cloth->mts.", 1, '".$prevision->modifiedBy."')";
			}
		}
		else {
			// insert pc
			$query = "INSERT INTO previsioncloth VALUES ('".$cloth->cpId."', '".$prevision->id."', '".$cloth->id."', ".$cloth->mts.")";

			$log = "INSERT INTO previsionlogs (id, previsionId, clothId, mts, action, user) VALUES (UUID(), '".$prevision->id."', '".$cloth->id."', ".$cloth->mts.", 0, '".$prevision->modifiedBy."')";
		}

		if(!mysql_query($query)) {
			$obj->successfulCloths = false;
			$obj->queryCloths = $query;
		}
		else {
			if(isset($log)) {
				mysql_query($log);
			}
			if(isset($log2)) {
				mysql_query($log2);
			}
		}
	}

	// check to remove deleted pc
	foreach ($rows as $row) {

		$found=false;
		foreach ($prevision->cloths as $cloth) {

			if(isset($row['cpId']) && $row['cpId'] == $cloth->cpId)
				$found=true;
		}

		if(!$found) {
			$query = "DELETE from previsioncloth where cpId = '".$row['cpId']."'";

			$log  = "INSERT INTO previsionlogs (id, previsionId, clothId, mts, action) VALUES (UUID(), '".$prevision->id."', '".$row['clothId']."', ".$row['mts'].", 2)";

			if(!mysql_query($query)) {
				$obj->successfulCloths = false;
				$obj->queryCloths = $query;
			}
			else {
				mysql_query($log);
			}
		}
	}
}

function existsCP($cloth, $rows) {

	foreach ($rows as $row) {
		if($row['cpId'] == $cloth->cpId) {
			return $row;
		}
	}

	return null;
}

function setDesigned($prevision) {

	$obj->successful = true;
	$obj->method = "setDesigned";
	$obj->prevision = $prevision;

	$observations = (isset($prevision->observations) && $prevision->observations!='') ? "'".$prevision->observations."'" : 'null';

	// TODO check the prevision is not already designed
	$query = "SELECT * FROM previsions p WHERE p.id = '".$prevision->id."' ";

	$result = mysql_query($query);

	while($subrow = mysql_fetch_array($result, MYSQL_ASSOC)) { // unique result

		$isDesigned = $subrow['designed'];
	}

	if ($isDesigned == "0") {

		// insert all the cloths in the prevision in the plotters table
		foreach ($prevision->cloths as $cloth) {

			$insert = "INSERT INTO plotters (id, previsionId, clothId, mtsDesign, plotterDate, manualPlotterId, observations, cutted, cuttedOn, cuttedBy, country)
			values ('".uniqid()."', '".$cloth->previsionId."', '".$cloth->clothId."', ".$cloth->mts.", CURRENT_DATE, null, ".$observations.", false, null, null, '".$prevision->country."')";

			if(!mysql_query($insert)) {
				$obj->successfulInsert = false;
				$obj->insert = $insert;
			}
			else {
				$obj->successfulInsert = true;

				logPrevisionUpdateFull($prevision->id, 'setDesigned');

				$update = "UPDATE previsions SET designed = true, designedOn = CURRENT_DATE WHERE id = '".$prevision->id."'";

				if(!mysql_query($update))
					$obj->successful = false;
			}
		}

		$prevision->designed = true;

	} else {
		// log intention to setdesigned a prevision already designed
		$log->type = "setDesigned.alreadyDesigned";
		$log->log = $prevision->id;
		$log->user = "backend";
		addLog($log);

		$obj->successful = false;
	}

	return $obj;
}

function updateMts($cloth) {

	$obj->successful = true;
	$obj->method = "updateMts";
	$obj->cloth = $cloth;

	$update = "UPDATE previsioncloth SET mts = ".$cloth->mts." WHERE cpId = '".$cloth->cpId."'";

	if(!mysql_query($update))
		$obj->successful = false;

	return $obj;
}

function editPrevisionField($prevision, $field) {

	$obj->successful = true;
	$obj->method = "editPrevisionField($field)";
	$obj->prevision = $prevision;

	logPrevisionUpdateFull($prevision->id, 'editPrevisionField('.$field.')');

	$update = "UPDATE previsions SET $field = '".$prevision->$field."' WHERE id = '".$prevision->id."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function editPrevisionNumberField($prevision, $field) {

	$obj->successful = true;
	$obj->method = "editPrevisionNumberField($field)";
	$obj->prevision = $prevision;

	logPrevisionUpdateFull($prevision->id, 'editPrevisionNumberField('.$field.')');

	$update = "UPDATE previsions SET $field = ".$prevision->$field." WHERE id = '".$prevision->id."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function editPrevisionDate($prevision, $field) {

	$obj->successful = true;
	$obj->method = "updatePrevisionDate($field)";
	$obj->prevision = $prevision;

	$setStr = isset($prevision->$field) ? "STR_TO_DATE('".$prevision->$field."', '%d-%m-%Y')" : 'null';

	logPrevisionUpdateFull($prevision->id, 'editPrevisionDate('.$field.')');

	$update = "UPDATE previsions SET $field = $setStr WHERE id = '".$prevision->id."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	} else if ($field == 'deliveryDate') {
		// special case for deliveryDate: should set as manually modified
		$update = "UPDATE previsions SET deliveryDateManuallyUpdated = true WHERE id = '".$prevision->id."'";

		if(!mysql_query($update)) {
			$obj->successful = false;
			$obj->update = $update;
		}
	}

	return $obj;
}

function getWeeksBySeason() {
	global $country;

	$query = "SELECT name, value FROM properties p WHERE p.country = '$country' AND name like 'seasonWeeks%'";
	$result = mysql_query($query);

	return fetch_array($result);
}

function updateWeeksBySeason($weeks) {

	global $country;

	$obj->successful = true;
	$obj->method = "updateWeeksBySeason()";

	$update = "UPDATE properties SET value = '".$weeks->value."' WHERE name = '".$weeks->key."' AND country = '$country'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function createPrevisionClothsFilterCondition($values, $column) {

	$filter = "";

	// if (isset($values) && count($values) > 0) {
	// 	$filter .= " AND ( ";
	// 	foreach ($values as $value) {
	// 		$filter .= " $column like '%". $value ."%'";
	// 		$filter .= " OR ";
	// 	}
	// 	$filter = substr($filter, 0, -3) . " ) ";
	// }

	if (isset($values) && count($values) > 0) {
		$filter .= " AND $column IN ( ";
		foreach ($values as $value) {
			$filter .= "'". $value ."', ";
		}
		$filter = substr($filter, 0, -2) . " ) ";
	}

	return $filter;
}

function createFilterCondition($filters) {

	$filter = "";

	foreach ($filters->list as $selection) {

		if (isset($selection->type) && isset($selection->values) && ($selection->type == "str" || $selection->type == "arr")) {
			if (isSpecialFilterCase($selection->key)) {
				$filter .= handleSpecialFilterCase($selection->key, $selection->values);
			} else {
				$filter .= " AND ( ";
				foreach ($selection->values as $value) {
					$filter .= $selection->key . " like '%". $value ."%'";
					$filter .= " OR ";
				}
				$filter = substr($filter, 0, -3) . " ) ";
			}

		} else if (isset($selection->type) && isset($selection->values) && $selection->type == "nr") {
			// $filter .= " AND ".$selection->key." = ". $selection->value;
			$filter .= " AND ( ";
			foreach ($selection->values as $value) {
				$filter .= $selection->key . " = " . $value;
				$filter .= " OR ";
			}
			$filter = substr($filter, 0, -3) . " ) ";

		} else if (isset($selection->type) && isset($selection->values) && $selection->type == "date") {
			// $filter .= " AND STR_TO_DATE('".$selection->value."', '%d-%m-%Y') = ". $selection->key;
			$filter .= " AND ( ";
			foreach ($selection->values as $value) {
				$filter .= " STR_TO_DATE('".$value."', '%d-%m-%Y') = ". $selection->key;
				$filter .= " OR ";
			}
			$filter = substr($filter, 0, -3) . " ) ";
		}

	}

	if (isset($filters->searchBox) && $filters->searchBox != "") {
		$filter .= " AND (p.orderNumber LIKE '%". $filters->searchBox . "%' OR p.client LIKE '%". $filters->searchBox . "%' OR p.boat LIKE '%". $filters->searchBox . "%')";
	}

	return $filter;
}

function createOrderByCondition($filters) {

	$orderBy = "";

	foreach ($filters->orderList as $selection) {

		if (isset($selection->key) && ($selection->type == "date" || $selection->type == "nr")) {
			// note: use '-' to move null date values to the end
			$orderBy .= ($selection->mode == "order.ascending" ? '-' : '') . $selection->key . " desc, ";
		} else if (isset($selection->key) && $selection->type == "str") {
			$orderBy .= "ISNULL(".$selection->key."), " . $selection->key . ($selection->mode == "order.ascending" ? ' asc' : ' desc') . ", ";
		}
	}

	return $orderBy;
}

function isSpecialFilterCase($key) {
	return $key == 'sailName' || $key == "cloths";
}

function handleSpecialFilterCase($key, $values) {

	if ($key == "sailName") {
		// return " AND (p.sailDescription like '%". $value ."%' OR p.sailOneDesign like '%". $value ."%' OR s.description like '%". $value ."%')";
		$filter = " AND ( ";
		foreach ($values as $value) {
			$filter .= "(p.sailDescription like '%". $value ."%' OR p.sailOneDesign like '%". $value ."%' OR s.description like '%". $value ."%')";
			$filter .= " OR ";
		}
		$filter = substr($filter, 0, -3) . " ) ";
		return $filter;

	} else if ($key = "cloths") {
		$previsionClothsFilter = createPrevisionClothsFilterCondition($values, 'c2.name');

		if ($previsionClothsFilter != "") {

			// $query = "SELECT p.id FROM previsions p join previsioncloth pc on pc.previsionId=p.id JOIN cloths c on c.id=pc.clothId
			// 					WHERE 1=1 $previsionClothsFilter
			// 					GROUP BY p.id";
			//
			// $filter .= " AND p.id in ( ";
			//
			// $result = mysql_query($query);
			// while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
			// 	$filter .= "'" . $row['id'] . "', ";
			// }
			//
			// $filter = substr($filter, 0, -2) . " ) ";
			// return $filter;

			return " AND p.id in (SELECT p2.id FROM previsions p2 join previsioncloth pc2 on pc2.previsionId=p2.id JOIN cloths c2 on c2.id=pc2.clothId WHERE 1=1 $previsionClothsFilter GROUP BY p2.id ) ";

			// return " AND p.id in (SELECT id FROM v_grouped_previsioncloths WHERE 1=1 $previsionClothsFilter) ";
		}
	}

	return "";
}

function deletePrevision($id) {

	$obj->successful = true;

	// delete
	$query = "DELETE FROM previsioncloth WHERE previsionId = '".$id."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	logPrevisionUpdateFull($id, 'deletePrevision');

	$query = "DELETE FROM previsions WHERE id = '".$id."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
	}

	return $obj;
}

function weekUp($req) {

	$obj->successful = true;

	$column = $req->column;

	if (empty($req->ids)) {
		// no selection -> update all previsions with week betwwen 1 and 8
		$update = "UPDATE previsions SET $column = $column + 1 WHERE $column >= 1 and $column <= 8";

		if(!mysql_query($update)) {
			$obj->successful = false;
			$obj->update = $update;
		} else {
			$log->type = "info.weeksUp";
			$log->log = "";
			$log->user = $req->user;
			addLog($log);
		}

	} else {

		foreach ($req->ids as $id) {
			logPrevisionUpdateFull($id, 'weekUp');

			$update = "UPDATE previsions SET $column = $column + 1 WHERE id = '$id'";

			if(!mysql_query($update)) {
				$obj->successful = false;
				$obj->update = $update;
			}
		}
	}

	return $obj;
}

function weekDown($req) {

	$obj->successful = true;

	$column = $req->column;

	if (empty($req->ids)) {
		// no selection -> update all previsions with week betwwen 1 and 8
		$update = "UPDATE previsions SET $column = $column - 1 WHERE $column >= 2 and $column <= 9";

		if(!mysql_query($update)) {
			$obj->successful = false;
			$obj->update = $update;
		} else {
			$log->type = "info.weeksDown";
			$log->log = "";
			$log->user = $req->user;
			addLog($log);
		}

	} else {

		foreach ($req->ids as $id) {
			logPrevisionUpdateFull($id, 'weekDown');

			$update = "UPDATE previsions SET $column = (case when $column > 0 then $column-1 else 0 end) WHERE id = '$id'";

			if(!mysql_query($update)) {
				$obj->successful = false;
				$obj->update = $update;
			}
		}
	}


	return $obj;
}

function getDesignHistorics($startDate, $endDate, $type) {

	global $country;

	// all cloths between dates
	$condition  = " AND STR_TO_DATE('$startDate', '%d-%m-%Y') <= p.designedOn AND STR_TO_DATE('$endDate', '%d-%m-%Y') >= p.designedOn ";

	if ($type === 'BY_DESIGNER') {
		$query = "SELECT coalesce(designer, '-') as designer, count(*) amount, sum(designHours) as sumDesignHours
							FROM previsions p
							where p.designHours > 0 $condition
							-- AND p.country = '$country'
							group by designer
							order by designer";

	} else if ($type === 'BY_ORDERS') {

		$query = "SELECT p.*, coalesce(designer, '-') as designer, DATE_FORMAT(designedOn,'%d-%m-%Y') as formattedDate
							FROM previsions p
							where designHours > 0 $condition
							order by designedOn desc, designer, orderNumber";
	}

	// echo $query;

	$result = mysql_query($query);

	$rows = fetch_array($result);

	$orders = array();

	return $rows;
}

function getProperties($filter) {
	
	$query = "SELECT * FROM properties WHERE name like '%$filter%'";
	$result = mysql_query($query);
	return fetch_array($result);
}

function updateProperties($property) {
	
	$obj->successful = true;
	$obj->method = "updateProperties";

	$update = "UPDATE properties SET value = ".$property->value." WHERE name = '".$property->name."'";
	
	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

// will log the state of the prevision just before an update will be perfomed
function logPrevisionUpdateFull($previsionId, $method) {
	global $country;

	$update = "INSERT INTO previsionfulllogs (id,orderNumber,deliveryDate,client,sailId,sailDescription,boat,type,designed,oneDesign,greaterThan44,p,e,i,j,area,sailOneDesign,observations,designedOn,createdOn,state,prevState,stateAccepted,stateChanged,stateAcceptedDate,seller,dispatchId,line,week,priority,percentage,advance,tentativeDate,productionDate,infoDate,advanceDate,deletedProductionOn,deletedProductionBy,productionObservations,designObservations,driveIdProduction,driveIdDesign,sailGroupId,rizo,country,deliveryDateManuallyUpdated,method,insertedon)
	 						SELECT id,orderNumber,deliveryDate,client,sailId,sailDescription,boat,type,designed,oneDesign,greaterThan44,p,e,i,j,area,sailOneDesign,observations,designedOn,createdOn,state,prevState,stateAccepted,stateChanged,stateAcceptedDate,seller,dispatchId,line,week,priority,percentage,advance,tentativeDate,productionDate,infoDate,advanceDate,deletedProductionOn,deletedProductionBy,productionObservations,designObservations,driveIdProduction,driveIdDesign,sailGroupId,rizo,country,deliveryDateManuallyUpdated
							, '$method', now() FROM previsions WHERE id = '$previsionId'";

	$obj->successful = true;
	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

?>
