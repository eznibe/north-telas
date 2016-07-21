'use strict';

angular.module('vsko.stock').controller('ProductionCtrl', ['$scope', '$rootScope', 'Production', 'Previsions', 'Users', 'Rules', function ($scope, $rootScope, Production, Previsions, Users, Rules) {

	$scope.start = Date.now();

	Previsions.getPrevisionsForProduction().then(function(result) {

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

	$scope.columns = {seller: true, week: true, priority: true, dispatch: true, order: true, client: true, boat: true, sail: true, line: true, percentage: true, advance: true, deliveryDate: true
									 ,tentativeDate: true, productionDate: true, infoDate: true, advanceDate: true, cloths: true, state: true, area: true, productionObservations: true};

	$scope.getValue = function(prevision, fieldName) {
		if (!prevision[fieldName]) {
			return '';
		}
		return prevision[fieldName];
	}

	$scope.onSavePrevision = function(prevision) {
		$scope.$broadcast('$$rebind::refreshColumnsValue');
		$scope.$broadcast('$$rebind::refreshLinkValue');
	}

	$scope.oneTimeBindings = {
		showPopupList: function(id) {
			$('#'+id).show();
		},
		hidePopupList: function(id) {
			$('#'+id).hide();
		},
		acceptStateChange: function(prevision) {
			Previsions.acceptStateChange(prevision).then(function() {
				$.notify("Cambio de estado aceptado.", {className: "success", globalPosition: "bottom right"});
				prevision.stateAccepted = true;
				$scope.$broadcast('$$rebind::refreshStateValue');
			});
		}
	}

	$scope.search = function() {

		$scope.filter.type = $scope.filter.selectedType.id;
		var groupBy = ($scope.filter.selectedGroupBy && $scope.filter.selectedGroupBy.id) ? $scope.filter.selectedGroupBy.id : null;

		$scope.filter.searchedWithGroupBy = groupBy;
	};

	$scope.updateDate = function(entity, value, fieldName) {
		// console.log('Updated date ', fieldName, ' to:', value);
		Production.updateDate(entity, fieldName).then(function() {
			// entity[fieldName] = value;
			Rules.updatePrevisionPercentage(entity, true);
			if (entity.percentageChanged) {
				$scope.$broadcast('$$rebind::refreshColumnsValue');
				delete entity.percentageChanged;
			}
		});
	};

	$scope.changedNumericField = function(entity, value, fieldName) {

		Production.updateField(entity, fieldName, true).then(function() {
		});
	};

	$scope.removeFromProduction = function(prevision) {
		prevision.deletedProductionOn = prevision.date; //moment().format('DD-MM-YYYY');
		prevision.deletedProductionBy = $rootScope.user.name;

		Production.updateDate(prevision, 'deletedProductionOn').then(function() {
			$scope.previsions = $scope.previsions.filter(function(p) {
				return p.id != prevision.id;
			});
		});

		Previsions.editField(prevision, 'deletedProductionBy');
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
