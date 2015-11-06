'use strict';

angular.module('vsko.stock')

.directive('clothRollsModal', function($modal, Stock, orderStatus) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  
        	  $scope.showClothRollsModal = function(cloth) {
        		  
        		  $scope.cloth = cloth;
              	
              	  Stock.getClothRolls(cloth.id, true).then(function(result) {
              		  $scope.rolls = result.data;
              		  
              		  $scope.availableRolls = $scope.rolls.findAll(function(r) {
	              			  return r.incoming == '0'; 
              		  });
              		  
              		  $scope.inTransitRolls = $scope.rolls.findAll(function(r) {
            			  return r.incoming == '1'; 
              		  });
              	  });
              	
              	
                  $scope.modalRolls = $modal({template: 'views/modal/clothRolls.html', show: false, scope: $scope});

                  $scope.modalRolls.$promise.then($scope.modalRolls.show);
        	  };
        	  
        	  $scope.setModalCtrl = function(modalCtrl) {
              	
              	$scope.modalCtrl = modalCtrl;
              };
          }
        };
	}
);
