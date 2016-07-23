'use strict';

angular.module('vsko.stock')

.directive('productionPercentages', function() {

    return {
          restrict: 'E',
          replace: true,
          templateUrl: 'views/directives/productionPercentages.html',
          link: function postLink(scope, element, attrs) {

          }
        };
	}
);
