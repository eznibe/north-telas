<?php

// insert new user or update it if already exists

include_once '../include/headers.php';
include_once '../include/dbutils.php';
include_once '../include/main.php';

db_connect();

	$id  = isset($_GET['id']) ? $_GET['id'] : null;
	$corr  = isset($_GET['corr']) ? $_GET['corr'] : null;

	$resp = publishToTopic($id, $corr, []);

	exit(json_encode($resp));



function publishToTopic($id, $corr, $value) {
	
	$postData->_id = $id;
	$postData->_corr = gen_uuid();
	$postData->_type = "zorglink-support-question";
	$postData->_command = "changeNotification";
	$postData->token = "eyJ0eXAiOiJKV1QiLCJub25jZSI6Ink1UkxZTGdsUEVMZ3JtUjRRTFU1NGFfUXN2aDdJdGg3eU96bERXZXNiNWsiLCJhbGciOiJSUzI1NiIsIng1dCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSIsImtpZCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC80MTI2YWJhOS02MjJkLTRhZGEtOThjMy0yZWIzMTk3OTNlYzYvIiwiaWF0IjoxNzAwNTAxMDM1LCJuYmYiOjE3MDA1MDEwMzUsImV4cCI6MTcwMDUwNDkzNSwiYWlvIjoiRTJWZ1lFanFQK3RuKzV3aHliT0JUYkYvbXZzYUFBPT0iLCJhcHBfZGlzcGxheW5hbWUiOiJBZG1pbiIsImFwcGlkIjoiMTkwNjRjODAtOTVhNy00MTE3LWE1MDgtMmExMDgwMGM0YWYyIiwiYXBwaWRhY3IiOiIxIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNDEyNmFiYTktNjIyZC00YWRhLTk4YzMtMmViMzE5NzkzZWM2LyIsImlkdHlwIjoiYXBwIiwib2lkIjoiMGM3MDUyOGMtYWMwYi00NTQ2LWIyY2EtMDNkZWEyOGE1NTNmIiwicmgiOiIwLkFhOEFxYXNtUVMxaTJrcVl3eTZ6R1hrLXhnTUFBQUFBQUFBQXdBQUFBQUFBQUFDdkFBQS4iLCJyb2xlcyI6WyJTaXRlcy5TZWxlY3RlZCIsIlVzZXIuUmVhZFdyaXRlLkFsbCIsIlNpdGVzLlJlYWQuQWxsIiwiU2l0ZXMuUmVhZFdyaXRlLkFsbCIsIlNpdGVzLk1hbmFnZS5BbGwiLCJVc2VyLlJlYWQuQWxsIiwiU2l0ZXMuRnVsbENvbnRyb2wuQWxsIl0sInN1YiI6IjBjNzA1MjhjLWFjMGItNDU0Ni1iMmNhLTAzZGVhMjhhNTUzZiIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJFVSIsInRpZCI6IjQxMjZhYmE5LTYyMmQtNGFkYS05OGMzLTJlYjMxOTc5M2VjNiIsInV0aSI6IklLZzlZYVBmaUVpMmdvYU5EVGxNQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjA5OTdhMWQwLTBkMWQtNGFjYi1iNDA4LWQ1Y2E3MzEyMWU5MCJdLCJ4bXNfdGNkdCI6MTY4OTg2MTY1NCwieG1zX3RkYnIiOiJFVSJ9.WQZdVLST5e_IFgVZ7Je75lFGHg_6WWc8qTLl2c8g1_Do0LXdK1-oDE-croPRQ2CtZb0jNdZMNtUedgbtSPXckNrPqiXQa6ZNp3Ywf-midB_UhhlWj-yzzRKEmThfLgLKeQbOdCG23t2_FyCAVA7ni22TwNJZDkLK-9R-y6M9sGFSsVwnJ8j4Na4FTQae35cPczVoeinme23VWvAtpkOoZ7lw0CZ4tzTvOswZy13JqOEFxob-qGSQU0k4TlqSRw10jIHCr5GWN0OIlX3HxmmLKY_2HYp1IXUxPD-mdLwL41ilGAvMJmlhhhBSLT38JTh31OFg4cAhoTJgJIhgIZeZLQ";
	$postData->value = $value;

	var_dump($postData);
	
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
	//$response = curl_exec($ch);

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
