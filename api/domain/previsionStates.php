<?php

error_reporting(E_ERROR);

include_once 'previsions.php';

// Used refernces in this file
// UFA: used from available (mts used from the available stock)
// UFT: used from transit (mts used from the orders in transit)

$touchedPrevisions = array();
$priorityPrevisionsQueries = array();
$builtPrevisions = array();
$recurses = 0;
$recursesData = array();

function updateAllPrevisionsStates($clothId, $limit, $offset) {

	global $priorityPrevisionsQueries;
	$resultInfo = array();

	$conditionClothId = "";
	if(isset($clothId)) {
		$conditionClothId = " AND clothId = '$clothId' ";
	}

	$limitCondition = "";
	if(isset($limit)) {
		$limitCondition = " LIMIT $limit";
	}

	// $offsetCondition = "";
	if(isset($offset)) {
		$offsetCondition = " OFFSET $offset";
	} else {
		$offsetCondition = " OFFSET 0";
	}


	$query = "SELECT distinct(pc.clothId) as id, c.name
						FROM previsions p
						JOIN previsioncloth pc on p.id=pc.previsionId
						LEFT JOIN plotters pl on pl.previsionId = p.id
						JOIN cloths c on c.id=pc.clothId
						where (p.designed=false or (p.designed=true and pl.id is not null))
  					  and (pl.cutted is null or pl.cutted=false)
						$conditionClothId
						order by p.id, pc.clothId
						$limitCondition $offsetCondition";

	$result = mysql_query($query);
	foreach (fetch_array($result) as $cloth) {
		$clothResult = new stdClass();
		$res = updatePrevisionState($cloth['id'], true);

		$clothResult->countModified = count($res->modifiedPrevisions);
		$clothResult->clothId = $cloth['id'];
		$clothResult->clothName = $cloth['name'];
		$clothResult->updateResult = $res;

		array_push($resultInfo, $clothResult);
	}

	$obj->successful = true;
	$obj->method = "updateAllPrevisionsStates()";

	$obj->resultInfo = $resultInfo;
	//$obj->priorityPrevisionsQueries = $priorityPrevisionsQueries;

	return $obj;
}

function updatePrevisionStateWithDeliveryType($deliveryType) {

	global $country;

	$resultInfo = array();
	$clothIds = "";

	$query = "SELECT distinct(pc.clothId) as id, c.name, p.orderNumber
						FROM previsions p
						JOIN previsioncloth pc on p.id=pc.previsionId
						LEFT JOIN plotters pl on pl.previsionId = p.id
						JOIN cloths c on c.id=pc.clothId
						where (p.designed=false or (p.designed=true and pl.id is not null))
						and (pl.cutted is null or pl.cutted=false)
						and p.state = '$deliveryType'
						and p.country = '$country'
						order by p.orderNumber, p.id, pc.clothId";

	$result = mysql_query($query);
	foreach (fetch_array($result) as $cloth) {
		$clothResult = new stdClass();
		$res = updatePrevisionState($cloth['id']);

		$clothResult->countModified = count($res->modifiedPrevisions);
		$clothResult->clothId = $cloth['id'];
		$clothResult->clothName = $cloth['name'];
		$clothResult->orderNumber = $cloth['orderNumber'];

		$clothIds .= $cloth['id'] . " / " . $cloth['orderNumber'] . ", ";

		array_push($resultInfo, $clothResult);
	}

	$obj->successful = true;
	$obj->method = "updatePrevisionStateWithDeliveryType($deliveryType)";

	$obj->resultInfo = $resultInfo;

	// log manual action of previ state update
	$log->type = "info.updatePrevisionStateWithDeliveryType($deliveryType)";
	$log->log = $clothIds;//implode(" == ", $resultInfo);
	$log->user = 'admin';
	addLog($log);

	return $obj;
}

