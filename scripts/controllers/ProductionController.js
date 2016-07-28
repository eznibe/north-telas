'use strict';

angular.module('vsko.stock').controller('ProductionCtrl', ['$scope', '$rootScope', '$translate', 'Production', 'Previsions', 'Users', 'Rules', function ($scope, $rootScope, $translate, Production, Previsions, Users, Rules) {

	$scope.start = Date.now();

	var rows = 50;
	var firstLoad = true;

	Previsions.getPrevisionsForProduction($rootScope.user.sellerCode, {orderByKey: 'week', orderByKeyType: 'nr', orderType: 'order.ascending'}, 1).then(function(result) {

		console.log('Results in ' + (Date.now() - $scope.start) + ' ms.'); //eslint-disable-line

		$scope.previsions = result.data;

		if (result.data[0].count > rows) {
			$('#pagination').twbsPagination({
		        totalPages: (result.data[0].count / rows) + 1,
		        visiblePages: 7,
						startPage: 1,
						first: '<<',
						prev: '<',
						last: '>>',
						next: '>',
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

	$scope.columns = {seller: true, week: true, priority: true, dispatch: true, order: true, client: true, boat: true, sail: true, line: true, percentage: true, advance: true, deliveryDate: true
									 ,tentativeDate: true, productionDate: true, infoDate: true, advanceDate: true, cloths: true, state: true, area: true, productionObservations: true};

	// $scope.totalitems = 30;
	// $scope.currentPage = 1;

	 // initial filter options
 	$scope.filter = {};
	$scope.filterOptions = {};
 	$scope.filterOptions.columns = [{name: 'Seller', key:'seller', type:'str'}, {name: 'Week', key:'week', type:'nr'}, {name: 'Priority', key:'priority', type:'nr'}, {name: 'Dispatch', key:'d.number', type:'str'},
													{name: 'Order', key:'p.orderNumber', type:'str'}, {name: 'Client', key:'p.client', type:'str'}, {name: 'Boat', key:'boat', type:'str'}, {name: 'Sail', key:'sailName', type:'str'}, {name: 'Line', key:'line', type:'str'}, {name: '%', key:'percentage', type:'nr'},
													{name: 'Advance', key:'advance', type:'nr'}, {name: 'Delivery date', key:'deliveryDate', type:'date'}, {name: 'Tentative date', key:'tentativeDate', type:'date'}, {name: 'Production date', key:'productionDate', type:'date'}, {name: 'Info date', key:'infoDate', type:'date'},
													{name: 'Advance date', key:'advanceDate', type:'date'}, {name: 'State', key:'state', type:'str'}, {name: 'Area', key:'area', type:'nr'}];

	$scope.filterOptions.orderTypes = [{name: 'Order ascending', key:'order.ascending'},
  													 				 {name: 'Order descending', key:'order.descending'}];
	$scope.filterOptions.selectedOrderBy = $scope.filterOptions.columns[1];
  $scope.filterOptions.selectedOrderType = $scope.filterOptions.orderTypes[0];

  translateOptions($scope.filterOptions.columns);
	translateOptions($scope.filterOptions.orderTypes);


	$scope.getValue = function(prevision, fieldName) {
		if (!prevision[fieldName]) {
			return '';
		}
		return prevision[fieldName];
	}

	$scope.onSavePrevision = function(prevision) {
		// $scope.$broadcast('$$rebind::refreshColumnsValue');
		// $scope.$broadcast('$$rebind::refreshLinkValue');
		$scope.search(1);
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

	$scope.search = function(page) {

		if (page) {
			$scope.page = page;
		}

		$scope.filter.key = $scope.filterOptions.selectedFilter ? $scope.filterOptions.selectedFilter.key : null;
		$scope.filter.type = $scope.filterOptions.selectedFilter ? $scope.filterOptions.selectedFilter.type : null;
		$scope.filter.value = $scope.filter.value ? $scope.filter.value : null;
		$scope.filter.orderByKey = $scope.filterOptions.selectedOrderBy ? $scope.filterOptions.selectedOrderBy.key : null;
		$scope.filter.orderByKeyType = $scope.filterOptions.selectedOrderBy ? $scope.filterOptions.selectedOrderBy.type : null;
		$scope.filter.orderType = $scope.filterOptions.selectedOrderType.key;

		$scope.start = Date.now();
		$scope.previsions = [];
		$scope.hideLoading = false;

		Previsions.getPrevisionsForProduction($rootScope.user.sellerCode, $scope.filter, $scope.page).then(function(result) {

			console.log('Results in ' + (Date.now() - $scope.start) + ' ms.'); //eslint-disable-line

			$scope.previsions = result.data;

			if(($scope.page == 1 && $('#pagination').data("twbs-pagination")) || result.data[0].count <= rows){
				$('#pagination').twbsPagination('destroy');
				firstLoad = true;
			}

			if (result.data[0].count > rows) {
				$('#pagination').twbsPagination({
			        totalPages: (result.data[0].count / rows) + 1,
			        visiblePages: 7,
							startPage: 1,
							first: '<<',
							prev: '<',
							last: '>>',
							next: '>',
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

			Rules.updatePrevisionDeliveryDate(entity, true).then(function() {

				if (entity.deliveryDateChanged) {
					$scope.$broadcast('$$rebind::refreshColumnsValue');
					delete entity.deliveryDateChanged;
				}
			});
		});
	};

	$scope.changedPrevision = {
		numericField: function(entity, value, fieldName) {

			Production.updateField(entity, fieldName, true).then(function() {
				if (fieldName == 'week' && $scope.filterOptions.selectedOrderBy && $scope.filterOptions.selectedOrderBy.key == 'week') {
					// only research after inline edit number if it is the week and we have selected the order by week
					$scope.search(1);
				}
			});
		},

		field: function(entity, value, fieldName) {

			Production.updateField(entity, fieldName).then(function() {
			});
		}
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

	function translateOptions(options) {

		options.map(function(o) {
			$translate(o.name).then(function(value) {
				o.name = value;
			})
		});
	}
}]);
