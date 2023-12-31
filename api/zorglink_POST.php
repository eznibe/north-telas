<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

if($_SERVER['REQUEST_METHOD'] == 'POST' || $_SERVER['REQUEST_METHOD'] == 'PUT') {

	$request_payload = file_get_contents('php://input');

	if (isset($_GET['validationToken'])) {
		addZorglinkLog($_GET['validationToken'], "validation");
		exit($_GET['validationToken']);
	}

	$json = json_decode($request_payload);

	addZorglinkLog(json_encode($json), "event");

	publishToTopic("a0b4ad09-c3bc-4a22-9d8d-c1646295a426", $json->value);

	exit(json_encode($json));
}


function addZorglinkLog($msg, $type) {

	$insert = "INSERT INTO zorglink (log, type) VALUES ('".$msg."', '".$type."')";
	// var_dump($insert);
	if (! mysql_query($insert)) {
			// error en insert
			$methodResult->successful = false;
			$methodResult->insert = $insert;
			echo " error ";
	}

	return $methodResult;
}

function publishToTopic($id, $value) {
	
	$postData->_id = $id;
	$postData->_corr = $corr;
	$postData->_type = "zorglink-support-question";
	$postData->_command = "changeNotification";
	$postData->value = $value;
	
	// Setup cURL
	$ch = curl_init('https://tst4.clb-lars.be/api/zorglink/zorglink-support-question/'.$id);
	curl_setopt_array($ch, array(
		CURLOPT_POST => TRUE,
		CURLOPT_RETURNTRANSFER => TRUE,
		CURLOPT_HTTPHEADER => array(
			'Cookie: access_token=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI4MWE1YjgyNmUwODVmYzBjNjNkM2UyNDI5MWJmOGYyOTYxM2E0NDRhIiwiY2xiSWQiOjM4LCJpZHAiOiJnb29nbGUiLCJmYW1pbHlOYW1lIjoiUGFsbWFlcnRzIiwiZ2l2ZW5OYW1lIjoiU3RldmVuIiwicm9sZXMiOlsiQURNSU4iLCJESVJFQ1RPUiIsIk1FTERQVU5UIiwiQ09OVFJBQ1RfQURNSU5JU1RSQVRPUiIsIkFETUlOSVNUUkFUSVZFIiwiRU1QTE9ZRUUiLCJESVNDSU1VUyIsIkRJU1BBVENIRVIiLCJNRURJQyIsIk1FRElDQUxfQURWSUNFX01BTkFHRVIiLCJVU0VSX01BTkFHRVIiXSwidm8iOnsiY29kZSI6IjExNDc0NCIsIm5hbWUiOiJLT1JUUklKSyAtIFZyaWogQ0xCIEdyb2VuaW5nZSJ9LCJzdXBlcnVzZXIiOnsic3ViIjoiYWRtaW5AbGVtb25hZGUuYmUifSwicnJuIjoiOTcwMzEzMTgxMzIiLCJpYXQiOjE2Mzg1MDMwMDQsImp0aSI6ImYxYjE5YTk1LWY0MDUtNDRkMy05M2VkLTUwYWFjZjYxZDBjNCJ9.LFl5EWZhUKknL8wU2veRvxUbDhSrInsJkSfZlrEQwQYVRnZf57DEIntOXBoHSO8MBRImfEia8WZN1qRY4kpvRz3DthqBOgDy5n5MBud-WXvHAQ58IBaTjG-A3VeecpzoIIZlvvcTekx-mOE37WAz7WE11gD0ffmVLs_zq1HG7KtZ784DeGXGzrsubLc2fTN4EOYnhLyTHSwFLWhuHGwKuLmSsOvMPSvOcEwnwbELik_GPdulfr1a5w_lol7ZudtjGupQC9rX1Z8WDq8Xf7LxgdQg67FjVwJHCweuVyecHTDvfXhoiPaomgvj6_45ZelPg1R9Vlnl22YGr8LfTY5qZA;',
			'Content-Type: application/json'
		),
		CURLOPT_POSTFIELDS => json_encode($postData)
	));

	// Send the request
	$response = curl_exec($ch);

	addZorglinkLog(json_encode($postData), "toTopic");

	// Check for errors
	if($response === FALSE){
		die(curl_error($ch));
	}

	// Decode the response
	$responseData = json_decode($response, TRUE);

	// Close the cURL handler
	curl_close($ch);

	return $responseData;
}

function gen_uuid() {
    return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        // 32 bits for "time_low"
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),

        // 16 bits for "time_mid"
        mt_rand( 0, 0xffff ),

        // 16 bits for "time_hi_and_version",
        // four most significant bits holds version number 4
        mt_rand( 0, 0x0fff ) | 0x4000,

        // 16 bits, 8 bits for "clk_seq_hi_res",
        // 8 bits for "clk_seq_low",
        // two most significant bits holds zero and one for variant DCE1.1
        mt_rand( 0, 0x3fff ) | 0x8000,

        // 48 bits for "node"
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}
?>
