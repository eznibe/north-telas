'use strict';

angular.module('vsko.stock')

.directive('clothPendingsModal', function($modal, Previsions) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  
        	  $scope.showClothPendingsModal = function(cloth) {
        		  
        		  $scope.cloth = cloth;
              	
              	
                  $scope.modalPendings = $modal({template: 'views/modal/clothPendings.html', show: false, scope: $scope});

                  $scope.modalPendings.$promise.then($scope.modalPendings.show);
        	  };
        	  
          }
        };
	}
);
