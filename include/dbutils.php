<?php

function db_connect()
{
 $db = mysql_pconnect("localhost", "suda", "suda");
 if (!$db)
 {
  echo "Error: No es posible conectar al motor de base de datos." . mysql_error();
  exit;
 }
 if ( !mysql_select_db("telas") )
 {
  echo "Error: No es posible seleccionar la base de datos." . mysql_error();
  exit;
 }
}


?>
