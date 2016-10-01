<?php

// insert new user or update it if already exists

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

db_connect();

include_once 'domain/remotelogs.php';




	//return JSON array
	exit(json_encode(getAll()));

?>
