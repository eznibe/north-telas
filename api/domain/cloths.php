<?php

include_once 'providers.php';
include_once 'previsions.php';
include_once 'orders.php';
include_once 'plotters.php';
include_once 'rolls.php';

function getCloths($groupId, $expand)
{
	global $country, $previsionCountry, $clothCountry;

	$country = isset($previsionCountry) ? $previsionCountry : $country;
	$country = isset($clothCountry) ? $clothCountry : $country;

	$condition = '';
	if(isset($groupId)) {
		$condition = ' AND c.groupId = '.$groupId;
	}

	$query = "SELECT * FROM v_cloths_stock c WHERE c.country = '$country' ".$condition." ORDER BY c.name";
	$result = mysql_query($query);

	if(!$expand=='FULL')
		return fetch_array($result);

	// FULL expand => fill also providers and previsions of the cloths
	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$row['providers'] = getProviders($row['id'], $expand);
		
		if ($expand != 'SUMMARY') {
			$row['previsions'] = getPrevisions($row['id'], 'false', $expand, null, null, null, null, null);
			$row['plotters'] = getPlotters($row['id'], 'false', null, null);

			$intransit = getInTransit($row['id']);
			$sumInTransit=0;
			foreach ($intransit as $order) {
				foreach ($order['products'] as $product) {

					if($product['clothId'] == $row['id']) {
						$sumInTransit += $product['amount'];
					}
				}
			}
			$row['sumInTransit'] = $sumInTransit;

			$tobuy = getToBuy($row['id']);
			$sumToBuy=0;
			foreach ($tobuy as $order) {
				foreach ($order['products'] as $product) {

					if($product['clothId'] == $row['id']) {
						$sumToBuy += $product['amount'];
					}
				}
			}
			$row['sumToBuy'] = $sumToBuy;
		}
		$row['djais'] = getDjais($row['id'], $expand);
		if($expand=='WITH_ROLLS')
			$row['rolls'] = getClothRolls($row['id'], true);

		$sumDjais = 0;
		foreach ($row['djais'] as $value) {
			$sumDjais += $value['amount'];
		}
		$row['sumDjais'] = $sumDjais;

		array_push($rows, $row);
	}

	return $rows;
}


function getCloth($id) {

	$query = "SELECT * FROM cloths WHERE id = '$id'";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		return $row;
	}

	header('HTTP/1.1 404 Not Found', true, 404);

	$obj->error = "Not found";
	return $obj;
}