function updatePrevisionState($clothIdsStr, $skipUpdateStateAccepted) {

	global $touchedPrevisions;
	global $builtPrevisions;
	global $recurses;
	global $recursesData;
	global $country;
	global $priorityPrevisionsQueries;
	$touchedPrevisions = array();
	$builtPrevisions = array();
	$recurses = 0;

	$obj->successful = false;
	$obj->method = "updatePrevisionState($clothIdsStr)";

	$clothsDisponibility = array();

	if(isset($clothIdsStr)) {
		// update previsions with given cloths
		$clothIds = explode(",", $clothIdsStr);
		foreach ($clothIds as $clothId) {
			// process each of the given cloths

			// seek the last prevision by delivery date (including previsions of given cloth still in plotter)
			$query = "SELECT pre.id, pre.deliveryDate, pre.createdOn, pre.orderNumber, IF(pl.id is null, 'in_design', 'in_plotter') as location, c.country as clothCountry, pre.excludeFromStateCalculation, IF(pre.excludeFromStateCalculation = true, '2999-01-01', pre.deliveryDate) as deliveryDateMod
								FROM previsions pre
								JOIN previsioncloth pc on pc.previsionId = pre.id
								JOIN cloths c on c.id = pc.clothId
								LEFT JOIN plotters pl on pl.previsionId = pre.id
								WHERE (pre.designed=false or (pre.designed=true and pl.id is not null))
									AND (pl.cutted is null or pl.cutted=false)
									AND pc.clothId = '$clothId'
									AND (pl.clothId is null or pl.clothId = '$clothId')
								GROUP BY pre.id
								ORDER BY deliveryDateMod desc, pre.deliveryDate desc, pre.createdOn desc
								LIMIT 1";

			//$obj->queryInitial = array();
			// array_push($obj->queryInitial, $query);

			$result = mysql_query($query);

			$previsions = array();
			foreach (fetch_array($result) as $prevision) { // unique result

        $prevision['cloths'] = getPrevisionCloths($prevision);

				//$obj->prevCloths = $prevision['cloths'];
				$country = $prevision['clothCountry'];

				$prevision = buildPrevisionStateData($clothsDisponibility, $prevision);
				array_push($builtPrevisions, $prevision);

				//array_push($previsions, $prevision);
				touchPrevision($prevision);
			}
		}

		// must do a final iteration over the modified previsions to set the ufa and uft of those not marked as 'completed'
		// this is needed to fill those that in the first iteration were complete with a sum of ufa + uft but erased to favor others that would complete with total ufa
		$finalPrevisions = calculateUFAandUFTofUncompleted($touchedPrevisions, $clothsDisponibility);

		// update state of touched previsions
		$modifiedPrevisions = array();
		foreach ($finalPrevisions as $prevision) {
			array_push($modifiedPrevisions, calculateAndUpdateState($prevision, $skipUpdateStateAccepted, $clothsDisponibility));
		}

		$obj->successful = true;
		// $obj->tree = $previsions;
		$obj->clothsDisponibility = $clothsDisponibility;
		$obj->modifiedPrevisions = $modifiedPrevisions;
		$obj->recurses = $recurses;
		$obj->builtPrevisions = $builtPrevisions;
		$obj->recursesData = $recursesData;
		$obj->priorityPrevisionsQueries = $priorityPrevisionsQueries;
	}

	return $obj;
}

