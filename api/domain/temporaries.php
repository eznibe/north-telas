<?php

include_once 'logs.php';


function getDispatchs() {
	
	$query = "SELECT *, DATE_FORMAT(dueDate,'%d-%m-%Y') as dueDate, DATE_FORMAT(realDueDate,'%d-%m-%Y') as realDueDate 
				FROM temporariesdispatch d
				ORDER BY d.dueDate";

	$result = mysql_query($query);

	$rows = array();
	while($dispatchRow = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$dispatchRow['files'] = getDispatchFiles($dispatchRow['id']);

		array_push($rows, $dispatchRow);
	}

	return $rows;
}

function getDispatchFiles($dispatchId) {

	$query = "SELECT f.*, f.id as fileId, f.type as clothType, d.*, p.code, c.name as cloth, DATE_FORMAT(dueDate,'%d-%m-%Y') as dueDate, DATE_FORMAT(realDueDate,'%d-%m-%Y') as realDueDate 
				FROM temporariesfile f 
				JOIN products p on p.productId = f.productId
				JOIN cloths c on c.id = p.clothId
				JOIN temporariesdispatch d on d.id = f.dispatchId
				WHERE dispatchId = '$dispatchId'";
	$result = mysql_query($query);

	$rows = array();
	while($fileRow = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$fileRow['downloads'] = getFileDownloads($fileRow['fileId']);
		array_push($rows, $fileRow);
	}

	return $rows;	
}

function getFileDownloads($fileId) {

	$query = "SELECT d.*, DATE_FORMAT(downloadDate,'%d-%m-%Y') as downloadDate
				FROM temporariesdownload d 
				WHERE fileId = '$fileId'
				ORDER BY d.downloadDate";
	$result = mysql_query($query);

	$rows = array();
	while($downloadRow = mysql_fetch_array($result, MYSQL_ASSOC)) {
		array_push($rows, $downloadRow);
	}

	return $rows;	
}


// Create the temporaries file dispatch and the files associated to it
function saveDispatch($dispatch)
{
	$obj->successful = false;
	$obj->method = 'saveDispatch';

	$dueDate = isset($dispatch->dueDate) && trim($dispatch->dueDate)!='' ? "STR_TO_DATE('".$dispatch->dueDate."', '%d-%m-%Y')" : 'null' ;
	$realDueDate = isset($dispatch->realDueDate) && trim($dispatch->realDueDate)!='' ? "STR_TO_DATE('".$dispatch->realDueDate."', '%d-%m-%Y')" : 'null' ;

	if ($dispatch->isNew) {
		$query = "INSERT INTO temporariesdispatch (id, description, shortName, dueDate, realDueDate)
					VALUES ('".$dispatch->id."', '".$dispatch->description."', '".$dispatch->shortName."', $dueDate, $realDueDate)" ;
		
		if(mysql_query($query)) {
			$obj->successful = true;
			$obj->isNew = true;
			$obj->insert = $query;
	
			// create the temporaries files
			$temporariesFiles = array();
			foreach ($dispatch->temporariesProducts as $tProduct) {
	
				// get the product cloth group (for the file type)
				$query = "SELECT * from groups WHERE id = '".$tProduct->groupId."'";
	
				$result = mysql_query($query);
				$group = fetch_array($result);
	
				$id = uniqid();
	
				$insertFile = "INSERT INTO temporariesfile (id, dispatchId, productId, mtsInitial, cif, type)
								VALUES ('$id', '".$dispatch->id."', '".$tProduct->productId."', ".$tProduct->amount.", null, '".$group[0]['name']."')";
	
				if(mysql_query($insertFile)) {
	
					$query = "SELECT * from cloths WHERE id = '".$tProduct->clothId."'";
					$result = mysql_query($query);
					$cloth = fetch_array($result);
	
					$file = new stdClass();
					$file->id = $id;
					$file->cloth = $cloth[0]['name'];
					$file->dispatchId = $dispatch->id;
					$file->dispatch = $dispatch->description;
					$file->shortName = $dispatch->shortName;
					$file->dueDate = $dispatch->dueDate;
					$file->clothType = $group[0]['name'];
					$file->code = $tProduct->code;
					$file->rollWidth = '-'; //TODO
					$file->mtsInitial = $tProduct->amount;
					$file->downloads = array();
	
					array_push($temporariesFiles, $file);
	
				} else {
					$obj->insertFile = $insertFile;
	
					$obj->successfulDispatchFile = false;
	
					$log->type = "saveDispatchFile.error";
					$log->log = $insertFile;
					$log->user = "backend";
					addLog($log);
				}
			}
		
			$obj->temporariesFiles = $temporariesFiles;
		}
		else {
			$obj->query = $query;
	
			$log->type = "saveDispatch.error";
			$log->log = $query;
			$log->user = "backend";
			addLog($log);
		}

	} else {
		// update a dispatch that already exists
		$query = "UPDATE temporariesdispatch SET shortName = '".$dispatch->shortName."', description = '".$dispatch->description."', dueDate = $dueDate WHERE id = '".$dispatch->id."'";

		if(mysql_query($query)) {
			$obj->successful = true;
		} else {
			$obj->successful = false;
			$obj->update = $query;
		}
	}

	return $obj;
}

