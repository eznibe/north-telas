'use strict';
	
angular.module('vsko.stock').controller('PrevisionsCtrl', ['$scope', 'Previsions', '$modal', function ($scope, Previsions, $modal) {

    	$scope.maxCloths = 3;
    	
        // initial list of cloth groups
    	Previsions.getAll().then(function(result) {
        	$scope.previsions = result.data;
        	
//        	$.each($scope.previsions, function(index) {
//        		
//        	});
        });

    	$scope.sortOptions = [{id:'unformattedDeliveryDate', name:'Fecha'}, {id:'orderNumber', name:'Numero de orden'}];
    	
    	$scope.reverse = false;
    	
    	$scope.changeOrder = function() {
    		$scope.reverse = !$scope.reverse;
    	};
    	
    	$scope.format = function(date) {
      	  var dateParts = date.split("-");

      	  return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
        };
}]);

