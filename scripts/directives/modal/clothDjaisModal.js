'use strict';

angular.module('vsko.stock')

.directive('clothDjaisModal', function($modal, Previsions) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  
       		  $scope.showClothDjaisModal = function(cloth) {
            		  
        		  $scope.cloth = cloth;
              	
        		  
                  $scope.modalDjais = $modal({template: 'views/modal/clothDjais.html', show: false, scope: $scope});

                  $scope.modalDjais.$promise.then($scope.modalDjais.show);
        	  };
        	  
          }
        };
	}
);
