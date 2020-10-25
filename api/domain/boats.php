<?php

function getBoats() {

	$prevBoat="";
	$prevSufix="";

	$query = "SELECT od.*, b.id as boatId FROM onedesign od join boats b on b.boat = od.boat ORDER BY boat, sailPrefix";

	$result = mysql_query($query);

	$boats = array(); $cloths = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		if($prevBoat == "" || $prevBoat != $row['boat']) {

			$boat = new stdClass();
			$boat->boat = $row['boat'];
			$boat->boatId = $row['boatId'];

			array_push($boats, $boat);

			$prevBoat = $row['boat'];
			$prevSufix="";

			$type = array();

			if(!isset($type[$row['sailPrefix']]))
				$type[$row['sailPrefix']] = array();


			$cloth = new stdClass();
			$cloth->id = $row['clothId'];
			$cloth->mts = $row['mts'];

			array_push($type[$row['sailPrefix']], $cloth);

			$boat->cloths = $type;
		}
		else {
			if(!isset($type[$row['sailPrefix']]))
				$type[$row['sailPrefix']] = array();

			$cloth = new stdClass();
			$cloth->id = $row['clothId'];
			$cloth->mts = $row['mts'];

			array_push($type[$row['sailPrefix']], $cloth);

			$boat->cloths = $type;
		}
	}

	return $boats;
}


function getOneDesignBoats() {
	global $country, $storedCountry;

	$where = "";
	if (isset($storedCountry)) {
		$where = " WHERE country = '$storedCountry' ";
	}

	$query = "SELECT boat, country FROM onedesign $where GROUP BY boat, country ORDER BY boat";

	$result = mysql_query($query);

	$boats = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$query = "SELECT sailPrefix as sail FROM onedesign WHERE boat = '".$row['boat']."' AND country = '".$row['country']."' GROUP BY sail ORDER BY sail";

		$resultsails = mysql_query($query);

		$sails = array();
		while($rowSail = mysql_fetch_array($resultsails, MYSQL_ASSOC)) {
			$sail = new stdClass();
			$sail->sail = $rowSail['sail'];

			// default cloths of every sail
			$query = "SELECT o.*, c.name FROM onedesign o JOIN cloths c on c.id = o.clothId WHERE boat = '".$row['boat']."' AND sailPrefix = '".$rowSail['sail']."' AND c.country = '".$row['country']."' ORDER BY c.name";

			$resultcloths = mysql_query($query);

			$cloths = array();
			while($rowCloth = mysql_fetch_array($resultcloths, MYSQL_ASSOC)) {
				$cloth = new stdClass();
				$cloth->clothId = $rowCloth['clothId'];
				$cloth->name = $rowCloth['name'];
				$cloth->mts = $rowCloth['mts'];
				$cloth->odId = $rowCloth['id'];

				array_push($cloths, $cloth);
			}

			$sail->cloths = $cloths;

			array_push($sails, $sail);
		}

		$boat = new stdClass();
		$boat->boat = $row['boat'];
		$boat->country = $row['country'];
		$boat->uiId = uniqid();
		$boat->sails = $sails;

		array_push($boats, $boat);
	}

	return $boats;
}

function saveOneDesign($onedesign) {

	global $country;

	$obj->successful = true;

	$query = "INSERT INTO onedesign (id, boat, sailPrefix, clothId, mts, country) VALUES ('".$onedesign->id."', '".$onedesign->boat."', '".$onedesign->sail."', '".$onedesign->clothId."', ".$onedesign->mts.", '$country')";
	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}
	else {
		$query = "SELECT o.*, o.sailPrefix as sail, c.name as cloth FROM onedesign o JOIN cloths c on c.id = o.clothId WHERE o.id = '".$onedesign->id."'";

		$result = mysql_query($query);

		$rows = fetch_array($result);

		$obj->onedesign = new stdClass();
		$obj->onedesign = $rows[0];
	}

	return $obj;
}