function buildPrevisionStateData(&$clothsDisponibility, $prevision) {

	global $touchedPrevisions;
	global $recurses;
	global $recursesData;
	global $builtPrevisions;

	$recurses += 1;

	$cloths = array();
	foreach ($prevision['cloths'] as $cloth) {

		// TODO remove this
		// if($cloth['clothId'] != '29') {
		// 	continue;
		// }

		fillClothDisponibility($clothsDisponibility, $cloth['clothId']);

		$priorityPrevisions = getPriorityPrevisions($cloth['clothId'], $prevision);

		$res->orderNumber = $prevision['orderNumber'];
		$res->recurses = $recurses;
		$res->priorityPrevisions = $priorityPrevisions;
		array_push($recursesData, $res);

		if(count($priorityPrevisions) == 0) {
			// there is no priority previsions => the sum of prior UFA and UFT are 0
			$sumPriorUFA = 0;
			$sumPriorUFT = 0;
			$leaf = true;
		} else {
			// recurse over the priorty previsions to continue building the state
			$modified = array();
			foreach ($priorityPrevisions as $prev) {

				$builtPrev = getAlreadyBuiltPrevision($builtPrevisions, $prev['id']);

				// to improve the recurse we check if the prevision was already built
				// in that case we dont need to recurse over it again, just update with the cloths that already have the information
				if(!$builtPrev) {
					$prev = buildPrevisionStateData($clothsDisponibility, $prev);
					array_push($builtPrevisions, $prev);
				} else {
					$prev['cloths'] = $builtPrev['cloths'];
				}

				array_push($modified, $prev);
				touchPrevision($prev);
			}
			$priorityPrevisions = $modified;

			// sum prior ufa and uft using the previsions we got previously
			$sumPriorUFA = 0;
			$sumPriorUFT = 0;
			$leaf = false;

			foreach ($priorityPrevisions as $prev) {
				// first search the cloth we are iterating to add to the sum (must always exists)
				foreach ($prev['cloths'] as $pc) {
					if ($pc['clothId'] == $cloth['clothId']) {
						$prevCloth = $pc;
					}
				}

				$sumPriorUFA += $prevCloth['UFA'];
				$sumPriorUFT += $prevCloth['UFT'];
			}
		}

		//$cloth['priorityPrevisions'] = $priorityPrevisions;

		// now it's possible to fill UFA and UFT considering sum of priority prevs ufa and uft
		$c = findClothById($cloth['clothId'], $clothsDisponibility);
		$cloth['UFA'] = getUFA($c->mtsAvailable, $sumPriorUFA, $cloth['mts']);
		$cloth['UFT'] = getUFT($c->mtsInTransit, $sumPriorUFT, $cloth['mts'], $cloth['UFA']);

		// special case I: if UFA + UFT are not enough to fill the necessary mts we release the used
		// and will be still available for other orders with less priority
		if(($cloth['UFA'] + $cloth['UFT']) < $cloth['mts']) {
			// we store the cleared ufa and uft, maybe needed in the future to show for how much it is not possible to assign
			$cloth['clearedUFA'] = $cloth['UFA'];
			$cloth['clearedUFT'] = $cloth['UFT'];

			$cloth['UFA'] = 0;
			$cloth['UFT'] = 0;
		}

		// special case II: if UFA + UFT (both different to 0) can complete the needed mts we still delete the assignations
		// because the UFA will be still available for other orders with less priority that don't require UFT
		// we come later to this prevs marked as 'completeWithUFAandUFT' at the end and we restore the values if no other prev take that UFA amount
		if(($cloth['UFA'] + $cloth['UFT']) == $cloth['mts'] && $cloth['UFA'] > 0 && $cloth['UFT'] > 0) {
			// we store the cleared ufa and uft, maybe needed in the future to show for how much it is not possible to assign
			$cloth['clearedUFA'] = $cloth['UFA'];
			$cloth['clearedUFT'] = $cloth['UFT'];

			$cloth['UFA'] = 0;
			$cloth['UFT'] = 0;

			$cloth['completeWithUFAandUFT'] = true;
		}

		if($cloth['UFA'] == $cloth['mts'] || $cloth['UFT'] == $cloth['mts']) {
			$cloth['completed'] = true;
		}

		$cloth['leaf'] = $leaf;

		//debug
		$cloth['mtsAvailable'] = $c->mtsAvailable;
		$cloth['sumPriorUFA'] = $sumPriorUFA;
		$cloth['sumPriorUFT'] = $sumPriorUFT;

		array_push($cloths, $cloth);
	}

	$prevision['cloths'] = $cloths;

	return $prevision;
}

function getAlreadyBuiltPrevision($builtPrevisions, $previsionId) {

	foreach ($builtPrevisions as $prev) {
		if($prev['id'] == $previsionId) {
			return $prev;
		}
	}
	return null;
}

function getUFA($mtsAvailable, $sumPriorUFA, $mtsNecessary) {

	$result = -1;

	if(($mtsAvailable - $sumPriorUFA - $mtsNecessary) >= 0) {
		$result = $mtsNecessary;
	} else {
		$result = $mtsAvailable - $sumPriorUFA;
	}

	return $result;
}

function getUFT($mtsInTransit, $sumPriorUFT, $mtsNecessary, $mtsUFA) {

	$result = 0;

	if(($mtsInTransit - $sumPriorUFT - ($mtsNecessary - $mtsUFA)) >= 0) {
		$result = $mtsNecessary - $mtsUFA;
	} else {
		$result = $mtsInTransit - $sumPriorUFT;
	}

	return $result;
}

function touchPrevision($prevision) {
	global $touchedPrevisions;

	foreach ($touchedPrevisions as $prev) {
		if($prev['id'] == $prevision['id']) {
			return;
		}
	}

	array_push($touchedPrevisions, $prevision);
}