function getClothsUpToDate($groupId, $date, $includeStock0, $joinProviders) {

	global $country;

	$includeStock0 = isset($includeStock0);
	$joinProviders = isset($joinProviders);

	$query = "
						SELECT o.arriveDate, p.clothId, r.mtsOriginal, coalesce(cuts.mtsCutted, 0) as mtsCutted,
						(r.mtsOriginal - coalesce(cuts.mtsCutted, 0)) as available, c.name, coalesce(pro.name, '?') as provider, coalesce(p.price, '?') as price, p.productId, p.code,
						r.number, r.lote, r.mtsOriginal, r.type
						FROM rolls r JOIN products p on p.productId=r.productId JOIN orders o on o.orderId=r.orderId JOIN cloths c on c.id=p.clothId left JOIN providers pro on pro.id=p.providerId
						LEFT JOIN
						(
							SELECT r2.id, sum(pc.mtsCutted) as mtsCutted
							FROM plottercuts pc join plotters p on pc.plotterId=p.id join rolls r2 on r2.id=pc.rollId join cloths c on p.clothId=c.id
							where c.groupId='$groupId' and c.country = '$country' and p.cutted = true and p.cuttedOn <= STR_TO_DATE('".$date."', '%d-%m-%Y')
							group by r2.id
						) cuts ON cuts.id = r.id
						WHERE c.groupId='$groupId' and c.country = '$country' and r.incoming=false and o.arriveDate <= STR_TO_DATE('".$date."', '%d-%m-%Y')
							and ((r.mtsOriginal - coalesce(cuts.mtsCutted, 0))) > 0";

  if($includeStock0) {
		// union with those cloths that have 0 available up to given date
	  $query = $query . " UNION all
							SELECT o.arriveDate, p.clothId, r.mtsOriginal, coalesce(cuts.mtsCutted, 0) as mtsCutted,
							(r.mtsOriginal - coalesce(cuts.mtsCutted, 0)) as available, c.name, coalesce(pro.name, '?') as provider, coalesce(p.price, '?') as price, p.productId, p.code,
							r.number, r.lote, r.mtsOriginal, r.type
							FROM rolls r JOIN products p on p.productId=r.productId JOIN orders o on o.orderId=r.orderId JOIN cloths c on c.id=p.clothId left JOIN providers pro on pro.id=p.providerId
							LEFT JOIN
							(
								SELECT r2.id, sum(pc.mtsCutted) as mtsCutted
								FROM plottercuts pc join plotters p on pc.plotterId=p.id join rolls r2 on r2.id=pc.rollId join cloths c on p.clothId=c.id
								where c.groupId='$groupId' and c.country = '$country' and p.cutted = true and p.cuttedOn <= STR_TO_DATE('".$date."', '%d-%m-%Y')
								group by r2.id
							) cuts ON cuts.id = r.id
							WHERE c.groupId='$groupId' and c.country = '$country' and r.incoming=false and o.arriveDate <= STR_TO_DATE('".$date."', '%d-%m-%Y')
								and ((r.mtsOriginal - coalesce(cuts.mtsCutted, 0))) = 0
							GROUP BY p.clothId	";

		// union special cases of new cloths with order in transit but no cuts made yet
		$query = $query . " UNION all
							SELECT o.arriveDate, p.clothId, r.mtsOriginal, coalesce(cuts.mtsCutted, 0) as mtsCutted,
							0 as available, c.name, coalesce(pro.name, '?') as provider, coalesce(p.price, '?') as price, p.productId, p.code,
							r.number, r.lote, r.mtsOriginal, r.type
							FROM rolls r JOIN products p on p.productId=r.productId JOIN orders o on o.orderId=r.orderId JOIN cloths c on c.id=p.clothId left JOIN providers pro on pro.id=p.providerId
							LEFT JOIN
							(
								SELECT r2.id, sum(pc.mtsCutted) as mtsCutted
								FROM plottercuts pc join plotters p on pc.plotterId=p.id join rolls r2 on r2.id=pc.rollId join cloths c on p.clothId=c.id
								where c.groupId='$groupId' and c.country = '$country' and p.cutted = true and p.cuttedOn <= STR_TO_DATE('".$date."', '%d-%m-%Y')
								group by r2.id
							) cuts ON cuts.id = r.id
							WHERE c.groupId='$groupId' and c.country = '$country' and r.incoming=true and o.arriveDate is null and o.inTransitDate is not null
							and o.inTransitDate <= STR_TO_DATE('".$date."', '%d-%m-%Y')
							GROUP BY p.clothId	";
	}

	$query = $query . " ORDER BY name, provider desc, productId, clothId ";

  	$result = mysql_query($query);

	$lastClothId;
	$lastProvider;
	$lastRow;
	$sumAvailable = 0;

	$existsProvider=false;

	$clothRows = array();
	$rolls = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		if(!isset($lastClothId) && !isset($lastProvider)) {
			$lastClothId = $row['clothId'];
			$lastProvider = $row['provider'];
		}

		$roll = new stdClass();
		$roll->number = $row['number'];
		$roll->lote = $row['lote'];
		$roll->mts = $row['available'];
		$roll->mtsOriginal = $row['mtsOriginal'];
		$roll->type = $row['type'];
		$roll->price = $row['price'];
		$roll->dolarValue = $row['dolarValue'];

		if($lastClothId==$row['clothId']) {

			if($lastProvider==$row['provider'] || $joinProviders) {
 				$sumAvailable = $sumAvailable + $row['available'];
				if($row['available'] > 0)
					array_push($rolls, $roll);
			}
			else {
				// same cloth but provider changed => push last provider stock available sum
				$lastRow['sumAvailable'] = $sumAvailable;
				$lastRow['rollsAvailable'] = $rolls;
				$lastRow['data'] = 'different provider';

				if($sumAvailable > 0 || $includeStock0)
					array_push($clothRows, $lastRow);

				// start to sum new provider data
				$sumAvailable = $row['available'];
				$rolls = array();
				if($row['available'] > 0)
					array_push($rolls, $roll);

				$lastProvider = $row['provider'];
			}

			if($row['provider']!='?' && $row['available'] > 0)
				$existsProvider = true;
		}
		else {
			// new cloth
			if($sumAvailable > 0 || $includeStock0) {
				$lastRow['sumAvailable'] = $sumAvailable;
				$lastRow['rollsAvailable'] = $rolls;
				$lastRow['data'] = 'different cloth';
				$lastRow['query'] = $query;
				array_push($clothRows, $lastRow);
			}


			$sumAvailable = $row['available'];
			$rolls = array();
			if($row['available'] > 0)
				array_push($rolls, $roll);

			$lastClothId = $row['clothId'];
			$lastProvider = $row['provider'];

			$existsProvider = $row['provider']!='?' && $row['available'] > 0;
		}

		$lastRow = $row;
	}

	// after iterating the query result a last push to the results array is needed but only if the sum available is > 0
	if($sumAvailable > 0 || $includeStock0) {
		$lastRow['sumAvailable'] = $sumAvailable;
		$lastRow['rollsAvailable'] = $rolls;

		array_push($clothRows, $lastRow);
	}

	$clothRowsJoined = joinUnknownProviders($clothRows);
	//$clothRowsJoined = $clothRows;

	$clothRowsJoined = appendExtraInfo($clothRowsJoined, $date);

	return $clothRowsJoined;
}

