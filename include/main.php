<?php

function fetch_array($result) {
	
	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
			
		array_push($rows, $row);
	}

	return $rows;
}

function previsionsWithCloths($result) {
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
		
		$row['deliveryDate'] = $row['deliveryDate']=='00-00-0000' || $row['deliveryDate']=='0000-00-00' ? null : $row['deliveryDate'];
		$row['designed'] = $row['designed']==1 ? true : false;
		$row['oneDesign'] = $row['oneDesign']==1 ? true : false;
		$row['odAssigned'] = $row['odAssigned']==1 ? true : false;
		$row['ownProduction'] = $row['ownProduction']==1 ? true : false;
		$row['greaterThan44'] = $row['greaterThan44']==1 ? true : false;
		$row['excludeFromStateCalculation'] = $row['excludeFromStateCalculation']==1 ? true : false;
		$row['excludeFromTemporariesCalculation'] = $row['excludeFromTemporariesCalculation']==1 ? true : false;
		$row['excludeAutoUpdateDeliveryDate'] = $row['excludeAutoUpdateDeliveryDate']==1 ? true : false;
		$row['designOnly'] = $row['designOnly']==1 ? true : false;

		$row['count'] = $count;

		array_push($rows, $row);
	}

	return $rows;
}
?>