function getPriorityPrevisions($clothId, &$prevision) {

	$previsionId = $prevision['id'];
	$deliveryDate = $prevision['deliveryDate'];
	$origDeliveryDate = $prevision['deliveryDate'];
	$createdOn = $prevision['createdOn'];

	if ($prevision['excludeFromStateCalculation'] == '1') {
		$deliveryDate = '2999-01-01';
	}

	// this query is including previsions of the given cloth not designed
	// and also previsions of the given cloth already designed but still to be cutted
	// all of them should be prior to the given prevision
	$query = "SELECT pre.id, pre.deliveryDate, pre.createdOn, pre.orderNumber, IF(pl.id is null, 'in_design', 'in_plotter') as location, pre.excludeFromStateCalculation, IF(pre.excludeFromStateCalculation = true, '2999-01-01', pre.deliveryDate) as deliveryDateMod
					  FROM previsions pre
						JOIN previsioncloth pc on pc.previsionId = pre.id
						LEFT JOIN plotters pl on pl.previsionId = pre.id
						WHERE (pre.designed=false or (pre.designed=true and pl.id is not null))
						  AND (pl.cutted is null or pl.cutted=false)
							AND pc.clothId = '$clothId'
						  AND (pl.clothId is null or pl.clothId = '$clothId')
						  AND
								(IF(pre.excludeFromStateCalculation = true, '2999-01-01', pre.deliveryDate) < '$deliveryDate'
							 OR
								(IF(pre.excludeFromStateCalculation = true, '2999-01-01', pre.deliveryDate) = '$deliveryDate' AND pre.deliveryDate < '$origDeliveryDate')
							 OR
 								(IF(pre.excludeFromStateCalculation = true, '2999-01-01', pre.deliveryDate) = '$deliveryDate' AND pre.deliveryDate = '$origDeliveryDate' AND pre.createdOn < '$createdOn')
							)
							AND pre.id != '$previsionId'
					  GROUP BY pre.id
						ORDER BY deliveryDateMod, pre.deliveryDate, pre.createdOn";

	//$prevision['priorityPrevQuery'] = $query;

	global $priorityPrevisionsQueries;
	array_push($priorityPrevisionsQueries, $query);

	$result = mysql_query($query);

	$previsions = array();
	foreach (fetch_array($result) as $prev) {

		$prev['cloths'] = getPrevisionCloths($prev);

		array_push($previsions, $prev);
	}

	return $previsions;
}

function getPrevisionCloths($prevision) {

	$queryPrevCloths = "SELECT pc.*
											FROM previsions pre JOIN previsioncloth pc on pc.previsionId = pre.id
											WHERE pre.id = '". $prevision['id'] ."'";

	return fetch_array(mysql_query($queryPrevCloths));
}

// fill the available stock and the in transit mts for the given order
function fillClothDisponibility(&$clothsDisponibility, $clothId) {

	// check if we already have the values in the array
	$c = findClothById($clothId, $clothsDisponibility);

	if(!$c) {
		$c = new stdClass();
		$c->id = $clothId;

		$sumInTransit=0;
		$inTransitType = array();
		foreach (getInTransit($clothId) as $order) {
			foreach ($order['products'] as $product) {

				if($product['clothId'] == $clothId) {
					$sumInTransit += $product['amount'];
					// $inTransitType = $order['deliveryType'];

					$transit = new stdClass();
					$transit->type = $order['deliveryType'];
					$transit->amount = $product['amount'];
					$transit->used = 0;
					array_push($inTransitType, $transit);
				}
			}
		}
		$c->mtsInTransit = $sumInTransit;
		$c->inTransitType = $inTransitType;

		// available stock (available in rolls - plotters)
		$providers = getProviders($clothId);
		$sumAvailable=0;
		foreach ($providers as $provider) {
				$sumAvailable += $provider['stock'];
		}

		$plotters = getPlotters($clothId, 'false', null, null);
		$sumPlotters = 0;
		foreach ($plotters as $plotter) {
				$sumPlotters += $plotter['mtsDesign'];
		}

		$c->mtsAvailable = $sumAvailable;// - $sumPlotters; // we dont rest the plotters, we consider available if still in plotter
		$c->mtsPlotter = $sumPlotters;

		// extra info for the second iteration of ufa and uft set
		$c->totalUFA = 0;
		$c->totalUFT = 0;

		$c->sumNewUFA = 0;
		$c->sumNewUFT = 0;

		array_push($clothsDisponibility, $c);
	}
}

