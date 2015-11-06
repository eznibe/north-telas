'use strict';

angular.module('vsko.stock').controller('ClothsCtrl', ['$scope', '$routeParams', 'Stock', '$modal', function ($scope, $routeParams, Stock, $modal) {

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
        		$scope.cloths = result.data;
        	});
        }

        
        $scope.sumStock = function(providers) {
        	
        	var sum = 0;
        	
        	$.each(providers, function(idx, p){
        		sum += new Number(p.stock);
        	});
        	
        	return sum; 
        };
        
        $scope.sumPrevision = function(cloth) {
        	
        	var sum = 0;
        	
        	$.each(cloth.previsions, function(idx, p){
        		
        		$.each(p.cloths, function(idx2, c){
        			
        			if(c.clothId == cloth.id)
        				sum += new Number(c.mts);
        		});
        	});
        	
        	return sum; 
        };
        
        $scope.sumPending = function(cloth) {
        	
        	var sum = 0;
        	
        	$.each(cloth.plotters, function(idx, p){
        		sum += new Number(p.mtsDesign);
        	});
        	
        	return sum; 
        };
        
        $scope.sumDjai = function(cloth) {
        	return sumDjai(cloth);
        };
}]);

