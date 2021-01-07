'use strict';

angular.module('vsko.stock').controller('DesignCtrl', ['$scope', '$rootScope', '$translate', '$timeout', '$cookieStore', 'countries',
'Utils', 'Previsions', 'Rules', 'DriveAPI', 'Production', '$modal',
function ($scope, $rootScope, $translate, $timeout, $cookieStore, countries, Utils, Previsions, Rules, DriveAPI, Production, $modal) {

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

      storeColumnsSelectedState($scope.filterOptions.columns);

      // recreate float header
      $('table#production').floatThead('destroy');
      $('table#production').floatThead({
        position: 'fixed',
        autoReflow: true,
        zIndex: 20,
        floatTableClass: 'production-floatThead'
      });
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


  ///---------------------------------------------------------

  $scope.start = Date.now();

  // just init the drive api to ensure we have the v3 loaded (avoiding problems with v2 loaded by the google picker)
  $timeout(function() {   DriveAPI.init();  }, 2500);

  // column filters selections are stored here as eg. selectionObject.designWeek
  $scope.selectionObject = {};

  $scope.rows = 50;
  var firstLoad = true;

  var defaultFilters = {orderList: [], limit: $scope.rows, default: true};
	defaultFilters.orderList.push({key: 'designWeek', type: 'str', mode: 'order.ascending', mode2: 'order.ascending'});

  $scope.filter = {};
	$scope.filterOptions = {};
 	$scope.filterOptions.columns = [
    {name: 'Designer', key:'designer', type:'str', options: []}, {name: 'Week', key:'designWeek', type:'nr', options: []}, {name: 'Hours', key:'designHours', type:'nr', options: []}, {name: 'Week', key:'week', type:'nr', options: []}, {name: 'Seller', key:'seller', type:'str', options: []},
		{name: 'Order', key:'p.orderNumber', column: 'orderNumber', type:'str', options: []}, {name: 'Client', key:'p.client', column: 'client', type:'str', options: []},
    {name: 'Boat', key:'boat', type:'str', options: []}, {name: 'Sail', key:'sailName', column: 'sailName', type:'str', options: []}, {name: 'Line', key:'line', type:'str', options: []}, {name: '%', key:'percentage', type:'nr', options: []},
		{name: 'Cloths', key:'cloths', type:'arr', options: []}, {name: 'State', key:'state', type:'str', hideFromSeller: true, options: []},
    {name: 'Area', key:'area', type:'nr', hideFromSeller: true, options: []}, {name: 'Country', key:'p.country', column: 'country', type:'str', options: []}, {name: 'Only design', key:'designOnly', type:'str', options: []}];

	$scope.filterOptions.orderTypes = [{name: 'Order ascending', key:'order.ascending'},
  													 				 {name: 'Order descending', key:'order.descending'}];
  $scope.filterOptions.orderMode1 = 'order.ascending';
	$scope.filterOptions.orderMode2 = 'order.ascending';
	$scope.filterOptions.selectedOrderBy = $scope.filterOptions.columns[1];
  $scope.filterOptions.selectedOrderType = $scope.filterOptions.orderTypes[0];

  translateOptions($scope.filterOptions.columns);
  translateOptions($scope.filterOptions.orderTypes);

  loadColumnsSelectedState($scope.filterOptions.columns);

  // TODO adjust this to design
  loadFilterOptions();


  if (!$rootScope.forceNotLoad) { // very special case when after login it is forced to not load the initial list
    Previsions.getPrevisionsForDesign($rootScope.user.code, defaultFilters, 0).then(function(result) {

      console.log('Results in ' + (Date.now() - $scope.start) + ' ms.'); //eslint-disable-line

      $scope.origPrevisions = result.data.map(function(p) { return $.extend(true, {}, p); });
      $scope.previsions = result.data;

      $('table#production').floatThead({
        position: 'fixed',
        autoReflow: true,
        zIndex: 20,
        floatTableClass: 'production-floatThead'
      });

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

  //-------------------------------------------------------------------//

  $scope.designed = function(prevision) {

    Previsions.designed(prevision).then(function(result) {

      if (result.data.successful) {

        prevision.designed = true;

        Rules.updatePrevisionPercentage(prevision, true);

        $scope.previsions.remove(prevision);

        console.log('Designed: '+prevision.orderNumber);

        Utils.showMessage('notify.order_to_plotter');

        var clothsIds = prevision.cloths.map(function(c) { return c.clothId; }).join(',');

        Previsions.updatePrevisionState(clothsIds, prevision.id, 'designController').then(function() {
          Utils.showMessage('notify.previsions_state_updated');
        });
      } else {
        Utils.showMessage('notify.order_to_plotter_error', 'error');
      }
    });

    //prevision.designed = prevision.designed ? !prevision.designed : true;
  };

  $scope.editObservations = function(prevision) {

  	Previsions.editObservations(prevision, 'designObservations').then(function(result){
      $scope.$broadcast('$$rebind::refreshObservations');
	  });
  }


  $scope.search = function(page) {

    if (page) {
      $scope.page = page;
    }

    var ignorePagination = $scope.filterOptions.showAll;

    $scope.filter.orderList = [];
    if ($scope.filterOptions.selectedOrderBy) {
      $scope.filter.orderList.push({key: $scope.filterOptions.selectedOrderBy.key, type: $scope.filterOptions.selectedOrderBy.type, mode: $scope.filterOptions.orderMode1});
    }
    if ($scope.filterOptions.selectedOrderBy2) {
      $scope.filter.orderList.push({key: $scope.filterOptions.selectedOrderBy2.key, type: $scope.filterOptions.selectedOrderBy2.type, mode: $scope.filterOptions.orderMode2});
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

    Previsions.getPrevisionsForDesign($rootScope.user.code, $scope.filter, ($scope.page-1) * $scope.rows).then(function(result) {

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

  $scope.designerDisplayFn = function(designer, config) {
    if (config && config.verbose) {
      // console.log('Display designer:',designer,config.extra)
    }
    return designer ? designer : '';
  };

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
		},
    readOnlyProductionWeek: function(p) {
      return true;
    },
		weekUp: function() {
			var checkedPrevisions = getCheckedPrevisions();

			// if no orders selected will update all orders with week between 1 and 8
			Previsions.weekUp(checkedPrevisions, 'designWeek').then(function(result) {
				if (result.data.successful) {
					$scope.search(1);
				}
			});
		},
		weekDown: function() {
			var checkedPrevisions = getCheckedPrevisions();

			// if no orders selected will update all orders with week between 1 and 8
			Previsions.weekDown(checkedPrevisions, 'designWeek').then(function(result) {
				if (result.data.successful) {
					$scope.search(1);
				}
			});
		}
	};

  function getCheckedPrevisions() {
		var checkedPrevisions = [];

		angular.forEach($scope.previsions, function (prevision, index) {
			if ($('#'+prevision.id).is(':checked')) {
				checkedPrevisions.push(prevision.id);
			}
		});

		return checkedPrevisions;
	}

  $scope.getValue = function(prevision, fieldName, isBoolean) {

    var specialCases = {
      country: function(value) {
        if (value === countries.designOnly) {
          return '-';
        }
        return value;
      }
    }

    if (prevision[fieldName] === undefined) {
      return '';
    }

    if (isBoolean) {
      return getBooleanValue(prevision[fieldName])
    }
    return specialCases[fieldName] ? specialCases[fieldName](prevision[fieldName]) : prevision[fieldName];
  }

  function getBooleanValue(value) {
    return value ? $translate.instant('Yes') : 'No';
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

  $scope.refreshBySearchBox = function(value) {
    // console.log('Notified search box', value);
    if (value.length >= 4 || value == '') {
      $scope.searchBox = value;
      $scope.search(1);
    }
  }
  $rootScope.searchBoxChangedObservers.push($scope.refreshBySearchBox);

  $scope.searchByFilter = function(column) {

		// console.log('Filter selected', selection);

		// eg. [{key:, type:, value:}, ..]
		$scope.filter.list = generateFiltersList($scope.selectionObject[column], column);

		console.log('Generated filter list', $scope.filter.list);

		$scope.search(1);
	};

  $scope.changeSortOrder = function(position) {

		if (position === 1) {
			$scope.filterOptions.orderMode1 = $scope.filterOptions.orderMode1 == 'order.ascending' ? 'order.descending' : 'order.ascending';
		} else {
			$scope.filterOptions.orderMode2 = $scope.filterOptions.orderMode2 == 'order.ascending' ? 'order.descending' : 'order.ascending';
		}
		$scope.search(1);
	}

	$scope.headerBackgroundColor = function(selection) {
		return selection && selection.length  ? '#ff6666' : 'none';
	}

	$scope.clearFilters = function(selection) {

		$scope.filter.list = [];

		$scope.selectionObject = {};

		$scope.search(1);
	};

  $scope.changedPrevision = {
		numericField: function(entity, value, fieldName) {

			Production.updateField(entity, fieldName, true).then(function(result) {
				if (result.data.successful) {
					if (fieldName == 'designWeek' && $scope.filterOptions.selectedOrderBy && $scope.filterOptions.selectedOrderBy.key == 'designWeek') {
						// only research after inline edit number if it is the designWeek and we have selected the order by week
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
		},

    designerField: function(entity, selectedDesigner, fieldName) {
      // console.log('Changed designer to:', entity, selectedDesigner, fieldName)
      Production.updateField(entity, fieldName).then(function(result) {
				handleUpdateFieldResolve(result, entity, fieldName, 'updateField');
			}, function(err) {
				handleUpdateFieldReject(err, entity, fieldName, 'updateField');
			});
    }
	};


  // Utils
  function translateOptions(options) {

		options.map(function(o) {
			$translate(o.name).then(function(value) {
				o.name = value;
			})
		});
	}

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

	// get from cookies the last state of the columns visibility saved by the user and update the list
	function loadColumnsSelectedState(columns) {

		var state = $cookieStore.get('columnsState.design');

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

	function storeColumnsSelectedState(columns) {
		$cookieStore.put('columnsState.design', columns.map(function(c) {
			return {column: c.column ? c.column : c.key, selected: c.selected};
		}));
	}

  // do a search for production list without limit and group the results by key to set the list of options in each case
	function loadFilterOptions() {

		var start = Date.now();

		Previsions.getPrevisionsForDesign($rootScope.user.code, {}).then(function(result) {
			console.log('All results in ' + (Date.now() - start) + ' ms.'); //eslint-disable-line

      var specialTranslation = {
        country: function(value) {
          return value === countries.designOnly ? $translate.instant('Only design') : value;
        }
      };

			$scope.allDesign = result.data;

			result.data.map(function(row) {
				var key;
				for (key in row) {
					$scope.filterOptions.columns.map(function(opt) {

						[].concat(row[key]).map(function(value) { // posibble row[key] is an array of values (eg. cloths)

							if ((opt.column == key || opt.key == key) && row[key] && !alreadyContains(opt.options, value.name ? value.name : value)) {

                value = value.name ? value.name : value;

								opt.options.push({
                  value: value,
                  name: specialTranslation[key] ? specialTranslation[key](value) : value,
                  column: opt.column ? opt.column : opt.key});
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

    // designers to show depends on the user country
    Production.getDesigners().then(function(result) {
      $scope.listDesigners = result.data.map(function(d) {
        return d.name;
      });
    });
	}

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

}]);
