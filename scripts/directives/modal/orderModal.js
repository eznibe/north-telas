'use strict';

angular.module('vsko.stock')

.directive('orderModal', function($modal, Utils, Orders, Previsions, orderStatus) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;

        	  $scope.deliveryTypes = ['Desconocido', 'Nacional', 'Courier', 'Aereo1', 'Aereo2', 'Maritimo'];

        	  $scope.showOrderModal = function(order) {

        		      $scope.order = order;

                  $scope.modalOrder = $modal({template: 'views/modal/order.html', show: false, scope: $scope, callback: callback});

                  $scope.modalOrder.$promise.then($scope.modalOrder.show);
        	  };

            $scope.confirmModal = function() {

            	  var param = index ? $scope[params][$scope[index]] : $scope.order;

            	  if($scope[$scope.modalOrder.$options.callback](param)) {
            		  $scope.modalOrder.hide();
            	  }
            };

            $scope.partialSave = function(order) {
  	      			Orders.partialSave(order).then(function(result){
  	      				// ok
  	      				$scope.modalCtrl.formOrderInfo.$setPristine();

                  if(order.status == orderStatus.in_transit) {
                    var clothsIds = order.products.map(function(p) { return p.clothId; }).join(',');
                    Previsions.updatePrevisionState(clothsIds).then(function() {
                      Utils.showMessage('notify.previsions_state_updated');
                    });
                  }
  	      			});
	      	  };

	      	  $scope.removeItem = function(orderproduct) {

	      			Orders.removeItem(orderproduct).then(function(result){
	      				// ok
	      				if(result.data.successful) {

		      				$scope.order.products.remove(orderproduct);

                  Utils.showMessage('notify.order_item_deleted');

                  if($scope.order.status == orderStatus.in_transit) {
                    Previsions.updatePrevisionState(orderproduct.clothId).then(function() {
                      Utils.showMessage('notify.previsions_state_updated');
                    });
                  }

		      				if($scope.order.products.length==0 && result.data.orderDeleted) {

		      					$scope.modalOrder.hide();

		      					if($scope.orders_buy){
		      						$scope.orders_buy.remove($scope.order);
		      					}

                    Utils.showMessage('notify.order_no_items_deleted');
		      				}
	      				} else {
                  Utils.showMessage('notify.delete_orderitem_error', 'error');
                }
	      			}, function(err) {
                console.log('Promise failed:', err);
                Utils.showMessage('notify.delete_orderitem_error', 'error');
              });
	      	  };

	      	  $scope.receive = function() {

	      		  var missingRolls = false;

	      		  $.each($scope.order.products, function(idx, p) {

	      			  if(!p.rolls || p.rolls.length==0 || (p.rolls.length==1 && $scope.isEmptyRoll(p.rolls[0])))
	      				  missingRolls = true;
	      		  });

	      		  if(missingRolls) {
	      			  $scope.showWarningModal({message: 'Hay productos de la orden sin rollos asignados. <br><br> Desea confirmar la orden igual?'}, $scope.confirmModal, $scope.order);
	      	  	  }
	      		  else {
	      			  $scope.showWarningModal({message: 'Confirma el arribo de la orden con los rollos asignados?'}, $scope.confirmModal, $scope.order);
	      		  }
	      	  };

            $scope.updateProductAmount = function(product) {

              Orders.updateProductAmount(product).then(function(result){

                console.log('Updated product amount to '+product.amount);

                if($scope.order.status == orderStatus.in_transit) {
                  Previsions.updatePrevisionState(product.clothId).then(function() {
                    Utils.showMessage('notify.previsions_state_updated');
        					});
                }
              });
            }

	      	  $scope.isEmptyRoll = function(roll) {
	      		  return !roll.number && !roll.lote && !roll.mts;
	      	  };

	      	  $scope.subTotal = function(p) {
	      		  var subtotal = p.amount * p.price;
	      		  return +(Math.round(subtotal + "e+2")  + "e-2");
	      	  };

	      	  $scope.total = function(products) {
	      		  var total = 0;
	      		  $.each(products, function(idx, p){
	      			  total += p.amount * p.price;
	      		  });
	      		  return +(Math.round(total + "e+2")  + "e-2");
	      	  };
          }
        };
	}
)

.directive('rollsModal', ['$modal', 'Orders', function($modal, Orders) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
        	  var callback = attrs.callback;


        	  $scope.showRollsModal = function(orderProduct) {

        		  $scope.orderProduct = orderProduct;

        		  if(!$scope.orderProduct.rolls) {

        			  Orders.getRolls($scope.orderProduct.productId, $scope.orderProduct.orderId).then(function(result){

        				  if(result.data.length==0) {
        					  $scope.orderProduct.rolls = new Array();
                			  $scope.orderProduct.rolls.push({});
        				  }
        				  else {
        					  $scope.orderProduct.rolls = result.data;
        				  }
        			  });
        		  }

        		  $scope.origOrderProduct = $scope.orderProduct ? $.extend(true, {}, $scope.orderProduct) : {}; // used when the user cancel the modifications (close the modal)


                  $scope.modalRolls = $modal({template: 'views/modal/rolls.html', show: false, scope: $scope, callback: callback, backdrop: 'static'});

                  $scope.modalRolls.$promise.then($scope.modalRolls.show);
        	  };

        	  $scope.addRoll = function() {
        		  $scope.orderProduct.rolls.push({});
        	  };

        	  $scope.removeRoll = function(index) {

        		  $scope.orderProduct.rolls.splice(index, 1);

        		  if($scope.orderProduct.rolls.length==0) {
        			  $scope.orderProduct.rolls.push({});
        		  }
        	  };

              $scope.saveRolls = function(orderProduct) {

            	  // TODO save rolls, could be new and other to update

            	  Orders.saveRolls(orderProduct).then(function(result){
            		  // ok
            		  console.log('Saved rolls.');

            		  if(result.data.successful)
            			  $scope.modalRolls.hide();
            	  });

            	  $scope.modalRolls.hide();
              };

              $scope.closeRolls = function(orderProduct) {

            	  $.extend($scope.orderProduct, $scope.origOrderProduct);

            	  $scope.modalRolls.hide();
              };

              $scope.allEmpty = function() {

            	  var allEmpty = $scope.orderProduct.rolls.length==0;

            	  if($scope.orderProduct.rolls.length==1) {

            		  var firstRoll = $scope.orderProduct.rolls[0];

            		  if(firstRoll.number || firstRoll.lote || firstRoll.mts) {
            			  allEmpty = false;
            		  }
            		  else
            			  allEmpty = true;
            	  }

            	  return allEmpty;
              };
          }
        };
	}
]);
