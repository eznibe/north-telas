<?php

// TO RUN IN BRA DB BEFORE EXPORT DATA

include_once '../../include/headers.php';
include_once '../../include/dbutils.php';
include_once '../../include/main.php';


db_connect();


// update onedesign to new boats ids
$update = "UPDATE onedesign, boats set onedesign.boatId = boats.id WHERE onedesign.boat = boats.boat";
mysql_query($update);

// update cloths
$query = "SELECT * FROM cloths WHERE length(id) < 5";

$cloths = mysql_query($query);

while($rowCloth = mysql_fetch_array($cloths, MYSQL_ASSOC)) {

  $id = $rowCloth['id'];
  $newid = uniqid();

  $update = "UPDATE cloths set id = '$newid' WHERE id = '$id'";
  mysql_query($update);

  $update = "UPDATE plotters set clothId = '$newid' WHERE clothId = '$id'";
  mysql_query($update);
  $update = "UPDATE previsionlogs set clothId = '$newid' WHERE clothId = '$id'";
  mysql_query($update);
  $update = "UPDATE products set clothId = '$newid' WHERE clothId = '$id'";
  mysql_query($update);
  $update = "UPDATE removedplotters set clothId = '$newid' WHERE clothId = '$id'";
  mysql_query($update);
  $update = "UPDATE onedesign set clothId = '$newid' WHERE clothId = '$id'";
  mysql_query($update);
  $update = "UPDATE previsioncloth set clothId = '$newid' WHERE clothId = '$id'";
  mysql_query($update);
}


// update orders
$query = "SELECT * FROM orders WHERE length(orderId) < 5";

$result = mysql_query($query);

while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

  $id = $row['orderId'];
  $newid = uniqid();

  $update = "UPDATE orders set orderId = '$newid' WHERE orderId = '$id'";
  mysql_query($update);

  $update = "UPDATE rolls set orderId = '$newid' WHERE orderId = '$id'";
  mysql_query($update);
  $update = "UPDATE orderproduct set orderId = '$newid' WHERE orderId = '$id'";
  mysql_query($update);
}

// update orderproduct
$query = "SELECT * FROM orderproduct WHERE length(opId) < 5";

$result = mysql_query($query);

while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

  $id = $row['opId'];
  $newid = uniqid();

  $update = "UPDATE orderproduct set opId = '$newid' WHERE opId = '$id'";
  mysql_query($update);
}

// update sails
$update = "UPDATE sails set id = id * 50 WHERE id < 50";
mysql_query($update);

$update = "UPDATE previsions set sailId = sailId * 50 WHERE sailId < 50";
mysql_query($update);

$update = "UPDATE sails set id = 140 WHERE id = 50";
mysql_query($update);
$update = "UPDATE sails set id = 145 WHERE id = 100";
mysql_query($update);

$update = "UPDATE previsions set sailId = 140 WHERE sailId = 50";
mysql_query($update);
$update = "UPDATE previsions set sailId = 145 WHERE sailId = 100";
mysql_query($update);

// update products
$query = "SELECT * FROM products WHERE length(productId) < 5";

$result = mysql_query($query);

while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

  $id = $row['productId'];
  $newid = uniqid();

  $update = "UPDATE products set productId = '$newid' WHERE productId = '$id'";
  mysql_query($update);

  $update = "UPDATE rolls set productId = '$newid' WHERE productId = '$id'";
  mysql_query($update);
  $update = "UPDATE orderproduct set productId = '$newid' WHERE productId = '$id'";
  mysql_query($update);

  // echo "ROW $id , $newid -";
}


// update providers
$query = "SELECT * FROM providers WHERE length(id) < 5";

$result = mysql_query($query);

while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

  $id = $row['id'];
  $newid = uniqid();

  $update = "UPDATE providers set id = '$newid' WHERE id = '$id'";
  mysql_query($update);

  $update = "UPDATE products set providerId = '$newid' WHERE providerId = '$id'";
  mysql_query($update);
  $update = "UPDATE orders set providerId = '$newid' WHERE providerId = '$id'";
  mysql_query($update);
}

// update rolls
$query = "SELECT * FROM rolls WHERE length(id) < 5";

$result = mysql_query($query);

while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

  $id = $row['id'];
  $newid = uniqid();

  $update = "UPDATE rolls set id = '$newid' WHERE id = '$id'";
  mysql_query($update);

  $update = "UPDATE plottercuts set rollId = '$newid' WHERE rollId = '$id'";
  mysql_query($update);
}


//return JSON array
exit(json_encode("Finished."));
?>
