'use strict';

angular.module('vsko.stock').controller('ConfigPercentagesCtrl', ['$scope', '$translate', '$cookieStore', 'Utils', 'Stock', 'Production', function ($scope, $translate, $cookieStore, Utils, Stock, Production) {

	Stock.getPctNac().then(function(result) {
		$scope.pctNac = result.data[0].value;
		$scope.pctNacOrig = $scope.pctNac;
	  });
	  
	Stock.getInflation().then(function(result) {
		$scope.inflation = result.data[0].value;
		$scope.inflationOrig = $scope.inflation;
  	});


	$scope.save = function() {

		if($scope.pctNacOrig != $scope.pctNac) {

			Stock.savePctNac($scope.pctNac).then(function(result){
				Utils.showMessage('notify.percentage_updated');
			});
		}

		if($scope.inflationOrig != $scope.inflation) {

			Stock.saveInflation($scope.inflation).then(function(result){
				Utils.showMessage('notify.percentage_updated');
			});
		}
	}
}]);
