'use strict';

angular.module('vsko.stock')

.factory('Orders', ['$http', 'uuid4', function ($http, uuid4) {

		var url = telasAPIUrl;

        this.getOrders = function(status, providerId)
        {
					var providerParam="";
					if(providerId)
						providerParam = '&providerId='+providerId;

        	return $http.get(url + 'orders_GET.php?status='+status+providerParam);
        } ;

        this.buy = function(provider)
        {
        	provider.opId = uuid4.generate();

        	return $http.post(url + 'buy_POST.php', provider);
        };

				this.assignProduct = function(provider, orderId)
        {
        	return $http.post(url + 'buy_POST.php?assignToOrderId='+orderId, provider);
        };

        this.incrementStatus = function(order)
        {
        	return $http.post(url + 'orders_POST.php', order);
        };

        this.partialSave = function(order)
        {
        	// updates some the info section of the order
        	return $http.post(url + 'orders_POST.php?update=true', order);
        };

        this.orderProductSave = function(orderproduct)
        {
        	// updates the order product
        	return $http.post(url + 'orders_POST.php?updateProduct=true', orderproduct);
        };

        this.removeItem = function(orderproduct)
        {
        	// deletes an orden item
        	return $http.post(url + 'orders_DELETE.php?orderproduct=true&opId='+orderproduct.opId+"&orderId="+orderproduct.orderId+"&productId="+orderproduct.productId);
        };

        this.validate = function(order)
        {
        	// validate order
        	return $http.post(url + 'orders_POST.php?validate=true', order);
        };

				this.updateProductAmount = function(product)
        {
        	// validate order
        	return $http.post(url + 'orders_POST.php?updateProductAmount=true', product);
        };

        this.getRolls = function(productId, orderId)
        {
        	var orderParam = "";
        	if(orderId!=null) {
        		orderParam = "&orderId="+orderId;
        	}

        	return $http.get(url + 'rolls_GET.php?productId='+productId + orderParam);
        };

        this.saveRolls = function(orderProduct)
        {

        	$.each(orderProduct.rolls, function(index){
        		if(!this.id && (this.number && this.lote && this.mts))
        			this.id = uuid4.generate();
        	});

        	return $http.post(url + 'rolls_POST.php', orderProduct);
        };

        this.removeOrder = function(order)
        {
        	// deletes an orden item
        	return $http.post(url + 'orders_DELETE.php?removeorder=true&orderId='+order.orderId);
        };

        return this;
    }]);
