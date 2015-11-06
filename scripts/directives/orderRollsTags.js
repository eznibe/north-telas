'use strict';

angular.module('vsko.stock')

.directive('orderRollsTags', function($modal, Orders) {
        
    return {
          restrict: 'E',
          templateUrl: 'views/directives/orderRollsTags.html',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  Orders.getRolls($scope.p.productId, $scope.p.orderId).then(function(result){
				  
				  if(result.data.length > 0) {
					  $scope.p.rolls = result.data;
				  }
			  });
          }
        };
	}
);