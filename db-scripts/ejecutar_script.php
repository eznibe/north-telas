<?php
// para ejecutar scripts 

include_once '../include/dbutils.php';
include_once '../include/main.php';

session_start();

db_connect();


//$query = "create database telas";
//$result = mysql_query($query);

$query = "CREATE TABLE roles(   id int PRIMARY KEY NOT NULL AUTO_INCREMENT,   role char(32) NOT NULL)ENGINE=MyISAM";
$result = mysql_query($query);

$query = "insert into roles (role) values ('admin')";
$result = mysql_query($query);

$query = "insert into roles (role) values ('design')";
$result = mysql_query($query);

$query = "insert into roles (role) values ('plotter')";
$result = mysql_query($query);


echo 'Ejecutado.';

?>


