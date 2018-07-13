<?php

include_once 'logs.php';


function getDispatchs() {
	
	$query = "SELECT *, DATE_FORMAT(dueDate,'%d-%m-%Y') as dueDate, DATE_FORMAT(realDueDate,'%d-%m-%Y') as realDueDate 
				FROM v_temporaries_dispatch_extended d
				ORDER BY d.dueDate";

	$result = mysql_query($query);

	$rows = array();
	while($dispatchRow = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$dispatchRow['files'] = getDispatchFiles($dispatchRow['id'], null);

		array_push($rows, $dispatchRow);
	}

	return $rows;
}

/**
 * params:
 * showbyAvailability: options 
 * ALL: all files despite the available mts 
 * ONLY_EMPTIES: only those files with available mts = 0
 * ONLY_AVAILBLES: only those files with available mts > 0
 * DISPATCH_AVAILABLE: every file in a dispatch with some available mts (some file has mts > 0)
 */
function getDispatchFiles($dispatchId, $filter) {

	// filter params parse
	$showByAvailability = isset($filter) && isset($filter->selectedVisibility) ? $filter->selectedVisibility->key : null;

	// create query conditions
	$dispatchCondition = isset($dispatchId) ? " AND dispatchId = '$dispatchId'" : "";

	$orderByCondition = isset($filter) && isset($filter->selectedSort) 
						? $filter->selectedSort->mainOrder . ' ' . $filter->selectedSort->mode . ' ' . $filter->selectedSort->extraOrder
						: " clothType, c.name" ;

	$query = "SELECT f.*, f.id as fileId, f.type as clothType, coalesce(f.arancelary, c.arancelary) as arancelary, d.id as dispatchId, d.shortName, d.description, p.code, c.name as cloth, DATE_FORMAT(dueDate,'%d-%m-%Y') as dueDate, DATE_FORMAT(realDueDate,'%d-%m-%Y') as realDueDate,
					 f.available as fileAvailable, d.available as dispatchAvailable, c.stockCompare 
				FROM v_temporaries_files_extended f
				JOIN products p on p.productId = f.productId
				JOIN v_cloths_stock c on c.id = p.clothId
				JOIN v_temporaries_dispatch_extended d on d.id = f.dispatchId
				WHERE 1=1 $dispatchCondition
				ORDER BY $orderByCondition";
	$result = mysql_query($query);

	$rows = array();
	while($fileRow = mysql_fetch_array($result, MYSQL_ASSOC)) {

		$fileRow['downloads'] = getFileDownloads($fileRow['fileId']);

		$available = $fileRow['fileAvailable'];
		$dispatchAvailable = $fileRow['dispatchAvailable'];

		// debug properties
		$fileRow['query'] = $query;
		$fileRow['visibility'] = $showByAvailability;

		if (!isset($showByAvailability) 
			||  $showByAvailability=='ALL' 
			|| ($showByAvailability=='ONLY_AVAILABLES' && $available > 0)
			|| ($showByAvailability=='ONLY_EMPTIES' && $available <= 0)
			|| ($showByAvailability=='DISPATCH_AVAILABLE' && $dispatchAvailable > 0)) {
				
			array_push($rows, $fileRow);
		}
	}

	return $rows;	
}

