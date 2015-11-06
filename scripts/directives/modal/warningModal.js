'use strict';

angular.module('vsko.stock')

.directive('warningModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  $scope.showWarningModal = function(warning, callbackFn, params) {
        		  
        		  $scope.warning = warning;
        		  
                  $scope.modalWarning = $modal({template: 'views/modal/warning.html', show: false, scope: $scope, callback: callbackFn, params: params, backdrop:'static'});

                  $scope.modalWarning.$promise.then($scope.modalWarning.show);
        	  };
        	  
              $scope.confirmWarning = function() {

           		  $scope.modalWarning.$options.callback($scope.modalWarning.$options.params);
            	  
            	  $scope.modalWarning.hide();
              };
          }
        };
	}
);
