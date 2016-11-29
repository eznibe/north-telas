<?php

// TO RUN AFTER BRA DATA MIGRATION TO ARG DB

include_once '../../include/headers.php';
include_once '../../include/dbutils.php';
include_once '../../include/main.php';


db_connect();


// update cloths
$query = "SELECT c1.id as argid, c2.id as braid FROM cloths c1 , cloths c2 where c1.country='ARG' and c2.country='BRA' and c1.name = c2.name";

$cloths = mysql_query($query);

while($row = mysql_fetch_array($cloths, MYSQL_ASSOC)) {

  $newid = uniqid();

  $update = "UPDATE cloths set matchClothId = '$newid' WHERE id in ('".$row['argid']."', '".$row['braid']."')";
  mysql_query($update);
}


$query = "SELECT argid, braid FROM extra_cloths_matching";

$cloths = mysql_query($query);

while($row = mysql_fetch_array($cloths, MYSQL_ASSOC)) {

  $newid = uniqid();

  $update = "UPDATE cloths set matchClothId = '$newid' WHERE id in ('".$row['argid']."', '".$row['braid']."')";
  mysql_query($update);
}


//return JSON array
exit(json_encode("Finished."));
?>
