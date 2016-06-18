'use strict';

angular.module('vsko.stock').controller('ProductionCtrl', ['$scope', 'Stock', 'Previsions', 'Users', '$modal', function ($scope, Stock, Previsions, Users, $modal) {

				$scope.start = Date.now();

				Previsions.getAll(false).then(function(result) {

					console.log('Results in ' + (Date.now() - $scope.start) + ' ms.'); //eslint-disable-line

	        $scope.previsions = result.data;
					var count=0;
					$scope.previsions.map(function(prev) {
						// prev.dispatch = '123-456';
						if(count<3) {
							// prev.tentativeDate = '2016-05-15';
						}
						count++
					})
        });

				$scope.columns = {seller: true, week: true, priority: true, dispatch: true, order: true, client: true,
				 									boat: true, sail: true, line: true, percentage: true, advance: true, deliveryDate: true,
				 									tentativeDate: true, productionDate: true, infoDate: true, advanceDate: true, cloths: true,
													state: true, area: true};

				$scope.getValue = function(prevision, fieldName) {
					if (!prevision[fieldName]) {
						return '';
					}
					return prevision[fieldName];
				}

        $scope.search = function() {

        	$scope.filter.type = $scope.filter.selectedType.id;
					var groupBy = ($scope.filter.selectedGroupBy && $scope.filter.selectedGroupBy.id) ? $scope.filter.selectedGroupBy.id : null;

					$scope.filter.searchedWithGroupBy = groupBy;
        };

				$scope.updateDate = function(entity, value, fieldName) {
					console.log('Updated date ', fieldName, ' to:', value);
				};

				$scope.visibility = {
					showColumn: function(column) {
						// return false;
						return $scope.columns[column];
					},

					refreshColumns() {
						$scope.$broadcast('$$rebind::refreshColumns');
					}
				}

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