function getClothsUpToDateSplitByOrder($groupId, $date, $includeStock0, $joinProviders) {

	global $country;

	$includeStock0 = isset($includeStock0);
	$joinProviders = isset($joinProviders);

	$query = "
						SELECT p.clothId, sum(r.mtsOriginal) as mtsOriginal, coalesce(cuts.mtsCutted, 0) as mtsCutted,
						sum(r.mtsOriginal - coalesce(cuts.mtsCutted, 0)) as available, c.name, coalesce(pro.name, '?') as provider, coalesce(p.price, '?') as price, p.productId, p.code, c.arancelary,
						r.number, r.lote, r.mtsOriginal, r.type, r.price as rollPrice, o.invoiceNumber, o.invoiceAR, o.dispatch, o.arriveDate, DATE_FORMAT(o.arriveDate,'%d-%m-%Y') as formattedArriveDate, o.dolar as dolarValue, o.orderId
						FROM v_rolls r JOIN products p on p.productId=r.productId JOIN orders o on o.orderId=r.orderId JOIN cloths c on c.id=p.clothId left JOIN providers pro on pro.id=p.providerId
						LEFT JOIN
						(
							SELECT r2.id, sum(pc.mtsCutted) as mtsCutted
							FROM plottercuts pc join plotters p on pc.plotterId=p.id join rolls r2 on r2.id=pc.rollId join cloths c on p.clothId=c.id
							where c.groupId='$groupId' and c.country = '$country' and p.cutted = true and p.cuttedOn <= STR_TO_DATE('".$date."', '%d-%m-%Y')
							group by r2.id
						) cuts ON cuts.id = r.id
						WHERE c.groupId='$groupId' and c.country = '$country' and r.incoming=false and o.arriveDate <= STR_TO_DATE('".$date."', '%d-%m-%Y')
							and ((r.mtsOriginal - coalesce(cuts.mtsCutted, 0))) > 0
						GROUP BY c.id, o.orderId";

  if($includeStock0) {
		// union with those cloths that have 0 available up to given date
	  $query = $query . " UNION all
							SELECT p.clothId, r.mtsOriginal, coalesce(cuts.mtsCutted, 0) as mtsCutted,
							(r.mtsOriginal - coalesce(cuts.mtsCutted, 0)) as available, c.name, coalesce(pro.name, '?') as provider, coalesce(p.price, '?') as price, p.productId, p.code, c.arancelary,
							r.number, r.lote, r.mtsOriginal, r.type, r.price as rollPrice, o.invoiceNumber, o.invoiceAR, o.dispatch, o.arriveDate, DATE_FORMAT(o.arriveDate,'%d-%m-%Y') as formattedArriveDate, o.dolar as dolarValue, o.orderId
							FROM v_rolls r JOIN products p on p.productId=r.productId JOIN orders o on o.orderId=r.orderId JOIN cloths c on c.id=p.clothId left JOIN providers pro on pro.id=p.providerId
							LEFT JOIN
							(
								SELECT r2.id, sum(pc.mtsCutted) as mtsCutted
								FROM plottercuts pc join plotters p on pc.plotterId=p.id join rolls r2 on r2.id=pc.rollId join cloths c on p.clothId=c.id
								where c.groupId='$groupId' and c.country = '$country' and p.cutted = true and p.cuttedOn <= STR_TO_DATE('".$date."', '%d-%m-%Y')
								group by r2.id
							) cuts ON cuts.id = r.id
							WHERE c.groupId='$groupId' and c.country = '$country' and r.incoming=false and o.arriveDate <= STR_TO_DATE('".$date."', '%d-%m-%Y')
								and ((r.mtsOriginal - coalesce(cuts.mtsCutted, 0))) = 0
							GROUP BY p.clothId	";

		// union special cases of new cloths with order in transit but no cuts made yet
		$query = $query . " UNION all
							SELECT p.clothId, r.mtsOriginal, coalesce(cuts.mtsCutted, 0) as mtsCutted,
							0 as available, c.name, coalesce(pro.name, '?') as provider, coalesce(p.price, '?') as price, p.productId, p.code, c.arancelary,
							r.number, r.lote, r.mtsOriginal, r.type, r.price as rollPrice, o.invoiceNumber, o.invoiceAR, o.dispatch, o.arriveDate, DATE_FORMAT(o.arriveDate,'%d-%m-%Y') as formattedArriveDate, o.dolar as dolarValue, o.orderId
							FROM v_rolls r JOIN products p on p.productId=r.productId JOIN orders o on o.orderId=r.orderId JOIN cloths c on c.id=p.clothId left JOIN providers pro on pro.id=p.providerId
							LEFT JOIN
							(
								SELECT r2.id, sum(pc.mtsCutted) as mtsCutted
								FROM plottercuts pc join plotters p on pc.plotterId=p.id join rolls r2 on r2.id=pc.rollId join cloths c on p.clothId=c.id
								where c.groupId='$groupId' and c.country = '$country' and p.cutted = true and p.cuttedOn <= STR_TO_DATE('".$date."', '%d-%m-%Y')
								group by r2.id
							) cuts ON cuts.id = r.id
							WHERE c.groupId='$groupId' and c.country = '$country' and r.incoming=true and o.arriveDate is null and o.inTransitDate is not null
								and o.inTransitDate <= STR_TO_DATE('".$date."', '%d-%m-%Y')
							GROUP BY p.clothId	";
	}

	$query = $query . " ORDER BY name, clothId, arriveDate  ";

	// echo $query;

  	$result = mysql_query($query);

	return fetch_array($result);
}

