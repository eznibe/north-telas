'use strict';

angular.module('vsko.stock')

.directive('clothInTransitModal', function($modal, Orders, orderStatus) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  
        	  $scope.showClothInTransitModal = function(cloth) {
        		  
        		  $scope.cloth = cloth;
              	
              	  Orders.getOrders(orderStatus.in_transit).then(function(result) {
              		var orders = result.data;
					$scope.clothInTransitOrders = new Array();
						
					var ordersAdded = [];
              		  
              		  $.each(orders, function(index){
              			  
              			  var order = this;
              			  $.each(order.products, function(idx){
              				  
							if(this.clothId == cloth.id && ordersAdded.indexOf(order.number) == -1) {
              					$scope.clothInTransitOrders.push(order);
								order.amount = +this.amount;
									
								ordersAdded.push(order.number)
							} else if(this.clothId == cloth.id && ordersAdded.indexOf(order.number) != -1) {
								order.amount += +this.amount;
							}
								
              				  
              				  order.unformattedArriveDate = new Date(order.unformattedArriveDate);
              			  });
              		  });
              	  });
              	
              	
                  $scope.modalInTransit = $modal({template: 'views/modal/clothInTransit.html', show: false, scope: $scope});

                  $scope.modalInTransit.$promise.then($scope.modalInTransit.show);
        	  };
        	  
        	  $scope.setModalCtrl = function(modalCtrl) {
              	
              	$scope.modalCtrl = modalCtrl;
              };
          }
        };
	}
);
