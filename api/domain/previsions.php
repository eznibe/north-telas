<?php

function getPrevisions($clothId, $designed, $expand, $production, $historic, $sellerCode, $offset, $filters)
{

	$designedCondition = "";
	if(isset($designed)) {
		$designedCondition = " AND p.designed = $designed ";
	}

	$productionCondition = "";
	$productionOrderBy = "";
	if(isset($production)) {
		$productionCondition = " AND p.deletedProductionOn is null ";
		$productionOrderBy = "p.week, ";
	}

	$historicCondition = "";
	if(isset($historic)) {
		$historicCondition = " AND p.deletedProductionOn is not null ";//and p.deletedProductionOn > '2016-06-01' ";
		$productionOrderBy = "p.orderNumber, ";
	}

	$sellerCondition = "";
	if(isset($sellerCode)) {
		$sellerCondition = " AND p.seller = '$sellerCode'";
	}

	// create QUERY according to requested place
	$query = '';
	if(isset($clothId)) {

		$query = "SELECT p.*, coalesce(p.sailDescription, p.sailOneDesign, s.description) as sailName, deliveryDate as unformattedDeliveryDate,
									   DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, DATE_FORMAT(tentativeDate,'%d-%m-%Y') as tentativeDate, DATE_FORMAT(productionDate,'%d-%m-%Y') as productionDate, DATE_FORMAT(infoDate,'%d-%m-%Y') as infoDate, DATE_FORMAT(advanceDate,'%d-%m-%Y') as advanceDate
							FROM previsions p LEFT JOIN sails s on s.id=p.sailId JOIN previsioncloth pc on pc.previsionId=p.id
							WHERE pc.clothId = '$clothId' $designedCondition ORDER by p.deliveryDate, p.id";

	}	else if (isset($expand) && $expand == 'LIST') {
		// for the prevision cards page
		$query = "SELECT p.*, coalesce(p.sailDescription, p.sailOneDesign, s.description) as sailName, deliveryDate as unformattedDeliveryDate, ".
							"       DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, DATE_FORMAT(tentativeDate,'%d-%m-%Y') as tentativeDate, DATE_FORMAT(productionDate,'%d-%m-%Y') as productionDate, DATE_FORMAT(infoDate,'%d-%m-%Y') as infoDate, DATE_FORMAT(advanceDate,'%d-%m-%Y') as advanceDate, DATE_FORMAT(deletedProductionOn,'%d-%m-%Y') as deletedProductionOn ".
							"FROM previsions p LEFT JOIN sails s on s.id=p.sailId ".
							"WHERE 1=1 AND (p.designed = false OR p.stateAccepted = false) ORDER by p.deliveryDate, p.orderNumber "
							;
	} else {
		// for the production and historic list
		$filter = createFilterCondition($filters);
		$orderBy = createOrderByCondition($filters);

		$limit = isset($filters->limit) ? "LIMIT ".$filters->limit : "";
		$offset = isset($offset) ? "OFFSET ".$offset : "";

		$select = "SELECT p.*, coalesce(p.sailDescription, p.sailOneDesign, s.description) as sailName, deliveryDate as unformattedDeliveryDate, d.id as dispatchId, d.number as dispatch, ".
							"       DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, DATE_FORMAT(tentativeDate,'%d-%m-%Y') as tentativeDate, DATE_FORMAT(productionDate,'%d-%m-%Y') as productionDate, DATE_FORMAT(infoDate,'%d-%m-%Y') as infoDate, DATE_FORMAT(advanceDate,'%d-%m-%Y') as advanceDate, DATE_FORMAT(deletedProductionOn,'%d-%m-%Y') as deletedProductionOn ";
		$body =   "FROM previsions p LEFT JOIN sails s on s.id=p.sailId LEFT JOIN dispatchprevisions dp on dp.previsionId = p.id LEFT JOIN dispatchs d on d.id = dp.dispatchId ".
							"WHERE 1=1 $filter $designedCondition $productionCondition $historicCondition $sellerCondition ".
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

		$row['count'] = $count;

		array_push($rows, $row);
	}

	return $rows;
}

