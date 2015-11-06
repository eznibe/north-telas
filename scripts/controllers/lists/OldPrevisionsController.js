'use strict';

angular.module('vsko.stock').controller('OldPrevisionsCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

	Stock.getAllCloths().then(function(result) {
		$scope.cloths = result.data;
	});
	
	
	$scope.fillClothsPlottersHistory = function(cloth) {
		
		Lists.clothPlottersHistory(cloth).then(function(result){
			
			$scope.plotters = result.data;
		});
	};
	
	$scope.showRolls = function(rolls) {
		
		var toStringRolls = "";
		
		$.each(rolls, function(idx, r){
			toStringRolls += "("+r.number+" / "+r.lote+") ";
    	});
		
		return toStringRolls;
	};
        
}]);

