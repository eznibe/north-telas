'use strict';

angular.module('vsko.stock').controller('DolarCtrl', ['$scope', '$translate', '$cookieStore', 'Utils', 'Stock', function ($scope, $translate, $cookieStore, Utils, Stock) {

        // initial list of providers
    	Stock.getDolar().then(function(result) {
      	$scope.dolar = result.data[0].value;
				$scope.dolarOrig = $scope.dolar;
      });

			Stock.getPctNac().then(function(result) {
      	$scope.pctNac = result.data[0].value;
				$scope.pctNacOrig = $scope.pctNac;
      });

      $scope.changeLanguage = function(lang) {
        $translate.use(lang);
        $cookieStore.put('lang', lang);
      }

    	$scope.save = function() {

				if($scope.dolarOrig != $scope.dolar) {

	    		Stock.saveDolar($scope.dolar).then(function(resut){

            Utils.showMessage('notify.dolar_updated');
	    		});
				}

				if($scope.pctNacOrig != $scope.pctNac) {

					Stock.savePctNac($scope.pctNac).then(function(result){
            Utils.showMessage('notify.percentage_updated');
	    		});
				}
    	}
}]);
