'use strict';

angular.module('vsko.stock')

.directive('confirmArchiveModal', function($modal, $translate, Stock) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;


        	  $scope.showArchiveConfirmModal = function(selected, dateFieldName, callbackFn, messageKey) {

        		  $scope.selected = selected;

        		  if(callbackFn)
        			  callback = callbackFn;

        		  var d = new Date();
        		  $scope.entity = {date: dateFieldName && selected[dateFieldName]
                                              ? selected[dateFieldName]
                                              : (d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear())};

              $scope.modalArchiveConfirm = $modal({template: 'views/modal/confirmArchive.html', show: false, scope: $scope, callback: callback, backdrop:'static'});

              $scope.modalArchiveConfirm.$promise.then($scope.modalArchiveConfirm.show);

              if (messageKey) {
                $scope.confirmMessage = $translate.instant(messageKey);
              } else {
                delete $scope.confirmMessage;
              }
        	  };

              $scope.confirmArchive = function() {

            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;

            	  param.date = $scope.entity.date;

            	  if(typeof($scope.modalArchiveConfirm.$options.callback) == "function") {
            		  $scope.modalArchiveConfirm.$options.callback(param);
            	  }
            	  else {
            		  $scope[$scope.modalArchiveConfirm.$options.callback](param);
            	  }

            	  $scope.modalArchiveConfirm.hide();
              };
          }
        };
	}
);
