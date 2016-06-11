'use strict';

angular.module('vsko.stock').controller('ProductionCtrl', ['$scope', 'Stock', 'Previsions', 'Users', '$modal', function ($scope, Stock, Previsions, Users, $modal) {

				Previsions.getAll(false).then(function(result) {
	        $scope.previsions = result.data;
        });

				$scope.columns = {seller: true, week: true, priority: true, dispatch: true, order: true, client: true,
				 									boat: true, sail: true, line: true, percentage: true, advance: true, deliveryDate: true,
				 									tentativeDate: true, productionDate: true, infoDate: true, advanceDate: true, cloths: true,
													state: true, area: true};

        $scope.search = function() {

        	$scope.filter.type = $scope.filter.selectedType.id;
					var groupBy = ($scope.filter.selectedGroupBy && $scope.filter.selectedGroupBy.id) ? $scope.filter.selectedGroupBy.id : null;

					$scope.filter.searchedWithGroupBy = groupBy;

       		Lists.betweenDates($scope.filter, $scope.filter.selectedType.type, groupBy).then(function(result) {
       			$scope[$scope.filter.selectedType.type] = result.data;
        	});
        };

				$scope.updateDate = function(entity, value, fieldName) {

				};

				$scope.clearFilterOption = function() {
					$scope.filter.invoice = null;
					$scope.filter.selectedCloth = null;
					$scope.filter.selectedUser = null;
					$scope.filter.selectedProvider = null;
					$scope.filter.selectedGroup = null;
				};

				$scope.updateFilterOptions = function() {
					$scope.clearFilterOption();
					if ($scope.filter.selectedType.id === 'TYPE_PLOTTERS') {
						$scope.filter.options = optionsPlotters;
					} else if ($scope.filter.selectedType.id === 'TYPE_ORDERS') {
						$scope.filter.options = optionsOrders;
					} else {
						$scope.filter.options = optionsBoth;
					}
	        $scope.filter.selectedOption = $scope.filter.options[0];
				}
}]);
