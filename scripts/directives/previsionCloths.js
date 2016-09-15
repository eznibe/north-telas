'use strict';

angular.module('vsko.stock')

.directive('previsionCloths', function($modal, $rootScope, Previsions) {

    return {
          restrict: 'E',
          scope: {
            prevision: "="
          },
          templateUrl: 'views/directives/previsionCloths.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
          }
        };
	}
);