function updateODModel($model) {

	global $country;

	$obj->successful = true;

	$nextSequence = isset($model->nextSequence) ? $model->nextSequence : 'null';

	$query = "UPDATE onedesignmodels SET model = '".$model->model."', minStock = '".$model->minStock."', nextSequence = $nextSequence WHERE id = ".$model->id." AND country = '$country'";
	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function updateBoatName($boat) {

	global $country;

	$obj->successful = true;

	if(!isset($boat->boat) || $boat->boat=="") {

		$obj->successful = false;
		$obj->oldName = $boat->oldName;
		return $obj;
	}

	$query = "UPDATE onedesign SET boat = '".$boat->boat."' WHERE boat = '".$boat->oldName."' AND country = '$country'";
	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function deleteOneDesignCloth($odId) {

	$obj->successful = true;

	$query = "DELETE FROM onedesign WHERE id = '$odId'";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function deleteOneDesignBoat($boat) {

	$obj->successful = true;

	$query = "DELETE FROM onedesign WHERE boat = '$boat'";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function getOneDesignCloths($boat, $sail) {
	global $country;

	$query = "SELECT * FROM onedesign WHERE boat = '$boat' AND sailPrefix = '$sail' AND country = '$country'";

	$result = mysql_query($query);

	return fetch_array($result);
}

// all models + previsions not assigned (not grouped)
function getOneDesignModels($model, $skipLoadPrevisions) {
	global $country, $storedCountry;

	$where = "";
	if (isset($storedCountry)) {
		$where = " WHERE m.country = '$storedCountry' ";
	} else {
		$where = " WHERE m.country = '$country' ";
	}

	if (isset($model)) {
		$modelCondition = " AND m.model = '$model' ";
	}

	$query = "SELECT m.*,
		v.maxSequence,
		sum(case when p.percentage > 99 then 1 else 0 end) stock, 
		sum(case when p.percentage < 100 and p.percentage >= 25 then 1 else 0 end) manufacture, 
		sum(case when p.percentage < 25 then 1 else 0 end) plotter
		FROM onedesignmodels m 
		LEFT JOIN previsions p on m.boat = p.boat and m.sail = p.sailOneDesign and p.deletedProductionOn is null and p.odAssigned = false
		LEFT JOIN v_onedesign_max_sequence_by_model v on v.boat = m.boat and v.sail = m.sail
		$where 
		$modelCondition
		GROUP BY m.boat, m.sail
		ORDER BY m.boat, m.sail";

	$result = mysql_query($query);

	return fetch_array($result);

	// $rows = array();
	// while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
	// 	if (!isset($skipLoadPrevisions) || $skipLoadPrevisions != 'true') {
	// 		// $row['previsions'] = getOneDesignModelPrevisions($row['boat'], $row['sail'], true, false, false);
	// 		// $row['previsions'] = array();
	// 	}
	// 	// $row['calculatedNextModelSerie'] = calculateOneDesignModelSerie($row['boat'], $row['sail']);

	// 	array_push($rows, $row);
	// }

	// return $rows;
}

function getOneDesignModelPrevisions($boat, $sail, $onlyAvailables, $onlyAssigned, $withCloths) {
	global $country;

	$onlyAvailableCondition = $onlyAvailables == 'true' ? ' AND odAssigned = false' : '';
	$onlyAssignedCondition = $onlyAssigned == 'true' ? ' AND odAssigned = true' : '';

	$query = "SELECT p.*, DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, DATE_FORMAT(tentativeDate,'%d-%m-%Y') as tentativeDate, DATE_FORMAT(productionDate,'%d-%m-%Y') as productionDate, DATE_FORMAT(infoDate,'%d-%m-%Y') as infoDate, DATE_FORMAT(advanceDate,'%d-%m-%Y') as advanceDate, DATE_FORMAT(fabricationDate,'%d-%m-%Y') as fabricationDate 
		FROM previsions p
		WHERE boat = '$boat' AND sailOneDesign = '$sail' AND country = '$country' AND deletedProductionOn is null 
		$onlyAvailableCondition 
		$onlyAssignedCondition";

	$result = mysql_query($query);

	// echo $onlyAvailables . $onlyAssigned;
	// echo $query;

	return isset($withCloths) && $withCloths ? previsionsWithCloths($result) : fetch_array($result);
}

function calculateOneDesignModelSerie($boat, $sail) {
	global $country;

	$query = "SELECT v.boat, m.model, v.maxSequence, m.nextSequence as manualNextSequence
		FROM v_onedesign_max_sequence_by_model v join onedesignmodels m on v.boat = m.boat and v.sail = m.sail
		WHERE v.boat = '$boat' AND v.sail = '$sail' AND v.country = '$country'";

	$result = mysql_query($query);

	// echo $query;
	$response->boat = $boat;
	$response->sail = $sail;

	$rows = fetch_array($result);
	foreach ($rows as $row) {
		$response->model = $row['model'];

		if (!is_numeric($row['maxSequence']) && isset($row['manualNextSequence'])) {
			$response->serie = $row['manualNextSequence'] + 0;
			$response->manual = true;
		} else if (is_numeric($row['maxSequence']) && !isset($row['manualNextSequence'])) {
			$response->serie = $row['maxSequence'] + 1;
			$response->view = true;
		} else if (is_numeric($row['maxSequence']) && isset($row['manualNextSequence'])) {
			$response->serie = $row['manualNextSequence'] > $row['maxSequence'] 
				? $row['manualNextSequence'] + 0 : $row['maxSequence'] + 1;
			$response->compare = true;
		} else {
			$response->serie = 0;
			$response->notset = true;
		}

		$response->successful = true;
	}

	return $response;
}

function getOneDesignModelsHistoric() {
	global $country, $storedCountry;

	$currentYear = date("Y");

	$where = "";
	if (isset($storedCountry)) {
		$where = " WHERE m.country = '$storedCountry' ";
	} else {
		$where = " WHERE m.country = '$country' ";
	}

	$query = "SELECT p.boat, p.sailOneDesign as sail, m.model, year(p.deliveryDate) as year, count(*) as amount
		FROM onedesignmodels m join previsions p on p.boat = m.boat and p.sailOneDesign = m.sail
		$where
		and 
		((p.deletedProductionOn is not null and year(p.deliveryDate) < $currentYear)
		or
		(p.odAssigned and year(p.deliveryDate) = 2020))
		GROUP BY p.boat, p.sailOneDesign, m.model, year(p.deliveryDate)
		order by p.boat, p.sailOneDesign, m.model, year(p.deliveryDate) desc";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getOneDesignModelsHistoricByModel($boat, $sail, $year) {
	global $country, $storedCountry;

	$currentYear = date("Y");

	$where = " WHERE m.country = '$country' ";

	if (isset($boat) && isset($sail)) {
		$modelCondition = " AND p.boat = '$boat' AND p.sailOneDesign = '$sail' ";
	}

	if (isset($year)) {
		$yearCondition = " AND year(p.deliveryDate) = $year ";
	}

	$query = "SELECT p.*, 
		DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate, 
		m.model, year(p.deliveryDate) as year
		FROM onedesignmodels m join previsions p on p.boat = m.boat and p.sailOneDesign = m.sail
		$where
		and 
		((p.deletedProductionOn is not null and year(p.deliveryDate) <= $currentYear)
		or
		(p.odAssigned and year(p.deliveryDate) = 2020))
		$modelCondition $yearCondition
		order by p.boat, p.sailOneDesign, m.model, year(p.deliveryDate) desc";

	$result = mysql_query($query);

	return fetch_array($result);
}

?>
