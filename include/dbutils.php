<?php

function db_connect()
{
 $db = mysql_pconnect("nssudamerica-intranet.com", "suda_telas", "telas123");
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
