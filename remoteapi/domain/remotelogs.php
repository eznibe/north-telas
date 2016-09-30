<?php

function addLog($log) {

	$methodResult->successful = true;

	$logStr = !strpos($log->log, '"') ? "\"".$log->log."\"" : "'".$log->log."'";

	$insert = "INSERT INTO remotelogs (type, log, user) VALUES ('".$log->type."', $logStr, '".$log->user."')";
	if (! mysql_query($insert)) {
			// error en insert
			$methodResult->successful = false;
			$methodResult->insert = $insert;
	}

	return $methodResult;
}

function addFilesLog($log) {

	$methodResult->successful = true;

	$insert = "INSERT INTO remotefileslogs (fileId, fileName, action, folder, parentId, previsionId, user)
						 VALUES ('".$log->fileId."', '".$log->fileName."', '".$log->action."', '".$log->folder."', '".$log->parentId."', '".$log->previsionId."', '".$log->user."')";
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
	$insert = "INSERT INTO remotelogs (type, log) VALUES ('".$method."', \"".$query."\")";
	if (! mysql_query($insert)) {
			// error en insert
			$res->successful = false;
			$res->insert = $insert;
	}

	return $res;
}

function getAll() {
	$query = "SELECT * FROM remotelogs";

	$result = mysql_query($query);

	return fetch_array($result);
}
?>
