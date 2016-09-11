'use strict';

angular.module('vsko.stock')

.directive('productionColumnsSelector', ['$rootScope', function($rootScope) {

    return {
          restrict: 'E',
          replace: true,
          templateUrl: 'views/directives/productionColumnsSelector.html',
          link: function postLink(scope, element, attrs) {

            scope.hideFromSeller = function(c) {
              return c.hideFromSeller && 'vendedor' == $rootScope.user.role;
            };
          }
        };
	}
]);
