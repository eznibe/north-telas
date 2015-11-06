'use strict';

angular.module('vsko.stock')

.directive('confirmModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;
        	  
        	  
        	  $scope.showConfirmDeleteModal = function(selected, callbackFn) {
        		  
        		  $scope.selected = selected;
        		  
        		  if(callbackFn)
        			  callback = callbackFn;
        		  
                  $scope.modalConfirm = $modal({template: 'views/modal/confirmDelete.html', show: false, scope: $scope, callback: callback, backdrop:'static'});

                  $scope.modalConfirm.$promise.then($scope.modalConfirm.show);
        	  };
        	  
        	  $scope.showConfirmModal = function(selected, callbackFn) {
        		  
        		  $scope.selected = selected;
        		  
        		  if(callbackFn)
        			  callback = callbackFn;
        		  
                  $scope.modalConfirm = $modal({template: 'views/modal/confirm.html', show: false, scope: $scope, callback: callback, backdrop:'static'});

                  $scope.modalConfirm.$promise.then($scope.modalConfirm.show);
        	  };
        	  
              $scope.confirm = function() {

            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;
            	  
            	  if(typeof($scope.modalConfirm.$options.callback) == "function") {
            		  $scope.modalConfirm.$options.callback(param);
            	  }
            	  else {
            		  $scope[$scope.modalConfirm.$options.callback](param);
              	  }
            	  
            	  $scope.modalConfirm.hide();
              };
          }
        };
	}
);
