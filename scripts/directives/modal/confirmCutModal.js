'use strict';

angular.module('vsko.stock')

.directive('confirmCutModal', function($modal, Stock) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;


        	  $scope.showCutConfirmModal = function(selected, callbackFn) {

        		  $scope.selected = selected;

        		  if(callbackFn)
        			  callback = callbackFn;

        		  var d = new Date();
        		  $scope.cut = {date: (d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear())};

              $scope.modalCutConfirm = $modal({template: 'views/modal/confirmCut.html', show: false, scope: $scope, callback: callback, backdrop:'static'});

              $scope.modalCutConfirm.$promise.then($scope.modalCutConfirm.show);
        	  };

              $scope.confirmCut = function() {

            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;

            	  param.cutDate = $scope.cut.date;

            	  if(typeof($scope.modalCutConfirm.$options.callback) == "function") {
            		  $scope.modalCutConfirm.$options.callback(param);
            	  }
            	  else {
            		  $scope[$scope.modalCutConfirm.$options.callback](param);
              	  }

            	  $scope.modalCutConfirm.hide();
              };
          }
        };
	}
);
