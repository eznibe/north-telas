<?php

$mysqli = new mysqli("localhost","suda_telas", "telas123","suda_telas");

// Check connection
if ($mysqli -> connect_errno) {
  echo "Failed to connect to MySQL: " . $mysqli -> connect_error;
  exit();
}

if ($result = $mysqli -> query("SELECT *, DATE_FORMAT(deliveryDate,'%d-%m-%Y') as deliveryDate FROM previsions WHERE id = '6ac9510f-1b58-4054-d207-b9ae2ef4ae34'")) {
    echo "Returned rows are: " . $result -> num_rows;
    // Free result set
    $result -> free_result();
  } 

//phpinfo();
?>