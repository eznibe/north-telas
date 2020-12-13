'use strict';

angular.module('vsko.stock')

.controller('OrdersCtrl', ['$rootScope', '$scope', 'Utils', 'Orders', 'Previsions', 'Temporaries', 'orderStatus', '$routeParams', '$modal', function ($rootScope, $scope, Utils, Orders, Previsions, Temporaries, orderStatus, $routeParams, $modal) {

		$scope.type = $routeParams.type;

		$scope.filter = {deliveryTypes: ['Desconocido', 'Nacional', 'Courier', 'Aereo1', 'Aereo2', 'Maritimo']};

		$scope.search = { active: false }

        // initial list of orders
        Orders.getOrders(orderStatus.to_buy).then(function(result) {
			$scope.orders_buy = result.data;
			parseTemporaryToBoolean($scope.orders_buy);
        });

		Orders.getOrders(orderStatus.to_confirm).then(function(result) {
			$scope.orders_confirm = result.data;
			parseTemporaryToBoolean($scope.orders_confirm);
        });

		Orders.getOrders(orderStatus.in_transit).then(function(result) {
			$scope.orders_transit = result.data;
			parseTemporaryToBoolean($scope.orders_transit);
		});

		function parseTemporaryToBoolean(orders) {
			$.each(orders, function(index){
				this.products.forEach(p => {
					p.temporary = p.temporary === '1';
				});
        	});
		}


        // Functions called as callback from order modal
        $scope.confirm = function(order) {

        	var result = true;

        	if(order.status == orderStatus.to_buy) {
        		Orders.incrementStatus(order).then(function(result){

        			if(result.data.successful) {

	        			$scope.orders_buy.remove(order);
	        			$scope.orders_confirm.push(order);

	        			order = $.extend(true, order, result.data.order);

								Utils.showMessage('notify.order_confirmed');
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

								Utils.showMessage('notify.order_to_in_transit');

								updatePrevisionState(order);
        			}
        		});
        	}
        	else if(order.status == orderStatus.in_transit) {

        		if($scope.modalCtrl.formOrderInfo.$valid) { // to finish the order the info section should be completed and valid

        			// hay validacion previa en ui para que todas las telas tengan rollo asignado
					$scope.arrive(order);
        		}
        		else {
        			result = false;
        			$scope.modalCtrl.formOrderInfo.$setDirty();

							Utils.showMessage('notify.missing_info_arrive', 'error');
        		}
        	}

        	return result;
        };

        $scope.acceptArriveWarning = function(order) {
        	$scope.arrive(order);
        };

        $scope.arrive = function(order) {
        	console.log('Arrive order: ', order);

			// TODO uncomment this
        	Orders.incrementStatus(order).then(function(result){

				if(result.data.successful) {
					$scope.orders_transit.remove(order);

					order = $.extend(true, order, result.data.order);

					Utils.showMessage('notify.order_arrived');

					// NOTE: not doing this here because it bring problems when many orders are arrived in a small interval (the calcultaion doesn't finish and other start in the middle resulting in bad state assignation)
					// for the moment use manual update after all orders arrive
					// updatePrevisionState(order);
				}
			});
				
			// create files for temporary products (cloths of the order) if neccesary
			var temporaryProducts = order.products.filter(function(p) {
				return p.temporary;
			});
			if (temporaryProducts.length > 0) {				
				var dispatch = {
					isNew: true,
					showFiles: true,
					temporariesProducts: order.products.filter(p => p.temporary),
					description: '<completar>',
					shortName: '<completar>'
				}
				Temporaries.saveDispatch(dispatch).then(function(result) {
					dispatch.isNew = false;
					// will show the dispatch and files only if the user can access the temporaries module,
					// otherwise will only create them in background and the will need to edit them later
					if ($rootScope.user.roles.indexOf('temporaries') != -1) {
						$scope.showTemporariesDispatchModal(dispatch);
					}
				});
			}
        };

        $scope.deleteOrder = function(order) {
        	console.log('Delete order: '+order.orderId);

        	Orders.removeOrder(order).then(function(result){

	    			if(result.data.successful) {
	        			$scope.orders_confirm.remove(order);
	        			$scope.orders_transit.remove(order);

	        			$scope.modalOrder.hide();

								Utils.showMessage('notify.order_deleted');

								if(order.status == orderStatus.in_transit) {
									updatePrevisionState(order);
								}
	    			}
	    			else {
							Utils.showMessage('notify.order_delete_failed', 'error');
	    			}
	    		});

        };


        $scope.close = function() {

        	$.extend($scope.user, $scope.origUser);

        	$scope.modalUser.hide();
        };

		$scope.calculateStates = function() {
			Previsions.updatePrevisionStateWithDeliveryType($scope.filter.deliveryType).then(function() {
				Utils.showMessage('notify.previsions_state_updated');
			});
		};

		$scope.searchOrder = async function() {

			if ($scope.search.order) {

				let result = await Orders.searchOrders($scope.search.order);
				$scope.orders_search = result.data;

				$scope.search.active = true;
			} else {
				$scope.search.active = false;
			}
		};

		$scope.clearSearch = function() {
			$scope.search.order = '';
			$scope.search.active = false;
		};

        $scope.setModalCtrl = function(modalCtrl) {

        	$scope.modalCtrl = modalCtrl;
        };

        $scope.formatDate = function(date) {
        	$.format.date(date, "dd-MM-yyyy");
        };

		function updatePrevisionState(order) {

			var clothsIds = order.products.map(function(p) { return p.clothId; }).join(',');

			Previsions.updatePrevisionState(clothsIds, null, 'ordersController').then(function() {
				Utils.showMessage('notify.previsions_state_updated');
			});
		}
}]);
