<?php
error_reporting(E_ERROR);
header('Access-Control-Allow-Headers: accept, content-type');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json');

// country and user name values will be used as global in every domain function
$country = isset($_GET['country']) ? $_GET['country'] : 'ARG';
$currentUser = isset($_GET['currentUser']) ? $_GET['currentUser'] : 'UNK';

?>
