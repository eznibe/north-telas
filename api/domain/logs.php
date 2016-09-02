<?php

function addLog($log) {

	$methodResult->successful = true;

	$insert = "INSERT INTO logs (type, log) VALUES ('".$log->type."', \"".$log->log."\")";
	if (! mysql_query($insert)) {
			// error en insert
			$methodResult->successful = false;
			$methodResult->insert = $insert;
	}

	return $methodResult;
}

function logQueryError($query, $method) {

	$res->successful = true;

	// $insert = "INSERT INTO queryErrors (method, query) VALUES ('".$method."', '\"'".$query."\")";
	$insert = "INSERT INTO logs (type, log) VALUES ('".$method."', \"".$query."\")";
	if (! mysql_query($insert)) {
			// error en insert
			$res->successful = false;
			$res->insert = $insert;
	}

	return $res;
}

function logRollPreviousModification($id, $method, $whereCondition) {

	$res->successful = true;

	if(!isset($whereCondition)) {
		$whereCondition = "id = '$id'";
	}

	// $insert = "INSERT INTO queryErrors (method, query) VALUES ('".$method."', '\"'".$query."\")";
	$insert = "INSERT INTO logrolls (id, productId, type, number, lote, mtsOriginal, mts, orderId, incoming, manual, method, insertedOn)
							SELECT *, '$method', now() FROM rolls WHERE $whereCondition";
	if (! mysql_query($insert)) {
			// error en insert
			$res->successful = false;
			$res->insert = $insert;
	}

	return $res;
}

?>
