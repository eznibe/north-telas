'use strict';

angular.module('vsko.stock')

.directive('clothRollsTags', function($modal, Orders) {
        
    return {
          restrict: 'E',
          scope: {
          	rolls: '='
          },
          templateUrl: 'views/directives/clothRollsTags.html',
          link: function postLink(scope, element, attrs) {
              
          }
        };
	}
);