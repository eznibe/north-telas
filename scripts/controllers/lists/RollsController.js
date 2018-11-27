'use strict';

angular.module('vsko.stock').controller('RollsCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

    	Lists.getAllRolls(true).then(function(result) {
    		$scope.rolls = result.data;
    	});

    	Stock.getAllCloths(true).then(function(result) {
    		$scope.cloths = result.data;
    	});


    	$scope.rollSelected = function(roll) {

    		if(roll) {
	    		$scope.filter.selectedLote = {};

	    		Lists.getRollLotes(roll).then(function(result) {
	        		$scope.lotes = result.data;

	        		if($scope.lotes.length==1) {
	        			$scope.filter.selectedLote = $scope.lotes[0];
	        		}
	        	});
    		}
    		else {
    			$scope.lotes = [];
    			$scope.filter.selectedLote = null;
    		}
    	};

    	$scope.search = function() {

    		if($scope.filter && ($scope.filter.selectedLote || $scope.filter.selectedCloth)) {

    			var roll = $scope.filter.selectedLote;
    			var cloth = $scope.filter.selectedCloth;

    			Lists.getRollCuts(roll, cloth).then(function(result) {
            		$scope.plotters = result.data;
            	});
    		}
    	};

}]);