// those rows with unknown provider should be merged into the row of the same cloth with a valid provider (stock available and rolls)
// in case the unknown provider is the only result for a cloth then a valid provider should be fetch (name and price)
function joinUnknownProviders($rows) {

	$lastClothId=-1;
	$lastRow;
	$result = array();

	foreach ($rows as $row) {

		if($row['provider']=='?' && $lastClothId == $row['clothId']) {

			$sumAvailable=0;
			foreach ($row['rollsAvailable'] as $roll) {
				array_push($lastRow['rollsAvailable'], $roll);
				$sumAvailable += $roll->mts;
			}
			$lastRow['sumAvailable'] = $lastRow['sumAvailable'] + $sumAvailable;

			$lastRow['join'] = 'MERGE';

			array_pop($result);
			array_push($result, $lastRow);
		}
		else if ($row['provider']=='?' && $lastClothId != $row['clothId']) {
			// seek valid provider info and complete this row
			$query = "SELECT p.code, p.price, pro.name FROM cloths c join products p on p.clothId=c.id join providers pro on pro.id=p.providerId where c.id='".$row['clothId']."' limit 1";

			$r = mysql_query($query);

			$product = fetch_array($r);

			// unique result
			$row['provider'] = $product[0]['name'];
			$row['price'] = $product[0]['price'];
			$row['code'] = $product[0]['code'];

			array_push($result, $row);
		}
		else {
			$row['join'] = 'DEFAULT';
			array_push($result, $row);
		}

		$lastClothId = $row['clothId'];
		$lastRow = $row;
	}

	return $result;
}

