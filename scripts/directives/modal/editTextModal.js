'use strict';

angular.module('vsko.stock')

.directive('editTextModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          scope: {
        	  field: '=',
          },
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;
        	  
        	  
        	  $scope.$parent.showEditModal = function(selected, callbackFn) {
        		  
        		  scope.selected = selected;
        		  scope.edit = { text: selected[scope.field] };
        		  
        		  if(callbackFn)
        			  callback = callbackFn;
        		  
                  $scope.modalEdit = $modal({template: 'views/modal/editText.html', show: false, scope: scope, callback: callback, backdrop:'static'});

                  $scope.modalEdit.$promise.then($scope.modalEdit.show);
        	  };
        	  
              scope.confirmEdition = function() {

            	  scope.selected[scope.field] = scope.edit.text;
            	  
            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;
            	  
            	  if(typeof($scope.modalEdit.$options.callback) == "function") {
            		  $scope.modalEdit.$options.callback(param);
            	  }
            	  else {
            		  $scope[$scope.modalEdit.$options.callback](param);
              	  }
            	  
            	  $scope.modalEdit.hide();
              };
          }
        };
	}
);
