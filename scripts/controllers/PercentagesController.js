'use strict';

angular.module('vsko.stock').controller('ConfigPercentagesCtrl', ['$scope', '$translate', '$cookieStore', 'Utils', 'Stock', 'Production', async function ($scope, $translate, $cookieStore, Utils, Stock, Production) {

	Stock.getPctNac().then(function(result) {
		$scope.pctNac = result.data[0].value;
		$scope.pctNacOrig = $scope.pctNac;
	  });
	  
	$scope.years = [{nr: 2017}, {nr: 2018}, {nr: 2019}, {nr: 2020}, {nr: 2021}];
	$scope.months = [{nr:1, name: 'Enero'}, {nr:2, name: 'Febrero'}, {nr:3, name: 'Marzo'}, {nr: 4, name: 'Abril'}, {nr: 5, name: 'Mayo'}, {nr: 6, name: 'Junio'}, {nr: 7, name: 'Julio'}, {nr: 8, name: 'Agosto'}, {nr: 9, name: 'Septiembre'}, {nr: 10, name: 'Octubre'}, {nr: 11, name: 'Noviembre'}, {nr: 12, name: 'Diciembre'}]

	$scope.filter = {};
	
	var check = moment(new Date());
	
	$scope.filter.year = $scope.years.find(y => y.nr === +check.format('YYYY'));;
	$scope.filter.month = $scope.months.find(m => m.nr === +check.format('M'));

	let result =  await Stock.getInflation($scope.filter.year.nr, $scope.filter.month.nr);
	$scope.inflation = result.data.length > 0 ? result.data[0].value : null;
	$scope.inflationOrig = $scope.inflation;

	if (!$scope.inflation) {
		$scope.isNew = true;
	}

	
	$scope.updateInflationValue = async function() {
		let result =  await Stock.getInflation($scope.filter.year.nr, $scope.filter.month.nr);
		$scope.inflation = result.data.length > 0 ? result.data[0].value : null;
		$scope.inflationOrig = $scope.inflation;

		if (!$scope.inflation) {
			$scope.isNew = true;
		}
	}

	$scope.save = function() {

		if($scope.pctNacOrig != $scope.pctNac) {

			Stock.savePctNac($scope.pctNac).then(function(result){
				Utils.showMessage('notify.percentage_updated');
			});
		}

		// if($scope.inflationOrig != $scope.inflation) {

			Stock.saveInflation($scope.filter.year.nr, $scope.filter.month.nr, $scope.inflation, $scope.isNew).then(function(result){
				Utils.showMessage('notify.percentage_updated');

				delete $scope.isNew ;
			});
		// }
	}
}]);
