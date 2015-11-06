'use strict';

angular.module('vsko.stock')

.directive('confirmRemovePlotterModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  var callbackDelete = attrs.callback;
        	  var callbackRestore = attrs.callback2;
        	  var params = attrs.params;
        	  var index = attrs.index;
        	  
        	  
        	  $scope.showRemovePlotterConfirmModal = function(selected, callbackFnRestore, callbackFnDelete) {
        		  
        		  $scope.selected = selected;
        		  
        		  if(callbackFnRestore)
        			  callbackRestore = callbackFnRestore;
        		  
        		  if(callbackFnDelete)
        			  callbackDelete = callbackFnDelete;
        		  
                  $scope.modalRemovePlotterConfirm = $modal({template: 'views/modal/confirmRemovePlotter.html', show: false, scope: $scope, callback: {callbackRestore: callbackRestore, callbackDelete: callbackDelete}, backdrop:'static'});

                  $scope.modalRemovePlotterConfirm.$promise.then($scope.modalRemovePlotterConfirm.show);
        	  };
        	  
              $scope.confirmForPlotter = function(type) {

            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;
            	  
            	  if(typeof($scope.modalRemovePlotterConfirm.$options.callback['callback'+type]) == "function") {
            		  $scope.modalRemovePlotterConfirm.$options.callback['callback'+type](param);
            	  }
            	  else {
            		  $scope[$scope.modalRemovePlotterConfirm.$options.callback['callback'+type]](param);
              	  }
            	  
            	  $scope.modalRemovePlotterConfirm.hide();
              };
          }
        };
	}
);
