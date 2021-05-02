'use strict';

angular.module('vsko.stock').controller('DispatchsCourierCtrl', ['$scope', 'Orders', function ($scope, Orders) {

	// initial filter options
	$scope.filter = {};

	Orders.getCourierDispatchs($scope.filter).then(function(result) {
		$scope.dispatchs = result.data;
	});

  $scope.search = () => {
    Orders.getCourierDispatchs($scope.filter).then(function(result) {
      $scope.dispatchs = result.data;
    });
  }

}]);