// we need to add to each cloth row data for previsions, plotters and orders in transit (all up to date)
function appendExtraInfo($clothRows, $upToDate) {

	$result = array();
	foreach ($clothRows as $row) {

		$row['previsions'] = getPrevisionsUpToDate($row['clothId'], $upToDate);
		$row['plotters'] = getPlotters($row['clothId'], 'false', null, $upToDate);
		$row['ordersInTransit'] = getInTransitUpToDate($row['clothId'], $upToDate);

		array_push($result, $row);
	}

	return $result;
}

function getClothsPrices($groupId) {

	global $country;

	$groupCondition = isset($groupId) ? " AND c.groupId = '$groupId'" : "";

	$query = "SELECT c.*, p.code, p.price, pro.name as provider
						FROM cloths c join products p on p.clothId=c.id join providers pro on pro.id=p.providerId
					  WHERE 1=1 AND c.country = '$country' $groupCondition ORDER BY c.name";
	$result = mysql_query($query);

	return fetch_array($result);
}

function getDjais($clothId, $expand)
{

	$query = "SELECT * FROM djais d WHERE d.clothId = '$clothId' ORDER BY d.djaiDate";
	$result = mysql_query($query);

	return fetch_array($result);
}

function getDjai($djaiNumber, $expand)
{

	$query = "SELECT * FROM djais d WHERE d.number = '$djaiNumber'";
	$result = mysql_query($query);

	$clothRows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$query = "SELECT * FROM cloths c WHERE c.id = '".$row['clothId']."'";
		$subresult = mysql_query($query);

		while($subrow = mysql_fetch_array($subresult, MYSQL_ASSOC)) { // unique result

			$subrow['amount'] = $row['amount'];
			$subrow['djaiId'] = $row['id'];
			array_push($clothRows, $subrow);
		}

		$djai = $row;
	}

	$djai['cloths'] = $clothRows;

	return $djai;
}

function deleteCloth($clothId)
{

	$obj->successful = true;
	$obj->method = 'deleteCloth';


	// delete cloth references in onedesign
	$query = "DELETE FROM onedesign WHERE clothid = '".$clothId."'";
	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}
	else {
		// delete cloth
		$query = "DELETE FROM cloths WHERE id = '".$clothId."'";
		if (! mysql_query($query)) {
			$obj->successful = false;
			$obj->query = $query;
		}
	}

	return $obj;

}

function getDolar()
{
	global $country;
	$query = "SELECT *, DATE_FORMAT(fromDate,'%d-%m-%Y') as fromDate, DATE_FORMAT(untilDate,'%d-%m-%Y') as untilDate FROM dolar d WHERE country = '$country' AND untilDate is null LIMIT 1";
	$result = mysql_query($query);

	return fetch_array($result);
}

function getHistoricDolar()
{
	global $country;
	$query = "SELECT *, DATE_FORMAT(fromDate,'%d-%m-%Y') as fromDate, DATE_FORMAT(untilDate,'%d-%m-%Y') as formattedUntilDate FROM dolar d WHERE country = '$country' AND untilDate is not null ORDER BY untilDate desc LIMIT 20";
	$result = mysql_query($query);

	return fetch_array($result);
}

function saveDolar($dolar) {
	global $country;
	$obj->successful = true;

	$query = "SELECT id from dolar where country = '$country' and untilDate is null";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$previousValueId = $row['id'];
	}

	$update = "UPDATE dolar set untilDate = now() - INTERVAL 1 DAY where id = '$previousValueId'";
	if (! mysql_query($update)) {
		$obj->successful = false;
		$obj->query = $update;

	} else {

		$fromDate = isset($dolar->fromDate) && trim($dolar->fromDate)!='' ? "STR_TO_DATE('".$dolar->fromDate."', '%d-%m-%Y')" : 'null' ;
	
		$query = "INSERT INTO dolar (fromDate, value, country) VALUES ($fromDate, ".$dolar->value.", '$country')";

		if (! mysql_query($query)) {
			$obj->successful = false;
			$obj->query = $query;
		}
	}


	return $obj;
}

