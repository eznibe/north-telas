'use strict';

angular.module('vsko.stock').controller('HistoricCtrl', ['$scope', '$rootScope', '$translate', 'Production', 'Previsions', 'Users', 'Rules', function ($scope, $rootScope, $translate, Production, Previsions, Users, Rules) {

	$scope.start = Date.now();

	var rows = 100;
	var firstLoad = true;

	// var defaultFilters = {orderByKey: 'p.deletedProductionOn', orderByKeyType: 'date', orderType: 'order.descending', limit: rows};
	var defaultFilters = {orderList: [], limit: rows, default: true};
	defaultFilters.orderList.push({key: 'p.deletedProductionOn', type: 'str', mode: 'order.descending'});

	Previsions.getPrevisionsHistoric($rootScope.user.sellerCode, defaultFilters).then(function(result) {

		console.log('Results in ' + (Date.now() - $scope.start) + ' ms.'); //eslint-disable-line

		$scope.previsions = result.data;

		if (result.data[0] && result.data[0].count > rows) {
			$('#pagination').twbsPagination({
		        totalPages: (result.data[0].count / rows) + 1,
		        visiblePages: 7,
						startPage: 1,
						first: '<<',prev: '<',last: '>>',next: '>',
		        onPageClick: function (event, page) {
							if (!firstLoad) {
			          console.log('Page: '+page);
								$scope.search(page);
							} else {
								firstLoad = false;
							}
		        }
		    });
		}
	});

	$scope.columns = {seller: true, week: true, priority: true, dispatch: true, order: true, client: true, boat: true, sail: true, line: true, percentage: true, advance: false, deliveryDate: true
									 ,tentativeDate: false, productionDate: true, infoDate: true, advanceDate: true, cloths: true, state: false, area: true, productionObservations: false, archivedDate: true};

	 // initial filter options
	 $scope.filter = {};
	 $scope.filterOptions = {};
	 $scope.filterOptions.columns = [{name: 'Seller', key:'seller', type:'str', options: []}, {name: 'Week', key:'week', type:'nr', options: []}, {name: 'Priority', key:'priority', type:'nr', options: []}, {name: 'Dispatch', key:'d.number', column: 'dispatch', type:'nr', options: []},
	 												{name: 'Order', key:'p.orderNumber', column: 'orderNumber', type:'str', options: []}, {name: 'Client', key:'p.client', column: 'client', type:'str', options: []}, {name: 'Boat', key:'boat', type:'str', options: []}, {name: 'Sail', key:'sailName', type:'str', options: []}, {name: 'Line', key:'line', type:'str', options: []}, {name: '%', key:'percentage', type:'nr', options: []},
	 												{name: 'Advance', key:'advance', type:'nr', options: []}, {name: 'Delivery date', key:'p.deliveryDate', type:'date', options: []}, {name: 'Tentative date', key:'p.tentativeDate', type:'date', options: []}, {name: 'Production date', key:'p.productionDate', type:'date', options: []}, {name: 'Info date', key:'p.infoDate', type:'date', options: []},
	 												{name: 'Advance date', key:'p.advanceDate', type:'date', options: []}, {name: 'State', key:'state', type:'str', options: []}, {name: 'Area', key:'area', type:'nr', options: []}, {name: 'Archived date', key:'p.deletedProductionOn', type:'date', options: []}];

	 $scope.filterOptions.orderTypes = [{name: 'Order ascending', key:'order.ascending'},
	 																	  {name: 'Order descending', key:'order.descending'}];
	 $scope.filterOptions.selectedOrderBy = $scope.filterOptions.columns[18];
	 $scope.filterOptions.selectedOrderType = $scope.filterOptions.orderTypes[1];

	 translateOptions($scope.filterOptions.columns);
	 translateOptions($scope.filterOptions.orderTypes);

	//  loadFilterOptions();

	$scope.search = function(page) {

		$scope.filter.orderByKey = $scope.filterOptions.selectedOrderBy ? $scope.filterOptions.selectedOrderBy.key : null;
		$scope.filter.orderByKeyType = $scope.filterOptions.selectedOrderBy ? $scope.filterOptions.selectedOrderBy.type : null;
		$scope.filter.orderType = $scope.filterOptions.selectedOrderType.key;
		$scope.filter.searchBox = $scope.searchBox;
		$scope.filter.limit = rows;

		Previsions.getPrevisionsHistoric($rootScope.user.sellerCode, $scope.filter, (page-1) * rows).then(function(result) {
			$scope.previsions = result.data;

			if ($('#pagination').data("twbs-pagination") && ($scope.page == 1 || result.data[0].count <= rows)) {
				$('#pagination').twbsPagination('destroy');
				firstLoad = true;
			}

			if (result.data[0].count > rows) {
				$('#pagination').twbsPagination({
							totalPages: (result.data[0].count / rows) + 1,
							visiblePages: 7,
							startPage: 1,
							first: '<<',prev: '<',last: '>>',next: '>',
							onPageClick: function (event, page) {
								if (!firstLoad) {
									console.log('Page: '+page);
									$scope.search(page);
								} else {
									firstLoad = false;
								}
							}
					});
			}
		});
	}

	$scope.getValue = function(prevision, fieldName) {
		if (!prevision[fieldName]) {
			return '';
		}
		return prevision[fieldName];
	}

	// $scope.onSavePrevision = function(prevision) {
	// 	$scope.$broadcast('$$rebind::refreshColumnsValue');
	// 	$scope.$broadcast('$$rebind::refreshLinkValue');
	// }

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

	$scope.restoreToProduction = function(prevision) {
		prevision.deletedProductionOn = null;
		prevision.deletedProductionBy = $rootScope.user.name;

		Production.updateDate(prevision, 'deletedProductionOn').then(function() {
			$scope.previsions = $scope.previsions.filter(function(p) {
				return p.id != prevision.id;
			});
		});

		// Previsions.editField(prevision, 'deletedProductionBy');
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

	$scope.refreshHistoricsBySearchBox = function(value) {
		// console.log('Notified search box', value);
		if (value.length >= 4 || value == '') {
			$scope.searchBox = value;
			$scope.search(1);
		}
	}
	$rootScope.searchBoxChangedObservers.push($scope.refreshHistoricsBySearchBox);

	function translateOptions(options) {

		options.map(function(o) {
			$translate(o.name).then(function(value) {
				o.name = value;
			})
		});
	}
}]);
