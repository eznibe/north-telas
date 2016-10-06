'use strict';

angular.module('vsko.stock').controller('ProductionCtrl', ['$scope', '$rootScope', '$translate', '$timeout', '$cookieStore', 'Production', 'Previsions', 'Users', 'Rules', 'Files', 'DriveAPI', 'Utils', function ($scope, $rootScope, $translate, $timeout, $cookieStore, Production, Previsions, Users, Rules, Files, DriveAPI, Utils) {

	$scope.start = Date.now();

	$scope.refreshBySearchBox = function(value) {
		// console.log('Notified search box', value);
		if (value.length >= 4 || value == '') {
			$scope.searchBox = value;
			$scope.search(1);
		}
	}
	$rootScope.searchBoxChangedObservers.push($scope.refreshBySearchBox);

	// just init the drive api to ensure we have the v3 loaded (avoiding problems with v2 loaded by the google picker)
	$timeout(function() {
		DriveAPI.init();
	}, 2500);

	// column filters selections are stored here as eg. selectionObject.week
	$scope.selectionObject = {};

	$scope.rows = 50;
	var firstLoad = true;

	var defaultFilters = {orderList: [], limit: $scope.rows, default: true};
	defaultFilters.orderList.push({key: 'week', type: 'str', mode: 'order.ascending'});

	if (!$rootScope.forceNotLoad) { // very special case when after login it is forced to not load the initial list
		Previsions.getPrevisionsForProduction($rootScope.user.sellerCode, defaultFilters, 0).then(function(result) {

			console.log('Results in ' + (Date.now() - $scope.start) + ' ms.'); //eslint-disable-line

			$scope.origPrevisions = result.data.map(function(p) { return $.extend(true, {}, p); });
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
	}

	$scope.visibility = {

		toggleColumn: function(column) {
			$('.'+column).toggle();
		},

		showColumn: function(column) {
			$('.'+column).show();
			$('.'+column).removeClass('ng-hide');
		},
		hideColumn: function(column) {
			$('.'+column).hide();
		},

		isSeller: function() {
			return $rootScope.user.role == 'vendedor';
		},

		clickColumnSelector: function(c) {
			if (c.selected) {
				$scope.visibility.showColumn(c.column ? c.column : c.key);
			} else {
				$scope.visibility.hideColumn(c.column ? c.column : c.key);
			}

			$scope.storeColumnsSelectedState($scope.filterOptions.columns);
		},

		selected: function(column) {
			var res = $scope.filterOptions.columns.filter(function(c) {
				return c.column == column || c.key == column;
			});
			return res.length > 0 ? res[0].selected : true;
		},

		errorStyle: function(prevision, fieldName) {
			if (!prevision.errorFields) {
				return {'background-color': 'inherit'};
			}
			var style = prevision.errorFields.indexOf(fieldName) != -1 ? {'background-color': 'red'} : {'background-color': 'inherit'};
			return style;
		}
	};

	// $scope.columns = {seller: true, week: true, priority: true, dispatch: true, order: true, client: true, boat: true, sail: true, line: true, percentage: true, advance: true, deliveryDate: true
	// 								 ,tentativeDate: true, productionDate: true, infoDate: true, advanceDate: true, cloths: true, state: true, area: true, productionObservations: true};

	// $scope.totalitems = 30;
	// $scope.currentPage = 1;

	// initial filter options
 	$scope.filter = {};
	$scope.filterOptions = {};
 	$scope.filterOptions.columns = [{name: 'Seller', key:'seller', type:'str', options: []}, {name: 'Week', key:'week', type:'nr', options: []}, {name: 'Priority', key:'priority', type:'nr', hideFromSeller: true, options: []}, {name: 'Dispatch', key:'d.number', column: 'dispatch', type:'nr', options: []},
													{name: 'Order', key:'p.orderNumber', column: 'orderNumber', type:'str', options: []}, {name: 'Client', key:'p.client', column: 'client', type:'str', options: []}, {name: 'Boat', key:'boat', type:'str', options: []}, {name: 'Sail', key:'sailName', column: 'sailName', type:'str', options: []}, {name: 'Line', key:'line', type:'str', options: []}, {name: '%', key:'percentage', type:'nr', options: []},
													{name: 'Advance', key:'advance', type:'nr', options: []}, {name: 'Delivery date', key:'p.deliveryDate', column: 'deliveryDate', type:'date', options: []}, {name: 'Tentative date', key:'p.tentativeDate', column: 'tentativeDate', type:'date', options: []}, {name: 'Production date', key:'p.productionDate', column: 'productionDate', type:'date', hideFromSeller: true, options: []}, {name: 'Info date', key:'p.infoDate', column: 'infoDate', type:'date', options: []},
													{name: 'Advance date', key:'p.advanceDate', column: 'advanceDate', type:'date', options: []}, {name: 'Cloths', key:'cloths', type:'arr', options: []}, {name: 'State', key:'state', type:'str', hideFromSeller: true, options: []}, {name: 'Area', key:'area', type:'nr', hideFromSeller: true, options: []}];

	$scope.filterOptions.orderTypes = [{name: 'Order ascending', key:'order.ascending'},
  													 				 {name: 'Order descending', key:'order.descending'}];
  $scope.filterOptions.orderMode = 'order.ascending';
	$scope.filterOptions.selectedOrderBy = $scope.filterOptions.columns[1];
  $scope.filterOptions.selectedOrderType = $scope.filterOptions.orderTypes[0];

  translateOptions($scope.filterOptions.columns);
	translateOptions($scope.filterOptions.orderTypes);

	loadColumnsSelectedState($scope.filterOptions.columns);

	loadFilterOptions();

	$scope.getValue = function(prevision, fieldName) {
		if (!prevision[fieldName]) {
			return '';
		}
		return prevision[fieldName];
	}

	$scope.getOptions = function(column) {
		var res = $scope.filterOptions.columns.filter(function(c) {
			return c.column == column || c.key == column;
		});
		return res.length > 0 && res[0].options.length > 0 ? res[0].options : undefined;
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
		togglePopupList: function(id) {
			$('#'+id).toggle();
		},
		acceptStateChange: function(prevision) {
			Previsions.acceptStateChange(prevision).then(function() {
				$.notify("Cambio de estado aceptado.", {className: "success", globalPosition: "bottom right"});
				prevision.stateAccepted = true;
				$scope.$broadcast('$$rebind::refreshStateValue');
			});
		},
		stateStyle: function(p) {
			return {'background-color': (p.stateAccepted=='0' ? 'orange' : '')};
		},
		readOnlyPercentage: function(p) {
			return p.percentage < 25 && $rootScope.user.role != 'admin';
		}
	}

	$scope.search = function(page) {

		if (page) {
			$scope.page = page;
		}

		var ignorePagination = $scope.filterOptions.showAll;

		$scope.filter.orderList = [];
		if ($scope.filterOptions.selectedOrderBy) {
			$scope.filter.orderList.push({key: $scope.filterOptions.selectedOrderBy.key, type: $scope.filterOptions.selectedOrderBy.type, mode: $scope.filterOptions.orderMode});
		}
		if ($scope.filterOptions.selectedOrderBy2) {
			$scope.filter.orderList.push({key: $scope.filterOptions.selectedOrderBy2.key, type: $scope.filterOptions.selectedOrderBy2.type, mode: $scope.filterOptions.orderMode});
		}

		$scope.filter.searchBox = $scope.searchBox;
		if (!ignorePagination) {
			$scope.filter.limit = $scope.rows;
		} else {
			delete $scope.filter.limit;
		}

		$scope.start = Date.now();
		delete $scope.previsions;// = null;
		$scope.hideLoading = false;

		Previsions.getPrevisionsForProduction($rootScope.user.sellerCode, $scope.filter, ($scope.page-1) * $scope.rows).then(function(result) {

			console.log('Results in ' + (Date.now() - $scope.start) + ' ms.'); //eslint-disable-line

			if (result.data.length == 0) {
				$scope.hideLoading = true;
			}

			$scope.origPrevisions = result.data.map(function(p) { return $.extend(true, {}, p); });
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

	$scope.searchByFilter = function(column) {

		// console.log('Filter selected', selection);

		// eg. [{key:, type:, value:}, ..]
		$scope.filter.list = generateFiltersList($scope.selectionObject[column], column);

		console.log('Generated filter list', $scope.filter.list);

		$scope.search(1);
	};

	$scope.logSelection = function(column) {
		console.log($scope.selectionObject[column]);
	}

	$scope.headerBackgroundColor = function(selection) {
		return selection && selection.length  ? '#ff6666' : 'none';
	}

	$scope.clearFilters = function(selection) {

		$scope.filter.list = [];

		$scope.selectionObject = {};

		$scope.search(1);
	};

	// generate the list of selected filters to be used as payload in the request to the search api
	function generateFiltersList(selections, column) {

		var filters = $scope.filter.list ? $scope.filter.list : [];

		// always reset current filter for column first
		filters = filters.filter(function(item) {
			return (item.key != column && item.column != column);// || (selection && item.key != selection.column && item.column != selection.column);
		});

		if (selections && selections.length) {
			// selected column filter -> add to the filter list
			$scope.filterOptions.columns.map(function(col) {
				// selection multiple allowed -> it's an array
				selections.map(function(selection) {

					if (selection.value != '-' && (col.key == selection.column || col.column == selection.column)) {

						var filterWithSameKey = filters.filter(function(item) {
							return item.key == col.key;
						});

						if (filterWithSameKey.length) {
							filterWithSameKey[0].values = filterWithSameKey[0].values.concat(selection.value);
						} else {
							filters.push({key: col.key, type: col.type, column: selection.column, values: [selection.value]});
						}
					}
				});
			});
		}

		return filters;
	}

	$scope.updateDate = function(entity, value, fieldName) {
		// console.log('Updated date ', fieldName, ' to:', value);
		Production.updateDate(entity, fieldName).then(function(result) {

			if (result.data.successful) {

				if (entity.percentageChanged) {
					$scope.$broadcast('$$rebind::refreshColumnsValue');
					delete entity.percentageChanged;
				}

				Rules.updatePrevisionPercentage(entity, true);

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
			}
			handleUpdateFieldResolve(result, entity, fieldName, 'updateDate');
		}, function(err) {
			handleUpdateFieldReject(err, entity, fieldName, 'updateDate');
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
				}
				handleUpdateFieldResolve(result, entity, fieldName, 'updateNumericField');

			}, function(err) {
				handleUpdateFieldReject(err, entity, fieldName, 'updateNumericField');
			});
		},

		field: function(entity, value, fieldName) {

			Production.updateField(entity, fieldName).then(function(result) {
				handleUpdateFieldResolve(result, entity, fieldName, 'updateField');
			}, function(err) {
				handleUpdateFieldReject(err, entity, fieldName, 'updateField');
			});
		}
	};

	function handleUpdateFieldResolve(result, entity, fieldName, method) {

		if (result.data.successful) {
			Utils.showMessage('notify.saved_field');
			removeErrorField(entity, fieldName);
		} else {
			Utils.showIntrusiveMessage('notify.save_field_error', 'error');

			Utils.logUIError('errorUI.'+method+'('+fieldName+')', result.data);
			putBackOriginalValue(entity, fieldName);
		}
	}

	function handleUpdateFieldReject(err, entity, fieldName, method) {
		Utils.showIntrusiveMessage('notify.save_field_error', 'error');
		Utils.logUIError('error.rejected.'+method+'('+fieldName+')', {error: err, entity: entity});
		putBackOriginalValue(entity, fieldName);
	}

	//------------------------------

	$scope.removeFromProduction = function(prevision) {
		prevision.deletedProductionOn = prevision.date; //moment().format('DD-MM-YYYY');
		prevision.deletedProductionBy = $rootScope.user.name;

		Production.updateDate(prevision, 'deletedProductionOn').then(function(result) {
			$scope.previsions = $scope.previsions.filter(function(p) {
				return p.id != prevision.id;
			});
		});

		Previsions.editField(prevision, 'deletedProductionBy');
	};



	$scope.clearFilterOption = function() {
	};

	$scope.changeSortOrder = function() {

		$scope.filterOptions.orderMode = $scope.filterOptions.orderMode == 'order.ascending' ? 'order.descending' : 'order.ascending';
		$scope.search(1);
	}

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
		var colorsByWeek = [{week: 1, color: '#ddee99'}, {week: 2, color: '#ffff99'}, {week: 3, color: '#a3d3ac'}, {week: 4, color: '#ffdab9'}, {week: 5, color: '#ffee99'},
											  {week: 6, color: '#aaee99'}, {week: 7, color: '#849FE8'}, {week: 8, color: '#A9B67E'}, {week: 18, color: '#7AEEB6'},
											 	{week: 90, color: '#7AEEB6'}, {week: 98, color: '#BCBCDB'}, {week: 99, color: '#bbaa11'}];

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

	// get from cookies the last state of the columns visibility saved by the user and update the list
	function loadColumnsSelectedState(columns) {

		var state = $cookieStore.get('columnsState');

		columns.map(function(c) {
			var res = state ? state.filter(function(s) {
				return s.column == c.column || s.column == c.key;
			}) : [];
			c.selected = res.length > 0 ? res[0].selected : true;
			if (!c.selected) {
				$scope.visibility.toggleColumn(c.column ? c.column : c.key);
			}
		});
	}

	$scope.storeColumnsSelectedState = function(columns) {
		$cookieStore.put('columnsState', columns.map(function(c) {
			return {column: c.column ? c.column : c.key, selected: c.selected};
		}));
	};

	// revert the change in the given prevision field using the original loaded previsions array
	function putBackOriginalValue(prevision, fieldName) {

		$scope.origPrevisions.map(function(origPrevision) {

			if (origPrevision.id === prevision.id) {
				prevision[fieldName] = origPrevision[fieldName];
				prevision.errorFields = prevision.errorFields ? prevision.errorFields.concat(fieldName) : [fieldName];

				$scope.$broadcast('$$rebind::refreshLinkValue');
				$scope.$broadcast('$$rebind::refreshErrorBackground');
			}
		});
	}

	function removeErrorField(prevision, fieldName) {
		if (!prevision.errorFields) {
			return;
		}
		prevision.errorFields = prevision.errorFields.filter(function(f) {
			return f != fieldName;
		});
		$scope.$broadcast('$$rebind::refreshErrorBackground');
	}

	// do a search for production list without limit and group the results by key to set the list of options in each case
	function loadFilterOptions() {

		var start = Date.now();

		Previsions.getPrevisionsForProduction($rootScope.user.sellerCode, {}).then(function(result) {
			console.log('All results in ' + (Date.now() - start) + ' ms.'); //eslint-disable-line

			$scope.allProduction = result.data;

			result.data.map(function(row) {
				var key;
				for (key in row) {
					$scope.filterOptions.columns.map(function(opt) {

						[].concat(row[key]).map(function(value) { // posibble row[key] is an array of values (eg. cloths)

							if ((opt.column == key || opt.key == key) && row[key] && !alreadyContains(opt.options, value.name ? value.name : value)) {

								opt.options.push({value: value.name ? value.name : value, column: opt.column ? opt.column : opt.key});
							}
						});
					});
				}
			});

			// sort all the generated options arrays
			$scope.filterOptions.columns.map(function(column) {
				column.options.sort(function(a, b) {

					if (column.type == 'nr') {
						return +a.value - +b.value;
					} else if (column.type == 'str' || column.type == 'arr') {
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