function getDispatchByDescription($description) {
	
	$query = "SELECT *, DATE_FORMAT(dueDate,'%d-%m-%Y') as dueDate, DATE_FORMAT(realDueDate,'%d-%m-%Y') as realDueDate 
				FROM temporariesdispatch d
				WHERE d.description = '$description' and d.description != '<completar>'";

	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		array_push($rows, $row);
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
	// $obj->successful = false;
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
								VALUES ('$id', '".$dispatch->id."', '".$tProduct->productId."', ".$tProduct->amount.", null, null)";
	
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
					// $file->rollWidth = '-'; //TODO
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
		
			$obj->dispatchId = $dispatch->id;
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

		if (!isset($dispatch->joinToDispatchId)) {
			
			$query = "UPDATE temporariesdispatch SET shortName = '".$dispatch->shortName."', description = '".$dispatch->description."', dueDate = $dueDate WHERE id = '".$dispatch->id."'";
	
			if(mysql_query($query)) {
				$obj->successful = true;
	
				$obj->dispatchId = $dispatch->id;
				// fill the list of files to return in result
				$obj->temporariesFiles = getDispatchFiles($dispatch->id, null);
			} else {
				$obj->successful = false;
				$obj->update = $query;
			}
		} else {
			// special case when the current dispatch is joined to another one that already exists
			// -> current dispatch files are linked to the joined one
			// -> current dispatch is deleted
			$joinedDispatchId = $dispatch->joinToDispatchId;

			$currentTemporariesFiles = getDispatchFiles($dispatch->id, null);

			$query = "UPDATE temporariesfile SET dispatchId = '".$joinedDispatchId."' WHERE dispatchId = '".$dispatch->id."'";
	
			if(mysql_query($query)) {
				$obj->successfulJoin = true;
	
				$delete = "DELETE FROM temporariesdispatch where id = '".$dispatch->id."'";

				if(mysql_query($delete)) {
					$obj->successful = true;
					$obj->successfulJoin = true;

					// get only those files that were joined to the other dispatch
					$allFiles = getDispatchFiles($joinedDispatchId, null);
					$obj->temporariesFiles = array();

					foreach ($allFiles as $file) {
						foreach ($currentTemporariesFiles as $curFile) {
							if ($curFile['fileId'] == $file['fileId']) {
								array_push($obj->temporariesFiles, $file);
							}
						}
					}

				} else {
					$obj->successfulJoin = false;
					$obj->delete = $delete;
				}
			} else {
				$obj->successfulJoin = false;
				$obj->update = $query;
			}
			
			$obj->dispatchId = $joinedDispatchId;
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

	$rollWidth = isset($tFile->rollWidth) ? $tFile->rollWidth : 'null';
	$cif = isset($tFile->cif) ? $tFile->cif : 'null';
	$arancelary = isset($tFile->arancelary) ? "'".$tFile->arancelary."'" : 'null';

	$update = "UPDATE temporariesfile SET arancelary = $arancelary, cif = ".$cif.", 
				rollWidth = ".$rollWidth.", type = '".$tFile->type."',
				mtsInitial = ".$tFile->mtsInitial." WHERE id = '$tFile->id'";

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
function saveDownload($download)
{
	$obj->successful = false;
	
	$downloadDate = isset($download->downloadDate) && trim($download->downloadDate)!='' ? "STR_TO_DATE('".$download->downloadDate."', '%d-%m-%Y')" : 'null' ;
	
	if ($download->isNew) {
		$obj->method = 'saveDownload(insert)';

		$insert = "INSERT INTO temporariesdownload (id, fileId, mts, downloadDate, country, orderNumber, description, downloadedBy)
					VALUES ('".$download->id."', '".$download->fileId."', ".$download->mts.", $downloadDate, '".$download->country."', '".$download->orderNumber."', '".$download->description."', '".$download->downloadedBy."')";
	
		if(mysql_query($insert)) {
			$obj->successful = true;
		}
		else {
			$obj->insert = $insert;
		}
	} else {
		$obj->method = 'saveDownload(update)';

		$update = "UPDATE temporariesdownload SET mts = ".$download->mts.", downloadDate = $downloadDate, country = '".$download->country."', orderNumber = '".$download->orderNumber."', description = '".$download->description."'
					WHERE id = '".$download->id."'";
	
		if(mysql_query($update)) {
			$obj->successful = true;
		}
		else {
			$obj->update = $update;
		}
	}

	return $obj;
}

function deleteDownload($download) {

	$obj->successful = false;
	$obj->method = 'deleteDownload';
	
	$delete = "DELETE FROM temporariesdownload WHERE id = '".$download->id."'";
	
	if(mysql_query($delete)) {
		$obj->successful = true;
	}
	else {
		$obj->delete = $delete;
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

function getTemporariesStock($filter) {

	global $country;

	$groupCondition = "";
	if (isset($filter) && isset($filter->selectedGroup->id)) {
		$groupCondition = "AND c.groupId = '".$filter->selectedGroup->id."'";
	}

	$orderByCondition = isset($filter) && isset($filter->selectedSort) 
						? $filter->selectedSort->mainOrder . ' ' . $filter->selectedSort->mode . ' ' . $filter->selectedSort->extraOrder
						: " c.name" ;

	$query = "  SELECT *
				FROM v_cloths_stock c
				WHERE 1=1 $groupCondition AND c.country = '$country'
				ORDER BY $orderByCondition";

	$result = mysql_query($query);

	$rows = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

		if ($row['toExportCutted'] > 0) {
			$row['cuttedPrevisions'] = getClothTemporariesPrevisions('CUTTED', $row['id']); 
		}

		if ($row['temporariesToCut'] > 0) {
			$row['toCutPrevisions'] = getClothTemporariesPrevisions('TO_CUT', $row['id']);
		}

		array_push($rows, $row);
	}

	return $rows;
}

function getClothTemporariesPrevisions($type, $clothId) {

	if ($type == 'CUTTED') {

		$query = "  SELECT GROUP_CONCAT(distinct p.orderNumber SEPARATOR ', ') as previsions, count(*)
					FROM previsions p 
					left join plotters pl on pl.previsionId = p.id
					left join plottercuts pcuts on pcuts.plotterId = pl.id
					WHERE p.priority = 2 and p.percentage >= 25 and p.deletedProductionOn is null and p.excludeFromTemporariesCalculation = false
					and pl.clothid = '$clothId'
					group by pl.clothid";

	} else if ($type == 'TO_CUT') {

		$query = "  SELECT GROUP_CONCAT(distinct p.orderNumber SEPARATOR ', ') as previsions, count(*)
					FROM cloths c 
					LEFT JOIN previsioncloth pc on pc.clothId=c.id
					LEFT JOIN previsions p on p.id=pc.previsionId
					WHERE (p.type = 'TEMP' OR p.priority = 2) and p.percentage < 25
					and pc.clothid = '$clothId'
					group by c.id";
	}

	$result = mysql_query($query);

	if ($result) {

		while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
			return $row['previsions'];
		}
		return $query;
	} else {
		return "ERROR";
	}
}

?>