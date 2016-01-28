<?php

include_once 'domain/providers.php';
include_once 'domain/plotters.php';
include_once 'domain/orders.php';

// Used refernces in this file
// UFA: used from available (mts used from the available stock)
// UFT: used from transit (mts used from the orders in transit)

$touchedPrevisions = array();
$priorityPrevisionsQueries = array();
$builtPrevisions = array();
$recurses = 0;

function updateAllPrevisionsStates($clothId) {

	global $priorityPrevisionsQueries;
	$resultInfo = array();

	$conditionClothId = "";
	if(isset($clothId)) {
		$conditionClothId = " AND clothId = '$clothId' ";
	}

	$query = "SELECT distinct(pc.clothId) as id, c.name
						FROM previsions p join previsioncloth pc on p.id=pc.previsionId
						join cloths c on c.id=pc.clothId
						where p.designed = false $conditionClothId
						order by p.id, pc.clothId";

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

function updatePrevisionState($clothIdsStr, $skipUpdateStateAccepted) {

	global $touchedPrevisions;
	global $builtPrevisions;
	global $recurses;
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

			// seek the last
			$query = "SELECT pre.id, pre.deliveryDate, pre.createdOn, pre.orderNumber
								FROM previsions pre JOIN previsioncloth pc on pc.previsionId = pre.id
							  WHERE pre.designed = false AND pc.clothId = '$clothId'
								GROUP BY pre.id
								ORDER BY pre.deliveryDate desc, pre.createdOn desc
								LIMIT 1";

			//$obj->queryInitial = array();
			array_push($obj->queryInitial, $query);

			$result = mysql_query($query);

			$previsions = array();
			foreach (fetch_array($result) as $prevision) { // unique result

        $prevision['cloths'] = getPrevisionCloths($prevision);

				//$obj->prevCloths = $prevision['cloths'];

				$prevision = buildPrevisionStateData($clothsDisponibility, $prevision);
				array_push($builtPrevisions, $prevision);

				//array_push($previsions, $prevision);
				touchPrevision($prevision);
			}
		}

		// update state of touched previsions
		$modifiedPrevisions = array();
		foreach ($touchedPrevisions as $prevision) {
			array_push($modifiedPrevisions, calculateAndUpdateState($prevision, $skipUpdateStateAccepted));
		}

		$obj->successful = true;
		//$obj->tree = $previsions;
		$obj->clothsDisponibility = $clothsDisponibility;
		$obj->modifiedPrevisions = $modifiedPrevisions;
		$obj->recurses = $recurses;
		// $obj->builtPrevisions = $builtPrevisions;
	}

	return $obj;
}

function buildPrevisionStateData(&$clothsDisponibility, $prevision) {

	global $touchedPrevisions;
	global $recurses;
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

		// special case: if UFA + UFT are not enough to fill the necessary mts we release the used
		// and will be still available for other orders with less priority
		if(($cloth['UFA'] + $cloth['UFT']) < $cloth['mts']) {
			// we store the cleared ufa and uft, maybe needed in the future to show for how much it is not possible to assign
			$cloth['clearedUFA'] = $cloth['UFA'];
			$cloth['clearedUFT'] = $cloth['UFT'];

			$cloth['UFA'] = 0;
			$cloth['UFT'] = 0;
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
	$createdOn = $prevision['createdOn'];

	$query = "SELECT pre.id, pre.deliveryDate, pre.createdOn, pre.orderNumber
					  FROM previsions pre JOIN previsioncloth pc on pc.previsionId = pre.id
						WHERE pre.designed = false AND pc.clothId = '$clothId'
						  AND
								(pre.deliveryDate < '$deliveryDate'
							 OR
								(pre.deliveryDate = '$deliveryDate' AND pre.createdOn < '$createdOn'))
							AND pre.id != '$previsionId'
					  GROUP BY pre.id
						ORDER BY pre.deliveryDate, pre.createdOn";

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
		foreach (getInTransit($clothId) as $order) {
			foreach ($order['products'] as $product) {

				if($product['clothId'] == $clothId) {
					$sumInTransit += $product['amount'];
				}
			}
		}
		$c->mtsInTransit = $sumInTransit;

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

		array_push($clothsDisponibility, $c);
	}
}

function calculateAndUpdateState($prevision, $skipUpdateStateAccepted) {

	$okCloths = array();
	$withTransitCloths = array();
	$noCloths = array();
	$totalCloths = count($prevision['cloths']);

	foreach ($prevision['cloths'] as $cloth) {
		if($cloth['UFA'] == $cloth['mts']) {
			array_push($okCloths, $cloth);
		} else if($cloth['UFA'] + $cloth['UFT'] == $cloth['mts']) {
			array_push($withTransitCloths, $cloth);
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
		$state = "TRANSITO";
	} else {
		$state = "NO";
	}

	$prevision['state'] = $state;

	$updateStateAccepted = "";
	if(!isset($skipUpdateStateAccepted) || !$skipUpdateStateAccepted) {
		$updateStateAccepted = " , stateAccepted = false ";
	}

	$previsionId = $prevision['id'];

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

function acceptStateChange($prevision) {

	$obj->successful = true;
	$obj->method = 'acceptStateChange()';

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