function getPrevisionsBasic()
{

	$query = "SELECT p.id, p.orderNumber, p.boat, p.percentage, p.client,
									 coalesce(p.sailDescription, p.sailOneDesign, s.description) as sailName
						FROM previsions p LEFT JOIN sails s on s.id=p.sailId";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getPrevisionsUpToDate($clothId, $upToDate) {

	$query = "SELECT p.*, coalesce(p.sailDescription, p.sailOneDesign, s.description) as sailName, deliveryDate as unformattedDeliveryDate, DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, plog.mts
						FROM previsions p LEFT JOIN sails s on s.id=p.sailId
						JOIN (select * from previsionlogs pl order by date desc) plog on (plog.previsionId = p.id )
						WHERE plog.clothId = '$clothId'
							AND p.createdOn <= STR_TO_DATE('".$upToDate."', '%d-%m-%Y') AND (p.designedOn is null OR date(p.designedOn) >= STR_TO_DATE('".$upToDate."', '%d-%m-%Y'))
							AND plog.date <= STR_TO_DATE('".$upToDate."', '%d-%m-%Y')
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
		return $row;
	}

	header('HTTP/1.1 404 Not Found', true, 404);

	$obj->error = "Not found";
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

	$query = "SELECT * FROM previsions p LEFT JOIN previsionCloth pc on p.id = pc.previsionId WHERE p.id = '".$prevision->id."'";
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
	$sailId = isset($prevision->sailId) && $prevision->sailId!='' ? "'".$prevision->sailId."'" : 'null' ;
	$sailDescription = isset($prevision->sailDescription) && $prevision->sailDescription!='' ? "'".$prevision->sailDescription."'" : 'null' ;
	$sailOneDesign = isset($prevision->sailOneDesign) ? "'".$prevision->sailOneDesign."'" : 'null' ;
	$oneDesign = $prevision->oneDesign==1 ? 'true' : 'false';
	$greaterThan44 = $prevision->greaterThan44==1 ? 'true' : 'false';
	$p = isset($prevision->p) && trim($prevision->p)!='' ? $prevision->p : 'null' ;
	$e = isset($prevision->e) && trim($prevision->e)!='' ? $prevision->e : 'null' ;
	$i = isset($prevision->i) && trim($prevision->i)!='' ? $prevision->i : 'null' ;
	$j = isset($prevision->j) && trim($prevision->j)!='' ? $prevision->j : 'null' ;
	$area = isset($prevision->area) && trim($prevision->area)!='' ? $prevision->area : 'null' ;

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

	if ($num_results != 0)
	{
		logPrevisionUpdateFull($prevision->id, 'savePrevision');
		// update
		$update = "UPDATE previsions SET orderNumber = '".$prevision->orderNumber."', deliveryDate = STR_TO_DATE('".$prevision->deliveryDate."', '%d-%m-%Y'), client = '".$client."', sailId = $sailId, sailDescription = $sailDescription, boat = '".$boat."', type = '".$prevision->type."', oneDesign = ".$oneDesign.", greaterThan44 = ".$greaterThan44.
																		", p = ".$p.", e = ".$e.", i = ".$i.", j = ".$j.", area = ".$area.", sailOneDesign = $sailOneDesign, observations = '$observations'".
																		", productionObservations = '$productionObservations', designObservations = '$designObservations', dispatchId = $dispatchId".
																		", week = $week, priority = $priority, line = $line, seller = $seller, advance = $advance, percentage = $percentage".
																		", tentativeDate = $tentativeDate, productionDate = $productionDate, infoDate = $infoDate, advanceDate = $advanceDate".
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
		$insert = "INSERT INTO previsions (id, orderNumber, deliveryDate, client, sailId, sailDescription, boat,
				type, designed, oneDesign, greaterThan44, p, e, i,j, area, sailOneDesign, observations, productionObservations, designObservations,
				week, priority, line, seller, advance, percentage, tentativeDate, productionDate, infoDate, advanceDate, dispatchId)
				VALUES ('".$prevision->id."', '".$prevision->orderNumber."', STR_TO_DATE('".$prevision->deliveryDate."', '%d-%m-%Y'), '".$client."', $sailId, $sailDescription, '".$boat."', '".$prevision->type."', false, ".$oneDesign.", ".$greaterThan44.", ".
								$p.", ".$e.", ".$i.", ".$j.", ".$area.", $sailOneDesign, '$observations', '$productionObservations', '$designObservations',
								$week, $priority, $line, $seller, $advance, $percentage, $tentativeDate, $productionDate, $infoDate, $advanceDate, $dispatchId)" ;

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
			$query = "UPDATE previsionCloth SET clothId = '".$cloth->id."', mts = ".$cloth->mts." WHERE cpId = '".$cloth->cpId."'";

			if($row['clothId'] != $cloth->id) {
				// different cloth, we should mark in the log as deleted and create a new one
				$log  = "INSERT INTO previsionLogs (id, previsionId, clothId, mts, action, user) VALUES (UUID(), '".$prevision->id."', '".$row['clothId']."', 0, 2, '".$prevision->modifiedBy."')";
				$log2 = "INSERT INTO previsionLogs (id, previsionId, clothId, mts, action, user) VALUES (UUID(), '".$prevision->id."', '".$cloth->id."', ".$cloth->mts.", 0, '".$prevision->modifiedBy."')";
			}
			else if($row['mts'] != $cloth->mts) {
				// only mts changed, same cloth
				$log = "INSERT INTO previsionLogs (id, previsionId, clothId, mts, action, user) VALUES (UUID(), '".$prevision->id."', '".$cloth->id."', ".$cloth->mts.", 1, '".$prevision->modifiedBy."')";
			}
		}
		else {
			// insert pc
			$query = "INSERT INTO previsionCloth VALUES ('".$cloth->cpId."', '".$prevision->id."', '".$cloth->id."', ".$cloth->mts.")";

			$log = "INSERT INTO previsionLogs (id, previsionId, clothId, mts, action, user) VALUES (UUID(), '".$prevision->id."', '".$cloth->id."', ".$cloth->mts.", 0, '".$prevision->modifiedBy."')";
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
			$query = "DELETE from previsionCloth where cpId = '".$row['cpId']."'";

			$log  = "INSERT INTO previsionLogs (id, previsionId, clothId, mts, action) VALUES (UUID(), '".$prevision->id."', '".$row['clothId']."', ".$row['mts'].", 2)";

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

	// insert all the cloths in the prevision in the plotters table
	foreach ($prevision->cloths as $cloth) {

		$insert = "INSERT INTO plotters (id, previsionId, clothId, mtsDesign, plotterDate, manualPlotterId, observations, cutted, cuttedOn, cuttedBy)
				values ('".uniqid()."', '".$cloth->previsionId."', '".$cloth->clothId."', ".$cloth->mts.", CURRENT_DATE, null, ".$observations.", false, null, null)";

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

	return $obj;
}

function updateMts($cloth) {

	$obj->successful = true;
	$obj->method = "updateMts";
	$obj->cloth = $cloth;

	$update = "UPDATE previsionCloth SET mts = ".$cloth->mts." WHERE cpId = '".$cloth->cpId."'";

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
	}

	return $obj;
}