function saveHistoricDolar($dolar) {

	global $country;
	$obj->successful = true;

	$fromDate = isset($dolar->fromDate) && trim($dolar->fromDate)!='' ? "STR_TO_DATE('".$dolar->fromDate."', '%d-%m-%Y')" : 'null' ;
	$untilDate = isset($dolar->untilDate) && trim($dolar->untilDate)!='' ? "STR_TO_DATE('".$dolar->untilDate."', '%d-%m-%Y')" : 'null' ;

	$query = "INSERT INTO dolar (fromDate, untilDate, value, country) VALUES ($fromDate, $untilDate, ".$dolar->value.", '$country')";

	if (! mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function savePctNac($pctNac) {
	global $country;
	$obj->successful = true;

	$query = "INSERT INTO pctnac (value, country) VALUES (".$pctNac->value.", '$country')";
	$result = mysql_query($query);

	return $obj;
}

function getPctNac()
{
	global $country;
	$query = "SELECT * FROM pctnac d WHERE country = '$country' ORDER BY createdOn desc LIMIT 1";
	$result = mysql_query($query);

	return fetch_array($result);
}

function saveInflation($inflation) {
	global $country;
	$obj->successful = true;

	if (isset($inflation->isNew)) {
		$query = "INSERT INTO inflation (value, year, month, country) VALUES (".$inflation->value.", ".$inflation->year.", ".$inflation->month.", '$country')";
	} else {
		$query = "UPDATE inflation SET value = ". $inflation->value . " WHERE month = " . $inflation->month . " AND year = " . $inflation->year;
	}
	
	if (!mysql_query($query)) {
		$obj->successful = false;
	}
	$obj->query = $query;

	return $obj;
}

function getInflation($year, $month)
{
	global $country;
	if (isset($year) && isset($month)) {
		$query = "SELECT * FROM inflation d WHERE country = '$country' and year = $year and month = $month ORDER BY createdOn desc LIMIT 1";
	} else {
		$query = "SELECT * FROM inflation d WHERE country = '$country' and value is not null ORDER BY year, month";
	}
	$result = mysql_query($query);

	return fetch_array($result);
}

function getInflationRange($from, $to)
{
	global $country;
	$query = "SELECT * FROM inflation d WHERE country = '$country' and year = $year and month = $month ORDER BY createdOn desc LIMIT 1";
	$result = mysql_query($query);

	return fetch_array($result);
}

function getClothsWithMatchIdsInCountry($matchIds, $country) {

	$matchIds = str_replace(",", "','", $matchIds);
	$query = "SELECT c1.*, c1.id as newClothId, c2.id as originalClothId FROM cloths c1, cloths c2 where c1.country = '$country' and c1.matchClothId in ('$matchIds') and c1.matchClothId = c2.matchClothId and c1.id != c2.id";
	$result = mysql_query($query);

	return fetch_array($result);
}

function copyCloth($cloth, $country) {

	$obj->successful = true;
	$obj->method = 'copyCloth';

	$groupId = $cloth->groupId ? "'".$cloth->groupId."'" : 'null';

	$matchId = uniqid();
	$newClothId = uniqid();

	$insert = "INSERT INTO cloths (id, name, stockMin, groupId, matchClothId, country) VALUES ('$newClothId', '".$cloth->name."', '".$cloth->stockMin."', $groupId, '$matchId', '$country')" ;

	if(!mysql_query($insert)) {
		$obj->successful = false;
		$obj->insert = $insert;
	}
	// $obj->insert = $insert;

	$update = "UPDATE cloths SET matchClothId = '$matchId' WHERE id = '".$cloth->id."'";

	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}
	// $obj->update = $update;

	$obj->matchClothId = $matchId;
	$obj->originalClothId = $cloth->id;
	$obj->newClothId = $newClothId;

	return $obj;
}

?>
