'use strict';
	
angular.module('vsko.stock').controller('ProvidersCtrl', ['$scope', 'Stock', '$modal', function ($scope, Stock, $modal) {

        // initial list of providers
    	Stock.getAllProviders().then(function(result) {
        	$scope.providers = result.data;
        });
}]);

