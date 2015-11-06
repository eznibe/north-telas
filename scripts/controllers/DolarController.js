'use strict';

angular.module('vsko.stock').controller('DolarCtrl', ['$scope', 'Stock', function ($scope, Stock) {

        // initial list of providers
    	Stock.getDolar().then(function(result) {
      	$scope.dolar = result.data[0].value;
				$scope.dolarOrig = $scope.dolar;
      });

			Stock.getPctNac().then(function(result) {
      	$scope.pctNac = result.data[0].value;
				$scope.pctNacOrig = $scope.pctNac;
      });

    	$scope.save = function() {

				if($scope.dolarOrig != $scope.dolar) {

	    		Stock.saveDolar($scope.dolar).then(function(resut){

	    			$.notify("Valor del dolar actualizado.", {className: "success", globalPosition: "bottom right"});
	    		});
				}

				if($scope.pctNacOrig != $scope.pctNac) {

					Stock.savePctNac($scope.pctNac).then(function(result){

	    			$.notify("Valor del % actualizado.", {className: "success", globalPosition: "bottom right"});
	    		});
				}
    	}
}]);
