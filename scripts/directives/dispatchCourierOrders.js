'use strict';

angular.module('vsko.stock')

.directive('dispatchCourierOrders', function($modal, $rootScope, Previsions) {

    return {
          restrict: 'E',
          scope: {
            dispatch: "="
          },
          templateUrl: 'views/directives/dispatchCourierOrders.html',
          link: function postLink(scope, element, attrs) {

		  }
        };
	}
);
