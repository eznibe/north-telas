<?php

function db_connect()
{
 $db = mysql_pconnect("sql204.byethost7.com", "b7_18817514", "northserver1");
 if (!$db)
 {
  echo "Error: No es posible conectar al motor de base de datos." . mysql_error();
  exit;
 }
 if ( !mysql_select_db("b7_18817514_remote_test") )
 {
  echo "Error: No es posible seleccionar la base de datos." . mysql_error();
  exit;
 }
}


?>