function calculateUFAandUFTofUncompleted($touchedPrevisions, &$clothsDisponibility) {
	$finalPrevisions = array();

	// 1) Get the total real UFA and UFT (only from completed)
	$totalUFA = 0; $totalUFT = 0;
	foreach ($touchedPrevisions as $prevision) {

		foreach ($prevision['cloths'] as $cloth) {
			$c = findClothById($cloth['clothId'], $clothsDisponibility);

			if(isset($cloth['completed'])) {
				$c->totalUFA += $cloth['UFA'];
				$c->totalUFT += $cloth['UFT'];
			}
		}
	}

	// 2) recaulculte the UFA and UFT for those cloths not completed
	$sumNewUFA = 0;
	$sumNewUFT = 0;

	foreach ($touchedPrevisions as $prevision) {

		$cloths = array();
		foreach ($prevision['cloths'] as $cloth) {
			$c = findClothById($cloth['clothId'], $clothsDisponibility);

			if(!isset($cloth['completed'])) {

				// new availbale is diff between original avaiblable and used in completed cloths
				$newMtsAvailable = $c->mtsAvailable - $c->totalUFA;
				$newMtsInTransitAvailable = $c->mtsInTransit - $c->totalUFT;

				$cloth['UFA'] = getUFA($newMtsAvailable, $c->sumNewUFA, $cloth['mts']);
				$cloth['UFT'] = getUFT($newMtsInTransitAvailable, $c->sumNewUFT, $cloth['mts'], $cloth['UFA']);

				$c->sumNewUFA += $cloth['UFA'];
				$c->sumNewUFT += $cloth['UFT'];
			}

			array_push($cloths, $cloth);
		}
		$prevision['cloths'] = $cloths;

		array_push($finalPrevisions, $prevision);
	}

	return $finalPrevisions;
}

function calculateAndUpdateState($prevision, $skipUpdateStateAccepted, &$clothsDisponibility) {

	$okCloths = array();
	$withTransitCloths = array();
	$noCloths = array();
	$totalCloths = count($prevision['cloths']);

	foreach ($prevision['cloths'] as $cloth) {

		if($cloth['UFA'] == $cloth['mts']) {
			array_push($okCloths, $cloth);
		} else if($cloth['UFA'] + $cloth['UFT'] == $cloth['mts']) {
			array_push($withTransitCloths, $cloth);
			$inTransitType = getTransitType($cloth, $clothsDisponibility);
		} else {
			array_push($noCloths, $cloth);
		}
	}

	$prevision['okCloths'] = $okCloths;
	$prevision['withtTransitCloths'] = $withTransitCloths;
	$prevision['totalCloths'] = $totalCloths;

	if(count($okCloths) == $totalCloths) {
		$state = "OK";
	} else if((count($okCloths) + count($withTransitCloths)) == $totalCloths) {
		// $state = "TRANSITO";
		$state = $inTransitType;
	} else {
		$state = "NO";
	}

	$prevision['state'] = $state;

	$updateStateAccepted = "";
	if(!isset($skipUpdateStateAccepted) || !$skipUpdateStateAccepted) {
		$updateStateAccepted = " , stateAccepted = false ";
	}

	$previsionId = $prevision['id'];

	logPrevisionUpdateFull($previsionId, 'calculateAndUpdateState');

	$update = "UPDATE previsions
						    SET prevState = state,
										state = '$state',
										stateChanged = now()
										$updateStateAccepted
					    WHERE id = '$previsionId'
							  AND (state is null OR state != '$state')";

	if(!mysql_query($update)) {
		$prevision['updateError'] = $update;
	}

	return $prevision;
}

function getTransitType($cloth, &$clothsDisponibility) {

	$c = findClothById($cloth['clothId'], $clothsDisponibility);

	$sumFromOtherType = 0;

	foreach ($c->inTransitType as $transit) {
		// cosnidering possibliñty that only part is used from one transit type and the rest from the following
		if($transit->amount - $transit->used - ($cloth['UFT'] - $sumFromOtherType) >= 0) {
			$transit->used += ($cloth['UFT'] - $sumFromOtherType);
			return $transit->type;
		} else {
			$currSum = $sumFromOtherType;
			$sumFromOtherType += $transit->amount - $transit->used - $currSum;
			$transit->used += $transit->amount - $transit->used - $currSum;
		}
	}
}

function acceptStateChange($prevision) {

	$obj->successful = true;
	$obj->method = 'acceptStateChange()';

	logPrevisionUpdateFull($prevision->id, 'acceptStateChange');

	$update = "UPDATE previsions
						    SET stateAccepted = true,
										stateAcceptedDate = now()
					    WHERE id = '".$prevision->id."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	return $obj;
}

function findClothById($id, $array){

    foreach ( $array as $element ) {
        if ( $id == $element->id ) {
            return $element;
        }
    }
    return false;
}

?>
