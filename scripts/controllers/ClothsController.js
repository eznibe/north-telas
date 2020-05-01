'use strict';

angular.module('vsko.stock').controller('ClothsCtrl', ['$scope', '$routeParams', 'Stock', 'Lists', '$modal', function ($scope, $routeParams, Stock, Lists, $modal) {

		$scope.onlyWithStock = $routeParams.onlyWithStock;

		$scope.search = function() {

			// initial list of cloth groups
			if($routeParams.groupId) {
				$scope.groupId = Number($routeParams.groupId);
	
				Stock.getGroup($scope.groupId, 'FULL').then(function(result) {
					$scope.group = result.data;
					$scope.cloths = $scope.group.cloths;
				});
			}
			else {
				Stock.getAllCloths().then(function(result) {
					$scope.cloths = result.data.filter(c => {
						if ($scope.onlyWithStock) {
							return $scope.sumStock(c.providers) > 0
							  || +c.stockMin > 0
							  || +$scope.deltaTotal(c) < 0;
						}
						return true;
					});

					if ($routeParams.onlyWithStock) {
						Lists.log({type: 'info.cloths.onlyWithStock', log: ('Results: ' + $scope.cloths.length)});
					}
				});
			}
		}

		$scope.search();


        $scope.sumStock = function(providers) {

        	var sum = 0;

        	$.each(providers, function(idx, p){
        		sum += new Number(p.stock);
        	});

        	return sum != 0 && sum % 1 != 0 ? sum.toFixed(2) : sum;
        };

        $scope.sumPrevision = function(cloth) {

        	var sum = 0;

        	$.each(cloth.previsions, function(idx, p){

        		$.each(p.cloths, function(idx2, c){

        			if(c.clothId == cloth.id)
        				sum += new Number(c.mts);
        		});
        	});

        	return sum != 0 && sum % 1 != 0 ? sum.toFixed(2) : sum;
        };

        $scope.sumPending = function(cloth) {

        	var sum = 0;

        	$.each(cloth.plotters, function(idx, p){
        		sum += new Number(p.mtsDesign);
        	});

        	return sum != 0 && sum % 1 != 0 ? sum.toFixed(2) : sum;
        };

        $scope.sumDjai = function(cloth) {
        	return sumDjai(cloth);
        };

        $scope.deltaTotal = function(c) {
          return ($scope.sumStock(c.providers) - $scope.sumPrevision(c) - $scope.sumPending(c) + +c.stockInTransit).toFixed(0);
        };

        $scope.negativeDeltaTotalStyle = function(c) {
          return $scope.deltaTotal(c) < 0 ? {'color': 'red', 'background-color': '#e4e4e4'} : {'background-color': '#e4e4e4'};
		};
		
		$scope.changeOnlyWithStock = function() {
			$scope.onlyWithStock = !$scope.onlyWithStock;
			
			if ($scope.onlyWithStock) {
				$scope.cloths = $scope.allResults.filter(c => {
					return $scope.sumStock(c.providers) > 0;
				});
				$scope.$apply();
			} else {
				$scope.cloths = $scope.allResults;
			}
		} 
}]);
