'use strict';

angular.module('vsko.stock').controller('ProductionCtrl', ['$scope', '$rootScope', '$translate', '$timeout', 'Production', 'Previsions', 'Users', 'Rules', function ($scope, $rootScope, $translate, $timeout, Production, Previsions, Users, Rules) {

	$scope.start = Date.now();

	$scope.refreshBySearchBox = function(value) {
		// console.log('Notified search box', value);
		if (value.length >= 4 || value == '') {
			$scope.searchBox = value;
			$scope.search(1);
		}
	}
	$rootScope.searchBoxChangedObservers.push($scope.refreshBySearchBox);

	$scope.rows = 50;
	var firstLoad = true;

	var defaultFilters = {orderByKey: 'week', orderByKeyType: 'nr', orderType: 'order.ascending', limit: $scope.rows};

	Previsions.getPrevisionsForProduction($rootScope.user.sellerCode, defaultFilters, 0).then(function(result) {

		console.log('Results in ' + (Date.now() - $scope.start) + ' ms.'); //eslint-disable-line

		$scope.previsions = result.data;

		if (result.data[0] && result.data[0].count > $scope.rows) {
			$('#pagination').twbsPagination({
		        totalPages: (result.data[0].count / $scope.rows) + 1,
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

	$scope.columns = {seller: true, week: true, priority: true, dispatch: true, order: true, client: true, boat: true, sail: true, line: true, percentage: true, advance: true, deliveryDate: true
									 ,tentativeDate: true, productionDate: true, infoDate: true, advanceDate: true, cloths: true, state: true, area: true, productionObservations: true};

	// $scope.totalitems = 30;
	// $scope.currentPage = 1;

	// initial filter options
 	$scope.filter = {};
	$scope.filterOptions = {};
 	$scope.filterOptions.columns = [{name: 'Seller', key:'seller', type:'str', options: []}, {name: 'Week', key:'week', type:'nr', options: []}, {name: 'Priority', key:'priority', type:'nr', options: []}, {name: 'Dispatch', key:'d.number', column: 'dispatch', type:'nr', options: []},
													{name: 'Order', key:'p.orderNumber', column: 'orderNumber', type:'str', options: []}, {name: 'Client', key:'p.client', column: 'client', type:'str', options: []}, {name: 'Boat', key:'boat', type:'str', options: []}, {name: 'Sail', key:'sailName', type:'str', options: []}, {name: 'Line', key:'line', type:'str', options: []}, {name: '%', key:'percentage', type:'nr', options: []},
													{name: 'Advance', key:'advance', type:'nr', options: []}, {name: 'Delivery date', key:'p.deliveryDate', type:'date', options: []}, {name: 'Tentative date', key:'p.tentativeDate', type:'date', options: []}, {name: 'Production date', key:'p.productionDate', type:'date', options: []}, {name: 'Info date', key:'p.infoDate', type:'date', options: []},
													{name: 'Advance date', key:'p.advanceDate', type:'date', options: []}, {name: 'State', key:'state', type:'str', options: []}, {name: 'Area', key:'area', type:'nr', options: []}];

	$scope.filterOptions.orderTypes = [{name: 'Order ascending', key:'order.ascending'},
  													 				 {name: 'Order descending', key:'order.descending'}];
	$scope.filterOptions.selectedOrderBy = $scope.filterOptions.columns[1];
  $scope.filterOptions.selectedOrderType = $scope.filterOptions.orderTypes[0];

  translateOptions($scope.filterOptions.columns);
	translateOptions($scope.filterOptions.orderTypes);

	loadFilterOptions();

	$scope.getValue = function(prevision, fieldName) {
		if (!prevision[fieldName]) {
			return '';
		}
		return prevision[fieldName];
	}

	$scope.onSavePrevision = function(prevision) {
		// $scope.$broadcast('$$rebind::refreshColumnsValue');
		// $scope.$broadcast('$$rebind::refreshLinkValue');
		$timeout(function() {
			$scope.search(1);
		}, 500);
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

		var ignorePagination = $scope.filterOptions.showAll;

		$scope.filter.key = $scope.filterOptions.selectedFilter ? $scope.filterOptions.selectedFilter.key : null;
		$scope.filter.type = $scope.filterOptions.selectedFilter ? $scope.filterOptions.selectedFilter.type : null;
		$scope.filter.value = $scope.filterOptions.selectedFilterOption ? $scope.filterOptions.selectedFilterOption.value : null;
		$scope.filter.orderByKey = $scope.filterOptions.selectedOrderBy ? $scope.filterOptions.selectedOrderBy.key : null;
		$scope.filter.orderByKeyType = $scope.filterOptions.selectedOrderBy ? $scope.filterOptions.selectedOrderBy.type : null;
		$scope.filter.orderType = $scope.filterOptions.selectedOrderType.key;
		$scope.filter.searchBox = $scope.searchBox;
		if (!ignorePagination) {
			$scope.filter.limit = $scope.rows;
		} else {
			delete $scope.filter.limit;
		}

		$scope.start = Date.now();
		$scope.previsions = [];
		$scope.hideLoading = false;

		Previsions.getPrevisionsForProduction($rootScope.user.sellerCode, $scope.filter, ($scope.page-1) * $scope.rows).then(function(result) {

			console.log('Results in ' + (Date.now() - $scope.start) + ' ms.'); //eslint-disable-line

			if (result.data.length == 0) {
				$scope.hideLoading = true;
			}

			$scope.previsions = result.data;

			if ($('#pagination').data("twbs-pagination") && ($scope.page == 1 || result.data[0].count <= $scope.rows)) {
				$('#pagination').twbsPagination('destroy');
				firstLoad = true;
			}

			if (result.data[0] && result.data[0].count > $scope.rows && !ignorePagination) {
				$('#pagination').twbsPagination({
			        totalPages: (result.data[0].count / $scope.rows) + 1,
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
	};

	$scope.updateDate = function(entity, value, fieldName) {
		// console.log('Updated date ', fieldName, ' to:', value);
		Production.updateDate(entity, fieldName).then(function(result) {

			if (result.data.successful) {
				Rules.updatePrevisionPercentage(entity, true);
				if (entity.percentageChanged) {
					$scope.$broadcast('$$rebind::refreshColumnsValue');
					delete entity.percentageChanged;
				}

				Rules.updatePrevisionDeliveryDate(entity, true).then(function() {

					if (entity.deliveryDateChanged) {
						$scope.$broadcast('$$rebind::refreshColumnsValue');
						$scope.$broadcast('$$rebind::refreshLinkValue');
						delete entity.deliveryDateChanged;

						if ($scope.filterOptions.selectedOrderBy && $scope.filterOptions.selectedOrderBy.key == 'deliveryDate') {
							$scope.search(1);
						}
					}
				});
			} else {
				Utils.showMessage('notify.save_field_error', 'error');
			}
		});
	};

	$scope.changedPrevision = {
		numericField: function(entity, value, fieldName) {

			Production.updateField(entity, fieldName, true).then(function(result) {
				if (result.data.successful) {
					if (fieldName == 'week' && $scope.filterOptions.selectedOrderBy && $scope.filterOptions.selectedOrderBy.key == 'week') {
						// only research after inline edit number if it is the week and we have selected the order by week
						$scope.search(1);
					}
				} else {
					Utils.showMessage('notify.save_field_error', 'error');
				}
			});
		},

		field: function(entity, value, fieldName) {

			Production.updateField(entity, fieldName).then(function(result) {
				if (!result.data.successful) {
					Utils.showMessage('notify.save_field_error', 'error');
				}
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

	$scope.weekBackgroundColor = function(prevision) {
		var colorsByWeek = [{week: 1, color: '#ddee99'/*'#f2dbc4'*/}, {week: 2, color: '#ffff99'}, {week: 3, color: '#a3d3ac'}, {week: 4, color: '#ffdab9'}, {week: 5, color: '#ffee99'}];

		function getColor(week) {
			var filter = colorsByWeek.filter(function(c) {
				return c.week == week;
			});
			return filter.length > 0 ? filter[0].color : '';
		}

		return prevision.week ? getColor(prevision.week) : '';
	}

	function translateOptions(options) {

		options.map(function(o) {
			$translate(o.name).then(function(value) {
				o.name = value;
			})
		});
	}

	// do a search for production list without limit and group the results by key to set the list of options in each case
	function loadFilterOptions() {

		var start = Date.now();

		Previsions.getPrevisionsForProduction($rootScope.user.sellerCode, {}).then(function(result) {
			console.log('All results in ' + (Date.now() - start) + ' ms.'); //eslint-disable-line

			result.data.map(function(row) {
				var key;
				for (key in row) {
					$scope.filterOptions.columns.map(function(opt) {

						if ((opt.column == key || opt.key == key) && row[key] && !alreadyContains(opt.options, row[key])) {
							opt.options.push({value: row[key]});
						}
					});
				}
			});

			// sort all the generated options arrays
			$scope.filterOptions.columns.map(function(column) {
				column.options.sort(function(a, b) {

					if (column.type == 'nr') {
						return +a.value - +b.value;
					} else if (column.type == 'str') {
						if (a.value > b.value) {
							return 1;
						}
						if (a.value < b.value) {
							return -1;
						}
					  // a must be equal to b
					  return 0;
					} else if (column.type == 'date') {
						return moment(a.value, "DD-MM-YYYY").valueOf() - moment(b.value, "DD-MM-YYYY").valueOf();
					}
				});
				// console.log('Sorted', column.options);
			});

			// console.log('Final filter group', $scope.filterOptions.columns);

			function alreadyContains(options, value) {
				var found = false;
				options.map(function(opt) {
					if(opt.value == value) {
						found = true;
					}
				});

				return found;
			}
		});
	}
}]);
