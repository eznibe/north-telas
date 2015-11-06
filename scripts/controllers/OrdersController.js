'use strict';
	
angular.module('vsko.stock')

.controller('OrdersCtrl', ['$scope', 'Orders', 'orderStatus', '$routeParams', '$modal', function ($scope, Orders, orderStatus, $routeParams, $modal) {

		$scope.type = $routeParams.type;
	
        // initial list of orders 
        Orders.getOrders(orderStatus.to_buy).then(function(result) {
        	$scope.orders_buy = result.data;
        });
        
		Orders.getOrders(orderStatus.to_confirm).then(function(result) {
        	$scope.orders_confirm = result.data;
        });

		Orders.getOrders(orderStatus.in_transit).then(function(result) {
			$scope.orders_transit = result.data;
			
			$.each($scope.orders_transit, function(index){
        		//this.arriveDate = $.format.date(new Date(), "dd-MM-yyyy");
//				this.arriveDate = $.format.date(this.arriveDate, "dd-MM-yyyy");
        	});
		});

		
        // Functions called as callback from order modal
        $scope.confirm = function(order) {
        
        	var result = true;
        	
        	if(order.status == orderStatus.to_buy) {
        		Orders.incrementStatus(order).then(function(result){
        			
        			if(result.data.successful) {

	        			$scope.orders_buy.remove(order);
	        			$scope.orders_confirm.push(order);
	        			
	        			order = $.extend(true, order, result.data.order);
	        			
	        			$.notify("Orden pasada a confirmar.", {className: "success", globalPosition: "bottom right"});
        			}
        		});	
        	}
        	else if(order.status == orderStatus.to_confirm) {
        		Orders.incrementStatus(order).then(function(result){
        			
        			if(result.data.successful) {
        				console.log('Confirmed order: '+order.orderId);

	        			$scope.orders_confirm.remove(order);
	        			$scope.orders_transit.push(order);
	        			
	        			order = $.extend(true, order, result.data.order);
	        			
	        			$.notify("Orden pasada a en transito.", {className: "success", globalPosition: "bottom right"});
        			}
        		});
        	}
        	else if(order.status == orderStatus.in_transit) {
        		
        		if($scope.modalCtrl.formOrderInfo.$valid) { // to finish the order the info section should be completed and valid
        			
//        			Orders.validate(order).then(function(result){
//        				
//        				if(result.data.valid) {
//        					// valid order, confirm reception
////	        				$scope.arrive(order);   
//        				}
//        				else {
//        					// not valid order to receive -> rolls not filled completely (validation on server side)
//        					result = false;
//        					
//        					$scope.showWarningModal({message: 'Hay rollos no cargados o incompletos. Desea confirmar la orden igual?'}, $scope.acceptArriveWarning, order);
//        				}
//        			});
        			
        			// hay validacion previa en ui para que todas las telas tengan rollo asignado
        			$scope.arrive(order);
        		}
        		else {
        			result = false;
        			$scope.modalCtrl.formOrderInfo.$setDirty();
        			
        			$.notify("Informacion faltante para arrivar orden.", {className: "error", globalPosition: "bottom right"});
        		}
        	}
        	
        	return result;
        };
        
        $scope.acceptArriveWarning = function(order) {
        	$scope.arrive(order);
        };
        
        $scope.arrive = function(order) {
        	console.log('Arrive order: '+order.orderId);
        	
        	Orders.incrementStatus(order).then(function(result){
    			
    			if(result.data.successful) {
        			$scope.orders_transit.remove(order);
        			
        			order = $.extend(true, order, result.data.order);
        			
        			$.notify("Orden arribada.", {className: "success", globalPosition: "bottom right"});
    			}
    		});    
        };
        
        $scope.deleteOrder = function(order) {
        	console.log('Delete order: '+order.orderId);
        	
        	Orders.removeOrder(order).then(function(result){
    			
    			if(result.data.successful) {
        			$scope.orders_confirm.remove(order);
        			$scope.orders_transit.remove(order);
        			
        			$scope.modalOrder.hide();
        			
        			$.notify("Orden eliminada.", {className: "success", globalPosition: "bottom right"});
    			}
    			else {
    				$.notify("Error eliminando orden.", {className: "error", globalPosition: "bottom right"});
    			}
    		});
        	
        };
        
        
        $scope.close = function() {
        	
        	$.extend($scope.user, $scope.origUser);
        	
        	$scope.modalUser.hide();
        };
        
        $scope.setModalCtrl = function(modalCtrl) {
        	
        	$scope.modalCtrl = modalCtrl;
        };
        
        $scope.formatDate = function(date) {
        	$.format.date(date, "dd-MM-yyyy");
        };
}]);
