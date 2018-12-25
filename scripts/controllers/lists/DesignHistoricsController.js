'use strict';

angular.module('vsko.stock').controller('DesignHistoricsCtrl', ['$scope', 'Stock', 'Lists', 'Users', '$modal', function ($scope, Stock, Lists, Users, $modal) {

	$scope.designers = [];
	$scope.orders = [];

	// initial filter options
  $scope.filter = {};
  $scope.filter.types = [{key:'by_designer', type: 'designers', id:'BY_DESIGNER'},
                         {key:'by_orders', type: 'orders', id:'BY_ORDERS'}];
  $scope.filter.selectedType = $scope.filter.types[0];
  $scope.filter.type = $scope.filter.types[0].id;


  $scope.search = function() {

		$scope.designers = [];
		$scope.orders = [];

  	$scope.filter.type = $scope.filter.selectedType.id;

 		Lists.historicDesign($scope.filter).then(function(result) {

 			$scope[$scope.filter.selectedType.type] = result.data;
  	});
  };

	$scope.sumTotalDesignerHours = function() {
		var total = 0;

		$scope.designers.forEach(function(designer) {
			total += +designer.sumDesignHours;
		});

		$scope.orders.forEach(function(prevision) {
			total += +prevision.designHours;
		});

		return total.toFixed(1);
	}

}]);
