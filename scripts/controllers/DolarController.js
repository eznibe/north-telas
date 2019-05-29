'use strict';

angular.module('vsko.stock').controller('DolarCtrl', ['$scope', '$rootScope', '$modal', 'Utils', 'Stock', function ($scope, $rootScope, $modal, Utils, Stock) {

  Stock.getDolar().then(function(result) {

    $scope.dolar = { value: result.data[0].value, fromDate: result.data[0].fromDate};
    $scope.dolarOrig = $scope.dolar.value;
  });

  Stock.getHistoricDolar().then(function(result) {

    $scope.historicDolars = result.data;
  });


	$scope.save = function() {

		if($scope.dolarOrig !== $scope.dolar.value && $scope.dolar.value) {

			Stock.saveDolar($scope.dolar).then(function(resut){

        Utils.showMessage('notify.dolar_updated');
			});
		}
  }
  
  // Modal functions
  $scope.showModal = function(historic) {

    $scope.historicDolar = historic ? historic : {country: $rootScope.user.country};

    $scope.modalDolar = $modal({template: 'views/modal/dolarHistoric.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

    $scope.modalDolar.$promise.then($scope.modalDolar.show);
  };

  $scope.saveHistoricDolar = function(dolar) {
    
    if (dolar.value && dolar.fromDate && dolar.untilDate) {

      console.log('Save historic dolar:', dolar)
      Stock.saveHistoricDolar(dolar);

    } else {
      Utils.showMessage('notify.dolar_historic_error', 'error');
    }

    $scope.modalDolar.hide();
  }

  $scope.close = function() {

    $scope.modalDolar.hide();
  };
}]);
