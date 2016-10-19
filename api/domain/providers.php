<?php

include_once 'rolls.php';

function getProviders($clothId, $expand)
{

	if(isset($clothId)) {
		// providers only for the given cloth
		$query = "SELECT * FROM providers p right join products pt on p.id = pt.providerId WHERE pt.clothId = '$clothId' ORDER BY p.name";

		$result = mysql_query($query);

		$rows = array();
		while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {

			$row['rolls'] = getRolls($row['productId'], null);

			// sum stock using rolls of the cloth and only rolls already here (incoming=false)
			$sumStock = 0; $sumStockTemp = 0; $sumStockDef = 0;
			foreach ($row['rolls'] as $value) {
				$sumStock += $value['mts'];

				if($value['type']=='TEMP') $sumStockTemp += $value['mts'];
				if($value['type']=='DEF')  $sumStockDef  += $value['mts'];
			}

			// sum to the stock manual enterings
//			$manuals = getManualStocks($row['productId']);

//			foreach ($manuals as $value) {
//				$sumStock += $value['mts'];
//
//				if($value['type']=='TEMP') $sumStockTemp += $value['mts'];
//				if($value['type']=='DEF')  $sumStockDef  += $value['mts'];
//			}

			$row['stock'] = $sumStock;
			$row['stockTemp'] = $sumStockTemp;
			$row['stockDef'] = $sumStockDef;

			array_push($rows, $row);
		}

		return $rows;
	}
	else {
		// all providers
		$query = "SELECT * FROM providers p ORDER BY p.name";

		$result = mysql_query($query);

		$rows = fetch_array($result);

		$response = array();
		foreach($rows as $row) {

			$row['products'] = getProducts($row['id'], null);

			array_push($response, $row);
		}

		return $response;
	}
}


function getProvider($id) {

	$query = "SELECT * FROM providers WHERE id = '$id'";
	$result = mysql_query($query);

	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		return $row;
	}

	header('HTTP/1.1 404 Not Found', true, 404);

	$obj->error = "Not found";
	return $obj;
}

function saveNewProduct($newProduct) {

	$obj->successful = true;
	$obj->isNewProvider = false;
	$obj->method = "saveNewProduct";


	// first check if provider exists, if not create it
	$query = "SELECT p.id FROM providers p WHERE p.id = '".$newProduct->provider->id."'";
	$result = mysql_query($query);

	$num_results = mysql_num_rows($result);

	$rows = fetch_array($result);

	if ($num_results == 0) { // no provider
		$insert = "INSERT INTO providers (id, name, countryId) VALUES ('".$newProduct->provider->id."', '".$newProduct->provider->name."', 1)";
		if(!mysql_query($insert)) {
			$obj->successful = false;
		}
		$obj->isNewProvider = true;
	}

	$insert = "INSERT INTO products (productId, providerId, clothId, code, price) VALUES ('".$newProduct->productId."', '".$newProduct->provider->id."', '".$newProduct->clothId."', '".$newProduct->code."', ".$newProduct->price.")";

	if(!mysql_query($insert)) {
		$obj->successful = false;
	}

	if($obj->successful) {
		$products = getProducts($newProduct->provider->id, $newProduct->productId);
		$obj->product = $products[0];

		if($obj->isNewProvider) {
			$query = "SELECT * FROM providers p WHERE p.id = '".$newProduct->provider->id."'";

			$result = mysql_query($query);

			$rows = fetch_array($result);

			$rows[0]['products'] = $products;

			$obj->provider = $rows[0];
		}
	}

	return $obj;
}

function getProducts($providerId, $productId) {

	$productCondition = "";
	if(isset($productId)) {
		$productCondition = " AND productId = '".$productId."'";
	}

	$query = "SELECT p.*, c.name, c.id as clothId FROM products p join cloths c on c.id = p.clothId WHERE p.providerId = '$providerId' $productCondition ORDER BY c.name";

	$result = mysql_query($query);

	$productsResult = fetch_array($result);

	$products = array();

	foreach($productsResult as $product) {

		$product['rolls'] = getRolls($product['productId'], null);

		// sum stock using rolls of the cloth and only rolls already here (incoming=false)
		$sumStock = 0; $sumStockTemp = 0; $sumStockDef = 0;
		foreach ($product['rolls'] as $value) {
			$sumStock += $value['mts'];

			if($value['type']=='TEMP') $sumStockTemp += $value['mts'];
			if($value['type']=='DEF')  $sumStockDef  += $value['mts'];
		}

		// sum to the stock manual enterings
		$manuals = getManualStocks($product['productId']);

		foreach ($manuals as $value) {
			$sumStock += $value['mts'];

			if($value['type']=='TEMP') $sumStockTemp += $value['mts'];
			if($value['type']=='DEF')  $sumStockDef  += $value['mts'];
		}

		$product['stock'] = $sumStock;
		$product['stockTemp'] = $sumStockTemp;
		$product['stockDef'] = $sumStockDef;

		array_push($products, $product);
	}

	return $products;
}

// manual stock set for the given productId
function getManualStocks($productId) {

	$query = "SELECT * FROM manualstock m WHERE m.productId = '$productId'";

	$result = mysql_query($query);

	return fetch_array($result);
}

function updateProductCode($product) {

	$response->successful = true;
	$response->method = 'updateProductCode';

	$query = "UPDATE products SET code = '".$product->code."' WHERE productId = '".$product->productId."'";

	if(!mysql_query($query)) {
		$response->successful = false;
		$response->query = $query;
	}

	return $response;
}

function updateProductPrice($product) {

	$response->successful = true;
	$response->method = 'updateProductPrice';

	if(isset($product->price)) {
		$query = "UPDATE products SET price = '".$product->price."' WHERE productId = '".$product->productId."'";

		if(!mysql_query($query)) {
			$response->successful = false;
			$response->query = $query;
		}
	}
	else {
		$response->successful = false;
		$response->msg = 'Price no seteado.';
	}

	return $response;
}

function updateProviderName($provider) {

	$response->successful = true;
	$response->method = 'updateProviderName';

	if(isset($provider->name) && $provider->name!='') {
		$query = "UPDATE providers SET name = '".$provider->name."' WHERE id = '".$provider->id."'";

		if(!mysql_query($query)) {
			$response->successful = false;
			$response->query = $query;
		}
	}
	else {
		$response->successful = false;
		$response->msg = 'Nombre no seteado.';
	}

	$query = "SELECT * FROM providers WHERE id = '".$provider->id."'";

	$result = mysql_query($query);

	$rows = fetch_array($result); // unique

	$response->provider = $rows[0];

	return $response;
}

?>
