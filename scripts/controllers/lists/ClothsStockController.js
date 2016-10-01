'use strict';

angular.module('vsko.stock').controller('ClothsStockCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

			Stock.getAllGroups(true).then(function(result) {

				$scope.groups = result.data;
			});

    	$scope.filter = function(selectedGroup) {

				$scope.filter.pastAvailability = $scope.filter.upToDate;

				if($scope.filter.selectedGroup) {

						if($scope.filter.upToDate) {
							Lists.stockUpToDate($scope.filter.selectedGroup.id, $scope.filter.upToDate).then(function(result) {
								$scope.cloths = result.data;
							});
						}
						else {
			    		Stock.getGroup($scope.filter.selectedGroup.id, 'WITH_ROLLS').then(function(result) {

		        		$scope.cloths = result.data.cloths;
		        		divideRollsByState($scope.cloths);
		        	});
						}
				}
    	};

    	$scope.sumStock = function(cloth) {

				var providers = cloth.providers;

				if(!cloth.providers)
					return 0;

      	var sum = 0;

      	$.each(providers, function(idx, p){
      		sum += new Number(p.stock);
      	});

      	return sum;
      };


      function divideRollsByState(cloths) {

					if(!cloths)
						return;

    			$.each(cloths, function(idx, c){

	    			c.rollsAvailable = new Array();
	    			c.rollsInTransit = new Array();

	    			$.each(c.rolls, function(idx, r){

	    				r.incoming == '1' ? c.rollsInTransit.push(r) : c.rollsAvailable.push(r);
	    			});
        	});
      }
}]);
