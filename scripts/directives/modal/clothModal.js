'use strict';

angular.module('vsko.stock')

.directive('clothModal', function($modal, Utils, Stock, Orders, orderStatus) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  /*$scope.pctNac = 1.45; // TODO move to constants*/
            Stock.getPctNac().then(function(result){
        		  $scope.pctNac = new Number("1." + result.data[0].value);
        	  });

        	  Stock.getDolar().then(function(result){
        		  $scope.dolar = result.data[0].value;
        	  });

        	  $scope.showClothModal = function(cloth) {

        		  if(cloth) {
	        		  $scope.cloth = cloth;

	              	  Stock.getProviders(cloth.id).then(function(result){
	              		  $scope.cloth.providers = result.data;
	              	  });
        		  }
        		  else {
        			  $scope.cloth = {};
        		  }

          	  Stock.getAllGroups(true).then(function(result){
          		  $scope.groups = $scope.groups ? $scope.groups : result.data;

          		  $.each($scope.groups, function(index, value){

          			  if($scope.groups[index].id == $scope.cloth.groupId) {
          				  $scope.cloth.selectedGroup = $scope.groups[index];
          			  }
          		  });

          		  if(!$scope.cloth.id) {
          			  // new cloth default first group
          			  $scope.cloth.selectedGroup = $scope.groups[0];
          		  }
          	  });

              $scope.modalCloth = $modal({template: 'views/modal/cloth.html', show: false, scope: $scope});

              $scope.modalCloth.$promise.then($scope.modalCloth.show);
        	  };

        	  $scope.saveCloth = function(cloth) {

              console.log('Saving cloth');

        		  cloth.groupId = cloth.selectedGroup ? cloth.selectedGroup.id : null;

              cloth.selectedGroup = null;

              if (cloth.groupId) {

                Stock.saveCloth(cloth).then(function(result){

                  $scope.modalCloth.hide();

                  Utils.showMessage('notify.saved_changes');

                  Stock.getAllGroups().then(function(result){
                    // refresh groups because of possible modification in the cloth group
                    $scope.groups = result.data;
                  });
                });
              } else {
                Utils.showMessage('notify.missing_group', 'error');
              }
        	  };

            $scope.deleteCloth = function(cloth) {

              Stock.deleteCloth(cloth).then(function(result){

                if(result.data.successful) {

                  $scope.cloths.remove(cloth);

                  $scope.modalCloth.hide();

                  Utils.showMessage('notify.cloth_deleted');
                }
              });
            };

        	  $scope.showBuyModal= function(provider) {

              	// init selected cloth provider
        		    $scope.provider = provider;

                $scope.filter = {orderTypes: [{id: 'TO_CONFIRM', name: 'A confirmar'}, {id: 'IN_TRANSIT', name: 'En transito'}]};
                $scope.filter.selectedOrderType = $scope.filter.orderTypes[0];

                Orders.getOrders(orderStatus.to_confirm, provider.id).then(function(result){
                  $scope.ordersToConfirm = result.data;

                  $.each($scope.ordersToConfirm, function(idx, o){
                		o.description = o.provider + ' ' + o.orderDate + ' (' + o.products.length + ') - #'+o.number;
                	});
                });

                Orders.getOrders(orderStatus.in_transit, provider.id).then(function(result){
                  $scope.ordersInTransit = result.data;

                  $.each($scope.ordersInTransit, function(idx, o){
                		o.description = o.provider + ' ' + o.orderDate + ' (' + o.products.length + ') - #'+o.number;
                	});
                });

        		    $scope.modalCloth.hide();

                $scope.modalBuy = $modal({template: 'views/modal/buy.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

                $scope.modalBuy.$promise.then($scope.modalBuy.show);
            };

            $scope.buy = async function(amount) {

            	  $scope.modalBuy.hide();

                $scope.provider.amount = amount;
                
                let result = await Stock.getDolar();
                let dolar = result.data[0].value;

                // we need to identify if it should create a new order or assign the new buy to a existent order
                if(!($scope.filter.selectedOrder && $scope.filter.selectedOrder.orderId)) {

                  $scope.provider.dolar = dolar;

              	  Orders.buy($scope.provider).then(function(result){

              		  // show feedback message
                    if(result.data.successful) {
                      Utils.showMessage('notify.buy_amount', 'success', {amount: amount});
                    }
                    else {
                      Utils.showMessage('notify.buy_failed', 'error');
                    }
              	  });
                }
                else {
                  Orders.assignProduct($scope.provider, $scope.filter.selectedOrder.orderId).then(function(result){

              		  // show feedback message
                    if(result.data.successful) {
                      Utils.showMessage('notify.buy_assigned', 'success', {orderNumber: scope.filter.selectedOrder.number});
                    }
                    else {
                      Utils.showMessage('notify.buy_assign_failed', 'error');
                    }
              	  });
                }
            };

            $scope.toPriceNac = function(price) {

            	  return (price * $scope.pctNac).toFixed(2) ;
              };

              $scope.toPriceRef = function(price) {

            	  return (price * $scope.pctNac * $scope.dolar).toFixed(2);
              };

              $scope.sumDjai = function(cloth) {
            	  return sumDjai(cloth);
              };

              $scope.sumStock = function(providers) {

            	 if(!providers)
            		 return 0;

              	var sum = 0;

              	$.each(providers, function(idx, p){
              		sum += new Number(p.stock);
              	});

              	return sum;
              };

              $scope.changedCode = function(product) {

          		  Stock.updateProductCode(product).then(function(result){

          			  console.log("Changed product code to "+product.code);
          		  });
          	  };

              $scope.changedPrice = function(product) {

          		  Stock.updateProductPrice(product).then(function(result){

          			  console.log("Changed price to "+product.price);
          		  });
          	  };
          }
        };
	}
);
