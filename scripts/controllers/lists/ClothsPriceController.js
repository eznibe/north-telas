'use strict';

angular.module('vsko.stock').controller('ClothsPriceCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

			Stock.getAllGroups(true).then(function(result) {

				$scope.groups = result.data;
			});

			Lists.getPrices(null).then(function(result) {

				$scope.cloths = result.data;
			});

    	$scope.filter = function(selectedGroup) {

	    		Lists.getPrices($scope.filter.selectedGroup).then(function(result) {

        		$scope.cloths = result.data;
        	});
    	};

}]);