/**
 * Update a temporaries file, already exists.
 */
function saveFile($tFile)
{
	$obj->successful = false;
	$obj->method = 'saveFile';

	$update = "UPDATE temporariesfile SET arancelary = '".$tFile->arancelary."', cif = ".$tFile->cif." WHERE id = '$tFile->id'";

	if(mysql_query($update)) {
		$obj->successful = true;
		$obj->update = $update;
	}
	else {
		$obj->update = $update;
	}

	return $obj;
}


/**
 * Add new download for a temporaries file
 */
function addDownload($download)
{
	$obj->successful = false;
	$obj->method = 'addDownload';

	$downloadDate = isset($download->downloadDate) && trim($download->downloadDate)!='' ? "STR_TO_DATE('".$download->downloadDate."', '%d-%m-%Y')" : 'null' ;

	if ($download->isNew) {

		$insert = "INSERT INTO temporariesdownload (id, fileId, mts, downloadDate, country, orderNumber, description, downloadedBy)
					VALUES ('".$download->id."', '".$download->fileId."', ".$download->mts.", $downloadDate, '".$download->country."', '".$download->orderNumber."', '".$download->description."', '".$download->downloadedBy."')";
	
		if(mysql_query($insert)) {
			$obj->successful = true;
		}
		else {
			$obj->insert = $insert;
		}
	}

	return $obj;
}

function editFileField($file, $field, $isNumber) {

	$obj->successful = false;
	$obj->method = "editFile($field)";

	$value = "";

	if (isset($isNumber)) {

		$value = $file->$field;
	} else {
		$value = "'".$file->$field."'";
	}

	$update = "UPDATE temporariesfile SET $field = $value WHERE id = '".$file->fileId."'";

	if(mysql_query($update)) {
		$obj->successful = true;
	}
	else {
		$obj->update = $update;

		$log->type = "editFile($field).error";
		$log->log = $update;
		$log->user = "backend";
		addLog($log);
	}

	return $obj;
}

function editDispatchField($dispatch, $field, $isDate) {

	$obj->successful = false;
	$obj->method = "editDispatch($field)";

	$value = "";

	if (isset($isDate)) {

		$value = isset($dispatch->$field) && trim($dispatch->$field)!='' ? "STR_TO_DATE('".$dispatch->$field."', '%d-%m-%Y')" : 'null' ;

	} else {
		$value = "'".$dispatch->$field."'";
	}

	$update = "UPDATE temporariesdispatch SET $field = $value WHERE id = '".$dispatch->id."'";

	if(mysql_query($update)) {
		$obj->successful = true;
	}
	else {
		$obj->update = $update;

		$log->type = "editDispatch($field).error";
		$log->log = $update;
		$log->user = "backend";
		addLog($log);
	}

	return $obj;
}

?>