'use strict';

angular.module('vsko.stock').controller('UnderStockCtrl', ['$scope', 'Stock', '$modal', function ($scope, Stock, $modal) {

		Stock.getAllCloths().then(function(result) {
    		
    		$scope.cloths = getUnderStock(result.data);
    	});

		Stock.getAllGroups().then(function(result) {
			
			$scope.groups = result.data;
		});
		
    	
    	$scope.filterByGroup = function(selectedGroup) {
    		
			if(selectedGroup) {
	    		Stock.getGroup(selectedGroup.id, 'FULL').then(function(result) {
	        		
	        		$scope.cloths = getUnderStock(result.data.cloths);
	        	});
			}
			else {
				Stock.getAllCloths().then(function(result) {
		    		
		    		$scope.cloths = getUnderStock(result.data);
		    	});
			}
    	};
    	
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
        
        
        function getUnderStock(cloths) {

        	var underStockCloths = new Array();
    		
    		$.each(cloths, function(idx, c){
    			if($scope.sumStock(c.providers) < c.stockMin) {
    				underStockCloths.push(c);
    			}
        	});
    		
    		return underStockCloths;
        }
}]);