function getWeeksBySeason() {

	$query = "SELECT name, value FROM properties WHERE name like 'seasonWeeks%'";
	$result = mysql_query($query);

	return fetch_array($result);
}

function updateWeeksBySeason($weeks) {

	$obj->successful = true;
	$obj->method = "updateWeeksBySeason()";

	$update = "UPDATE properties SET value = '".$weeks->value."' WHERE name = '".$weeks->key."'";

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

// will log the state of the prevision just before an update will be perfomed
function logPrevisionUpdateFull($previsionId, $method) {

	$update = "INSERT INTO previsionfulllogs (id,orderNumber,deliveryDate,client,sailId,sailDescription,boat,type,designed,oneDesign,greaterThan44,p,e,i,j,area,sailOneDesign,observations,designedOn,createdOn,state,prevState,stateAccepted,stateChanged,stateAcceptedDate,seller,dispatchId,line,week,priority,percentage,advance,tentativeDate,productionDate,infoDate,advanceDate,deletedProductionOn,deletedProductionBy,productionObservations,designObservations,driveIdProduction,driveIdDesign,method,insertedon)
	 						SELECT id,orderNumber,deliveryDate,client,sailId,sailDescription,boat,type,designed,oneDesign,greaterThan44,p,e,i,j,area,sailOneDesign,observations,designedOn,createdOn,state,prevState,stateAccepted,stateChanged,stateAcceptedDate,seller,dispatchId,line,week,priority,percentage,advance,tentativeDate,productionDate,infoDate,advanceDate,deletedProductionOn,deletedProductionBy,productionObservations,designObservations,driveIdProduction,driveIdDesign
							, '$method', now() FROM previsions WHERE id = '$previsionId'";

	$obj->successful = true;
	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

?>
