'use strict';

angular.module("vsko.stock", [
	    'ngRoute',
	    'ngCookies',
        'mgcrea.ngStrap.modal',
        'pascalprecht.translate',
        'uuid4',
        'toaster',
        'angular-loading-bar',
				'angucomplete-alt',
				'anguFixedHeaderTable'
    ])
    .run(['$cookieStore', '$rootScope', '$translate', function ($cookieStore, $rootScope, $translate) {
    	console.log('vsko.stock run');

    	var user = $cookieStore.get('user');
    	$rootScope.user = user ? user : {};

			var lang = $cookieStore.get('lang');
			if (lang) {
	    	$translate.use(lang);
			}

	}])
	.factory('Authorization', ['$rootScope', function($rootScope) {
	    var authorization = {
	        request: function(config) {

	            if(!$rootScope.user.name && config.url.indexOf('php') == -1 && config.url.indexOf('json') == -1) {
	            	// check evey request, if not logged in -> redirect to login page
		            config.url = 'views/login.html';
	            }

	            return config;
	        }
	    };
	    return authorization;
	}])
	.factory('PageAccess', ['$rootScope', '$injector', 'userRoles', 'accessLevels', '$location', function($rootScope, $injector, userRoles, accessLevels, $location) {
	    var pageAccess = {
	        response: function(response) {

	        	var $route = $injector.get('$route'); // use $injector to avoid problem with circular dependencies $http and $route
	        	var pageAccess = $route.current.$$route.access;
						var pageRestrictedFor = $route.current.$$route.restricted ? $route.current.$$route.restricted.split(',') : [];

	        	// detect if the page in the response is valid for the current user (avoid problems with bookmarks not valid for current logged user)
	        	/*if(	 accessLevels[pageAccess] != accessLevels.public && $rootScope.user.role &&
	        	     !(userRoles[$rootScope.user.role][0] & accessLevels[pageAccess]) && // eg. 100 (4/admin) & 110 (6/design) = true*/
						if(pageRestrictedFor.lastIndexOf($rootScope.user.role)!=-1 &&
	        		   $rootScope.user.name) {

	        		$location.path('/accessdenied');
	        	}

	            return response;
	        }
	    };
	    return pageAccess;
	}])
	.factory('ClearSearchBox', ['$rootScope', function($rootScope) {
	    var authorization = {
	        request: function(config) {

	        	// clear search box only if requesting new html (change view)
	            if(config.url.indexOf('.html') != -1 && config.url.indexOf('/modal') == -1) {
		            $rootScope.searchBox = "";
	            }

	            return config;
	        }
	    };
	    return authorization;
	}])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $httpProvider.interceptors.push('Authorization');
        $httpProvider.interceptors.push('PageAccess');
        $httpProvider.interceptors.push('ClearSearchBox');
    }
    ])
		.config(['$httpProvider', function ($httpProvider) {
			//initialize get if not there
			if (!$httpProvider.defaults.headers.get) {
					$httpProvider.defaults.headers.get = {};
			}

			//disable IE ajax request caching
			$httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
			// extra
			$httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
			$httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    }
    ])
    .config(['$routeProvider', '$locationProvider', '$translateProvider', function ($routeProvider, $locationProvider, $translateProvider) {

        $routeProvider
	        .when('/login', {
	            templateUrl: 'views/login.html',
	            access: 'public'
	        })
            .when('/groups', {
                templateUrl: 'views/groups.html',
                controller: 'GroupsCtrl',
                access: 'public'
            })
            .when('/groups/:groupId', {
                templateUrl: 'views/cloths.html',
                controller: 'ClothsCtrl',
                access: 'public'
            })
            .when('/cloths', {
                templateUrl: 'views/cloths.html',
                controller: 'ClothsCtrl',
                access: 'public'
            })
            .when('/previsions', {
                templateUrl: 'views/previsions.html',
                controller: 'PrevisionsCtrl',
                restricted: 'plotter'
            })
            .when('/design', {
                templateUrl: 'views/design.html',
                controller: 'DesignCtrl',
                restricted: 'plotter'
            })
            .when('/plotter', {
                templateUrl: 'views/plotter.html',
                controller: 'PlotterCtrl',
                access: 'public'
            })
            .when('/orders/:type', {
                templateUrl: 'views/orders.html',
                controller: 'OrdersCtrl',
                restricted: 'plotter'
            })
            .when('/users', {
                templateUrl: 'views/users.html',
                controller: 'UsersCtrl',
                access: 'admin'
            })
            .when('/users/:userId', {
                templateUrl: 'views/user.html',
                controller: 'UserCtrl',
                access: 'admin'
            })
            .when('/providers', {
                templateUrl: 'views/providers.html',
                controller: 'ProvidersCtrl',
                access: 'admin'
            })
            .when('/onedesign', {
                templateUrl: 'views/onedesign.html',
                controller: 'OnedesignCtrl',
                access: 'velas-od'
            })
            .when('/dolar', {
                templateUrl: 'views/dolar.html',
                controller: 'DolarCtrl',
                access: 'admin'
            })
            .when('/lists/oldPrevisions', {
                templateUrl: 'views/lists/oldPrevisions.html',
                controller: 'OldPrevisionsCtrl',
                access: 'public'
            })
            .when('/lists/underStock', {
                templateUrl: 'views/lists/underStock.html',
                controller: 'UnderStockCtrl',
                access: 'public'
            })
            .when('/lists/betweenDates', {
                templateUrl: 'views/lists/betweenDates.html',
                controller: 'BetweenDatesCtrl',
                access: 'public'
            })
            .when('/lists/rolls', {
                templateUrl: 'views/lists/rolls.html',
                controller: 'RollsCtrl',
                access: 'public'
            })
            .when('/lists/clothsStock', {
                templateUrl: 'views/lists/clothsStock.html',
                controller: 'ClothsStockCtrl',
                access: 'public'
            })
						.when('/lists/clothsPrice', {
                templateUrl: 'views/lists/clothsPrice.html',
                controller: 'ClothsPriceCtrl',
                restricted: 'plotter'
            })
						.when('/lists/clothsValuedStock', {
                templateUrl: 'views/lists/clothsValuedStock.html',
                controller: 'ClothsValuedStockCtrl',
                access: 'public'
            })
            .when('/accessdenied', {
                templateUrl: 'views/accessdenied.html',
                access: 'public'
            })
            .when('/query', {
                templateUrl: 'views/query.html',
                controller: 'QueryCtrl',
                access: 'admin'
            })
            .otherwise({
                redirectTo: '/groups'
            });



        $locationProvider.html5Mode(false);

        // translations
        var getLocale = function () {
          var nav = window.navigator;
          return ((nav.language || nav.browserLanguage || nav.systemLanguage || nav.userLanguage) || '').split('-').join('_');
        };

        $translateProvider
          .useStaticFilesLoader({
            prefix: 'translations/',
            suffix: '.json'
          })
          .determinePreferredLanguage(function () {
            var locale = getLocale();
            if (locale.toLowerCase().substring(0, 2) === 'pt') {
            	return 'port';
            }
            else if (locale.toLowerCase().substring(0, 2) === 'es') {
            	return 'spanish';
            }

//            return 'english';
            return 'spanish';
          })
          .fallbackLanguage('english');
    }])

'use strict';

angular.module('vsko.stock')

.constant('userRoles', {
	admin: [4, '/groups'], // 100
	ordenes: [2, '/previsions'], // 010
	plotter: [1, '/plotter'], // 001
	'velas-od': [1, '/groups'], // 001
	'read-only': [1, '/groups'] // 001
})

.constant('accessLevels', {
	admin: 4, // 100
	design: 6, // 110
	plotter: 5, // 101
	user: 7, // 111
	public: 7 // 111
})

.constant('orderStatus', {
	to_buy: 'TO_BUY',
	to_confirm: 'TO_CONFIRM',
	in_transit: 'IN_TRANSIT',
	finished: 'FINISHED',
	deleted: 'DELETED'
});

'use strict';
	
angular.module('vsko.stock').controller('AuthorizationCtrl', ['$scope', '$rootScope', '$cookieStore', '$location', '$route', 'Users', 'userRoles', 
                                                             function ($scope, $rootScope, $cookieStore, $location, $route, Users, userRoles) {

		$scope.login = function(user, passw) {
			
			Users.login(user, passw).then(function(response){
				
				if(response.data.successful) {
					
					$rootScope.user.name = user;
					$rootScope.user.password = "";
					$rootScope.user.role = response.data.role;
					
					// store in cookie to have access after a f5 reload
					$cookieStore.put('user', $rootScope.user);
					
					if($location.path() != '/login') {
						// reload the same view the user tried to enter
						$route.reload();
					}
					else {
						// come from login -> redirect to the default page for the user role
						$location.path(userRoles[$rootScope.user.role][1]);
					}
					
					$rootScope.login_error = false;
				}
				else {
					$rootScope.login_error = true;
				}
			});
		};
		
		$scope.logout = function() {
			
			$rootScope.user = {};
			
			$cookieStore.remove('user');
		};
        
}]);


'use strict';

angular.module('vsko.stock').controller('ClothsCtrl', ['$scope', '$routeParams', 'Stock', '$modal', function ($scope, $routeParams, Stock, $modal) {

        // initial list of cloth groups
        if($routeParams.groupId) {
        	$scope.groupId = Number($routeParams.groupId);
        	
        	Stock.getGroup($scope.groupId, 'FULL').then(function(result) {
        		$scope.group = result.data;
        		$scope.cloths = $scope.group.cloths;
        	});
        }
        else {
        	Stock.getAllCloths().then(function(result) {
        		$scope.cloths = result.data;
        	});
        }

        
        $scope.sumStock = function(providers) {
        	
        	var sum = 0;
        	
        	$.each(providers, function(idx, p){
        		sum += new Number(p.stock);
        	});
        	
        	return sum; 
        };
        
        $scope.sumPrevision = function(cloth) {
        	
        	var sum = 0;
        	
        	$.each(cloth.previsions, function(idx, p){
        		
        		$.each(p.cloths, function(idx2, c){
        			
        			if(c.clothId == cloth.id)
        				sum += new Number(c.mts);
        		});
        	});
        	
        	return sum; 
        };
        
        $scope.sumPending = function(cloth) {
        	
        	var sum = 0;
        	
        	$.each(cloth.plotters, function(idx, p){
        		sum += new Number(p.mtsDesign);
        	});
        	
        	return sum; 
        };
        
        $scope.sumDjai = function(cloth) {
        	return sumDjai(cloth);
        };
}]);


'use strict';

angular.module('vsko.stock').controller('DesignCtrl', ['$scope', 'Utils', 'Previsions', '$modal', function ($scope, Utils, Previsions, $modal) {

        // initial list of previsions
        Previsions.getAll(false).then(function(result) {
        	$scope.previsions = result.data;
        });

        $scope.designed = function(prevision) {

        	Previsions.designed(prevision).then(function(result) {
            	$scope.previsions.remove(prevision);

            	console.log('Designed: '+prevision.orderNumber);

              Utils.showMessage('notify.order_to_plotter');

              var clothsIds = prevision.cloths.map(function(c) { return c.clothId; }).join(',');

              Previsions.updatePrevisionState(clothsIds).then(function() {
                Utils.showMessage('notify.previsions_state_updated');
  						});
            });

        	//prevision.designed = prevision.designed ? !prevision.designed : true;
        };

        $scope.editObservations = function(prevision) {

        	Previsions.editObservations(prevision).then(function(result){

        	   console.log('Observation changed to: '+prevision.observations);
    		  });
        }
}]);

'use strict';

angular.module('vsko.stock').controller('DolarCtrl', ['$scope', '$translate', '$cookieStore', 'Utils', 'Stock', function ($scope, $translate, $cookieStore, Utils, Stock) {

        // initial list of providers
    	Stock.getDolar().then(function(result) {
      	$scope.dolar = result.data[0].value;
				$scope.dolarOrig = $scope.dolar;
      });

			Stock.getPctNac().then(function(result) {
      	$scope.pctNac = result.data[0].value;
				$scope.pctNacOrig = $scope.pctNac;
      });

      $scope.changeLanguage = function(lang) {
        $translate.use(lang);
        $cookieStore.put('lang', lang);
      }

    	$scope.save = function() {

				if($scope.dolarOrig != $scope.dolar) {

	    		Stock.saveDolar($scope.dolar).then(function(resut){

            Utils.showMessage('notify.dolar_updated');
	    		});
				}

				if($scope.pctNacOrig != $scope.pctNac) {

					Stock.savePctNac($scope.pctNac).then(function(result){
            Utils.showMessage('notify.percentage_updated');
	    		});
				}
    	}
}]);

'use strict';

angular.module('vsko.stock').controller('GroupsCtrl', ['$scope', 'Utils', 'Stock', '$modal', function ($scope, Utils, Stock, $modal) {

        // initial list of cloth groups
        Stock.getAllGroups().then(function(result) {
        	$scope.groups = result.data;
        });

//	 Stock.idp().then(function(result) {
//        	console.log(result.data);
//        });

//        Stock.alive();

//        Stock.cors();  // !!


        $scope.showGroupModal= function(group) {

  		  		$scope.group = group ? group : {};


            $scope.modalGroup = $modal({template: 'views/modal/group.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

            $scope.modalGroup.$promise.then($scope.modalGroup.show);
        };

        $scope.saveGroup = function(group) {

        	$scope.modalGroup.hide();

    	  	Stock.saveGroup(group).then(function(result){

    	  		// show feedback message
						if(result.data.isNew) {
              Utils.showMessage('notify.group_created', 'success', {groupName: group.name});
	    	  		$scope.groups.push(result.data.group);
						}
						else {
              Utils.showMessage('notify.group_updated', 'success', {groupName: group.name});
						}
    	  	});
        };
}]);

'use strict';

angular.module('vsko.stock').controller('OnedesignCtrl', ['$scope', 'Utils', 'OneDesign', '$modal', 'uuid4', function ($scope, Utils, OneDesign, $modal, uuid4) {

		OneDesign.getBoats().then(function(result){

			$scope.boats = result.data;
		});

        $scope.addSail = function(onedesign) {

        	plotter.cuts.push({plotterId:plotter.id, possibleRolls: plotter.possibleRolls, editable:true, isNew: true, id:uuid4.generate()});
        };

        $scope.deleteOneDesign = function(boat) {

        	OneDesign.deleteBoat(boat).then(function(result){

        		if(result.data.successful) {

        			$scope.boats.remove(boat);

							Utils.showMessage('notify.od_boat_deleted');
        		}
        	});
        };

				$scope.changedName = function(boat) {

					OneDesign.updateBoatName(boat).then(function(result){

						console.log("Changed boat name to "+boat.boat);

						if(!result.data.successful) {
							boat.boat = result.data.oldName;
						}
					});
				};

}]);

'use strict';

angular.module('vsko.stock')

.controller('OrdersCtrl', ['$scope', 'Utils', 'Orders', 'Previsions', 'orderStatus', '$routeParams', '$modal', function ($scope, Utils, Orders, Previsions, orderStatus, $routeParams, $modal) {

		$scope.type = $routeParams.type;

        // initial list of orders
        Orders.getOrders(orderStatus.to_buy).then(function(result) {
        	$scope.orders_buy = result.data;
        });

		Orders.getOrders(orderStatus.to_confirm).then(function(result) {
        	$scope.orders_confirm = result.data;
        });

		Orders.getOrders(orderStatus.in_transit).then(function(result) {
			$scope.orders_transit = result.data;

			$.each($scope.orders_transit, function(index){
        		//this.arriveDate = $.format.date(new Date(), "dd-MM-yyyy");
//				this.arriveDate = $.format.date(this.arriveDate, "dd-MM-yyyy");
        	});
		});


        // Functions called as callback from order modal
        $scope.confirm = function(order) {

        	var result = true;

        	if(order.status == orderStatus.to_buy) {
        		Orders.incrementStatus(order).then(function(result){

        			if(result.data.successful) {

	        			$scope.orders_buy.remove(order);
	        			$scope.orders_confirm.push(order);

	        			order = $.extend(true, order, result.data.order);

								Utils.showMessage('notify.order_confirmed');
        			}
        		});
        	}
        	else if(order.status == orderStatus.to_confirm) {

        		Orders.incrementStatus(order).then(function(result){

        			if(result.data.successful) {
        				console.log('Confirmed order: '+order.orderId);

	        			$scope.orders_confirm.remove(order);
	        			$scope.orders_transit.push(order);

	        			order = $.extend(true, order, result.data.order);

								Utils.showMessage('notify.order_to_in_transit');

								updatePrevisionState(order);
        			}
        		});
        	}
        	else if(order.status == orderStatus.in_transit) {

        		if($scope.modalCtrl.formOrderInfo.$valid) { // to finish the order the info section should be completed and valid

//        			Orders.validate(order).then(function(result){
//
//        				if(result.data.valid) {
//        					// valid order, confirm reception
////	        				$scope.arrive(order);
//        				}
//        				else {
//        					// not valid order to receive -> rolls not filled completely (validation on server side)
//        					result = false;
//
//        					$scope.showWarningModal({message: 'Hay rollos no cargados o incompletos. Desea confirmar la orden igual?'}, $scope.acceptArriveWarning, order);
//        				}
//        			});

        			// hay validacion previa en ui para que todas las telas tengan rollo asignado
        			$scope.arrive(order);
        		}
        		else {
        			result = false;
        			$scope.modalCtrl.formOrderInfo.$setDirty();

							Utils.showMessage('notify.missing_info_arrive', 'error');
        		}
        	}

        	return result;
        };

        $scope.acceptArriveWarning = function(order) {
        	$scope.arrive(order);
        };

        $scope.arrive = function(order) {
        	console.log('Arrive order: ', order);

        	Orders.incrementStatus(order).then(function(result){

	    			if(result.data.successful) {
	        			$scope.orders_transit.remove(order);

	        			order = $.extend(true, order, result.data.order);

								Utils.showMessage('notify.order_arrived');

								updatePrevisionState(order);
	    			}
	    		});
        };

        $scope.deleteOrder = function(order) {
        	console.log('Delete order: '+order.orderId);

        	Orders.removeOrder(order).then(function(result){

	    			if(result.data.successful) {
	        			$scope.orders_confirm.remove(order);
	        			$scope.orders_transit.remove(order);

	        			$scope.modalOrder.hide();

								Utils.showMessage('notify.order_deleted');

								if(order.status == orderStatus.in_transit) {
									updatePrevisionState(order);
								}
	    			}
	    			else {
							Utils.showMessage('notify.order_delete_failed', 'error');
	    			}
	    		});

        };


        $scope.close = function() {

        	$.extend($scope.user, $scope.origUser);

        	$scope.modalUser.hide();
        };

        $scope.setModalCtrl = function(modalCtrl) {

        	$scope.modalCtrl = modalCtrl;
        };

        $scope.formatDate = function(date) {
        	$.format.date(date, "dd-MM-yyyy");
        };

				function updatePrevisionState(order) {

					var clothsIds = order.products.map(function(p) { return p.clothId; }).join(',');

					Previsions.updatePrevisionState(clothsIds).then(function() {
						Utils.showMessage('notify.previsions_state_updated');
					});
				}
}]);

'use strict';

angular.module('vsko.stock').controller('PlotterCtrl', ['$scope', '$rootScope', 'Utils', 'Previsions', 'Plotters', 'Stock', 'Lists', '$modal', 'uuid4', function ($scope, $rootScope, Utils, Previsions, Plotters, Stock, Lists, $modal, uuid4) {

        // initial list of plotters
		loadAllPlotters();

        $scope.cutted = function(plotter) {

        	// value from 0/1 to boolean
        	plotter.cutted = plotter.cutted=='0' ? false : (plotter.cutted=='1' ? true : plotter.cutted);

        	plotter.cutted = plotter.cutted ? !plotter.cutted : true;

        	Plotters.cutted(plotter, $rootScope.user.name).then(function(result){

						if(result.data.successful && result.data.successfulRolls) {
	        		$scope.plotters.remove(plotter);

	        		console.log('Cutted: ', plotter);

							Utils.showMessage('notify.cloth_cutted');

							Previsions.updatePrevisionState(plotter.clothId).then(function() {
								Utils.showMessage('notify.previsions_state_updated');
							});
						}
						else if(!result.data.successful) {
							Lists.log({type: 'error.finishPlotter', log: result.data.update}).then(function(result) {});
							Utils.showMessage('notify.plotter_cut_failed', 'error');
						}
						else if(!result.data.successfulRolls) {
							Lists.log({type: 'error.updateRolls', log: result.data.updateRolls}).then(function(result) {});
							Utils.showMessage('notify.plotter_rolls_update_failed', 'error');
						}
        	});
        };

        $scope.addCut = function(plotter) {

        	Plotters.getPossibleRolls(plotter).then(function(possibleRolls){

    			plotter.possibleRolls = possibleRolls.data;

    			var newcut = {plotterId:plotter.id, possibleRolls: plotter.possibleRolls, editable:true, isNew: true, id:uuid4.generate(), mtsPendingToBeCutted: 0};

    			if(plotter.possibleRolls.length==0) {
    	  			plotter.possibleRolls.push({display: 'Sin rollos'});
    	  			newcut.selectedRoll = plotter.possibleRolls[0];
    			}

    			plotter.cuts.push(newcut);
    		});
        };

        $scope.editObservations = function(plotter) {

        	Plotters.editObservations(plotter).then(function(result){

        		console.log('Observation changed to: '+plotter.observations);
    		});
        }

        $scope.filledCuts = function(plotter) {

        	var filled = false;

        	$.each(plotter.cuts, function(idx, c){

        		if(c.selectedRoll && c.mtsCutted && c.mtsCutted > 0 && !c.editable)
        			filled = true;
        	});

        	return filled;
        };

        $scope.search = function() {

        	if($scope.search.order) {
	        	Plotters.search($scope.search.order).then(function(result){

	        		$scope.plotters = result.data;

	        		// load for each cut of each plotter the selected roll and set the possibleRolls corresponding to each plotter&cuts
	    	    	$scope.plotters.each(function( plotter ) {

	    	    		if(plotter.cutted=='1') {
	    	    			// for cutted plotters load info of user and timestamp for tooltip
	    	    			plotter.tooltip = "Cortado por '"+(plotter.cuttedBy ? plotter.cuttedBy : '?')+"' el "+plotter.cuttedTimestamp;
	    	    		}

	    	    		Stock.getClothRolls(plotter.clothId, false).then(function(result) {

	    	    			plotter.possibleRolls = result.data;

	    	    			$scope.loadSelectedRoll(plotter.cuts, result.data);
	    	    		});
	    	    	});
	        	});
        	}
        	else {
        		loadAllPlotters();
        	}
        };

        $scope.restore = function(plotter) {
        	// restore an already cutted plotter
        	plotter.cutted = plotter.cutted ? !plotter.cutted : true;

        	Plotters.restore(plotter).then(function(result){

        		console.log('Restored: '+plotter.id);

        		Plotters.getPossibleRolls(plotter).then(function(possibleRolls){

		    			plotter.possibleRolls = possibleRolls.data;

		    			$scope.loadSelectedRoll(plotter.cuts, possibleRolls.data);
		    		});

						Utils.showMessage('notify.cloth_back_to_plotter');

						Previsions.updatePrevisionState(plotter.clothId).then(function() {
							Utils.showMessage('notify.previsions_state_updated');
						});
        	});
        };

        $scope.deletePlotter = function(plotter) {

        	Plotters.removePlotter(plotter.id).then(function(result){

        		$scope.plotters.remove(plotter);

						Utils.showMessage('notify.plotter_deleted');
        	});
        };

        $scope.restoreToDesign = function(plotter) {

        	console.log('restore plotter');

        	var orderNumber = plotter.orderNumber;

        	Plotters.restoreToDesign(plotter).then(function(result){

        		$scope.plotters.remove(function(p) {
        			  return p.orderNumber == orderNumber;
        		});

						Utils.showMessage('notify.plotter_back_to_design');

						// TODO when a plotter returns to design also all cloths in the original prevision returns => need to send all
						Previsions.updatePrevisionState(plotter.clothId).then(function() {
							Utils.showMessage('notify.previsions_state_updated');
						});
        	});
        };

        $scope.deleteManualPlotter = function(plotter) {

	    	  Plotters.removeManualPlotter(plotter.manualPlotterId).then(function(result) {

	    		  $scope.plotters.remove(plotter);

	    		  if($scope.modalManualPlotter)
	    			  $scope.modalManualPlotter.hide();

						Utils.showMessage('notify.plotter_deleted');
	    	  });
        };


        $scope.loadSelectedRoll = function(cuts, possibleRolls) {
        	// set current value for each cloth (needed for dropdown)
        	cuts.each(function( cut ) {

        		cut.possibleRolls = possibleRolls;

        		cut.selectedRoll = possibleRolls.findAll({id:cut.rollId})[0];
        	});
        };

        $scope.updatePlotterField = function(plotter, value, field) {

        	plotter[field] = value;

        	Plotters.editPlotterPrevision(plotter, field).then(function(result) {

        		console.log('Updated '+field+' of plotter '+plotter.id+' to '+value);
        	});
        }

        function loadAllPlotters() {

        	Previsions.getAllPlotters(false).then(function(result) {
    	    	$scope.plotters = result.data;

    	    	// load for each cut of each plotter the selected roll and set the possibleRolls corresponding to each plotter&cuts
    	    	$scope.plotters.each(function( plotter ) {

    	    		Plotters.getPossibleRolls(plotter).then(function(possibleRolls){

    	    			plotter.possibleRolls = possibleRolls.data;

    	    			$scope.loadSelectedRoll(plotter.cuts, possibleRolls.data);
    	    		});
    	    	});
    	    });
        }
}]);

'use strict';

angular.module('vsko.stock').controller('PrevisionsCtrl', ['$scope', 'Previsions', '$modal', function ($scope, Previsions, $modal) {

    	$scope.maxCloths = 3;

        // initial list of cloth groups
    	Previsions.getAll(true).then(function(result) {
        	$scope.previsions = result.data;

//        	$.each($scope.previsions, function(index) {
//
//        	});
        });

    	$scope.sortOptions = [{id:'unformattedDeliveryDate', name:'Fecha'}, {id:'orderNumber', name:'Numero de orden'}];

    	$scope.reverse = false;

    	$scope.changeOrder = function() {
    		$scope.reverse = !$scope.reverse;
    	};

			$scope.updatePrevision = function() {
    		Previsions.updatePrevisionState('148');
    	};

      $scope.updateAllPrevisionsStates = function() {
    		Previsions.updateAllPrevisionsStates();
    	};

      $scope.filterStateChanged = function(p) {

        if(!$scope.showStateChanged) {

          return !p.designed;
        }

    		return p.stateAccepted=='0';
    	};

      $scope.acceptStateChange = function(p) {
        Previsions.acceptStateChange(p).then(function() {
          $.notify("Cambio de estado aceptado.", {className: "success", globalPosition: "bottom right"});
          p.stateAccepted = '1';
        });
      };

    	$scope.format = function(date) {
      	  var dateParts = date.split("-");

      	  return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
        };
}]);

'use strict';
	
angular.module('vsko.stock').controller('ProvidersCtrl', ['$scope', 'Stock', '$modal', function ($scope, Stock, $modal) {

        // initial list of providers
    	Stock.getAllProviders().then(function(result) {
        	$scope.providers = result.data;
        });
}]);


'use strict';

angular.module('vsko.stock').controller('QueryCtrl', ['$scope', 'Lists', function ($scope, Lists) {

	$scope.doQuery = function() {

		Lists.executeQuery($scope.query).then(function(result){
			$scope.result = result;
		});
	};

	$scope.doUpdate = function() {

		Lists.executePostUpdate($scope.query).then(function(result){
			$scope.result = result;
		});
	};

}]);

'use strict';
	
angular.module('vsko.stock')

.controller('UsersCtrl', ['$scope', 'Users', '$modal', function ($scope, Users, $modal) {

        // initial list of all users
        Users.getAllUsers().then(function(result) {
        	
        	$scope.users = result.data;
        });

        
        // Modal functions
        $scope.showModal = function(user) {
        	
        	$scope.user = user ? user : {};
        	
        	$scope.oldPassword = $scope.user.password;
        	
        	$scope.origUser = user ? $.extend(true, {}, user) : {}; // used when the user cancel the modifications (close the modal)
        	
        	Users.getRoles().then(function(result) {
            	
            	$scope.roles = result.data;
            });
        	
        	
        	$scope.modalUser = $modal({template: 'views/modal/user.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

            $scope.modalUser.$promise.then($scope.modalUser.show);
        };
        
        $scope.save = function(user) {
        	
        	if(user.newPassword){ 
        		if($scope.oldPassword == user.oldPassword) {
        	
        			user.password = user.newPassword;
        		}
	        	else {
	        		$scope.modalCtrl.form.oldPassword.$setValidity('oldPassword', false);
	        		return;
	        	}
        	}
        	
        	var newUser = !user.id;
    		
    		Users.save(user).then(function(result){
    			
    			if(newUser)
    				$scope.users.push(user);
    			
    			$scope.modalUser.hide();
    		});
        };
        
        $scope.deleteUser = function(user) {
        	
    		Users.deleteUser(user).then(function(result){
    			
    			$scope.users.remove(user);
    		});
        };
        
        $scope.close = function() {
        	
        	$.extend($scope.user, $scope.origUser);
        	
        	$scope.modalUser.hide();
        };
        
        $scope.setModalCtrl = function(modalCtrl) {
        	// used later to access the form elements of the modal html
        	$scope.modalCtrl = modalCtrl;
        };
}]);

'use strict';

angular.module('vsko.stock')

.directive('clothRollsTags', function($modal, Orders) {
        
    return {
          restrict: 'E',
          scope: {
          	rolls: '='
          },
          templateUrl: 'views/directives/clothRollsTags.html',
          link: function postLink(scope, element, attrs) {
              
          }
        };
	}
);
'use strict';

angular.module('vsko.stock')

.directive('designClothsTags', function($modal, $rootScope, Previsions) {

    return {
          restrict: 'E',
          scope: {
            cloths: '=',
            editableByRole: '='
          },
          templateUrl: 'views/directives/designClothsTags.html',
          link: function postLink(scope, element, attrs) {

            var $scope = scope;

            scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

        	  $scope.changed = function(cloth) {

        		  Previsions.updateClothMts(cloth).then(function(result){
        			  console.log("Changed cloth to "+cloth.mts+" mts");

      					Previsions.updatePrevisionState(cloth.id).then(function() {
      						// $.notify("Estado de previsiones actualizado.", {className: "success", globalPosition: "bottom right"});
      					});
        		  });

        		  $scope.clicked(cloth);
        	  };

        	  $scope.clicked = function(cloth) {

                if(!scope.readonly) {

  	      		  	if(cloth.editable) {
  		        		  	$('#badgeEdit-'+cloth.cpId).fadeOut('fast', function() {
  			      			    $('#badgeDisplay-'+cloth.cpId).fadeIn('slow');
  		      				});
  	      		  	}
  	      		  	else {
  	      		  		$('#badgeDisplay-'+cloth.cpId).fadeOut('fast', function() {
  			      			    $('#badgeEdit-'+cloth.cpId).fadeIn('slow');
  		      				});
  	      		  	}

	      		     cloth.editable = !cloth.editable;
                }
	      	  };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('editableRollType', function($modal, $rootScope, Stock) {

    return {
          restrict: 'E',
          scope: {
            r: '=roll',
            editableByRole: '='
          },
          templateUrl: 'views/directives/editableRollType.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            scope.readonly = scope.editableByRole && $rootScope.user.role != scope.editableByRole;

        	  $scope.changed = function(roll) {

        		  Stock.updateRollType(roll).then(function(result){

        			  console.log("Changed roll type to "+roll.type);
        		  });

        		  $scope.clicked(roll);
        	  };

        	  $scope.clicked = function(roll) {

                if(!scope.readonly) {

                  if(roll.editable) {
  	        		  	$('#rollEdit-'+roll.id).fadeOut('fast', function() {
  		      			    $('#rollDisplay-'+roll.id).fadeIn('fast');
  	      				});
          		  	}
          		  	else {
          		  		$('#rollDisplay-'+roll.id).fadeOut('fast', function() {
  		      			    $('#rollEdit-'+roll.id).fadeIn('fast');
  	      				});
          		  	}

          		  	roll.editable = !roll.editable;
                }
        	  };
          }
        };
	}
)

.directive('editableRollData', function($modal, $rootScope, Stock) {

    return {
          restrict: 'E',
          scope: {
          	rollField: '=field',
          	r: '=roll',
          	extraLabel: '=',
          	labelWidth: '=',
            editableByRole: '='
          },
          templateUrl: 'views/directives/editableRollData.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  scope.editable = false;

            scope.readonly = scope.editableByRole && $rootScope.user.role != scope.editableByRole;

        	  scope.labelStyle = scope.labelWidth ? {width:scope.labelWidth+"px"} : '';

        	  $scope.changed = function(roll) {

        		  Stock.updateRollField(roll, scope.rollField, scope.r[scope.rollField]).then(function(result){

        			  console.log("Changed roll field '"+scope.rollField+"' to "+scope.r[scope.rollField]);

        			  // always update the roll mts just in case
        			  scope.r.mts = result.data.roll.mts;
        		  });

        		  $scope.clicked(roll);
        	  };

        	  $scope.clicked = function(roll) {

                if(!scope.readonly) {

          		  	if(scope.editable) {
  	        		  	$('#rollEdit-'+roll.id+'-'+scope.rollField).fadeOut('fast', function() {
  		      			    $('#rollDisplay-'+roll.id+'-'+scope.rollField).fadeIn('fast');
  	      				});
          		  	}
          		  	else {
          		  		$('#rollDisplay-'+roll.id+'-'+scope.rollField).fadeOut('fast', function() {
  		      			    $('#rollEdit-'+roll.id+'-'+scope.rollField).fadeIn('fast');
  	      				});
          		  	}

          		  	scope.editable = !scope.editable;
                }
        	  };
          }
        };
	}
)

.directive('editableProviderName', function($modal, Stock) {

    return {
          restrict: 'E',
          templateUrl: 'views/directives/editableProviderName.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  $scope.changed = function(provider) {

        		  Stock.updateProviderName(provider).then(function(result){

        			  console.log("Changed provider name to "+provider.name);

        			  if(!result.data.successful) {
        				  provider.name = result.data.provider.name;
        			  }
        		  });
        	  };

        	  $scope.clicked = function(provider) {

        		  	if(provider.editable) {
	        		  	$('#providerEdit-'+provider.id).fadeOut('fast', function() {
		      			    $('#providerDisplay-'+provider.id).fadeIn('fast');
	      				});
        		  	}
        		  	else {
        		  		$('#providerDisplay-'+provider.id).fadeOut('fast', function() {
		      			    $('#providerEdit-'+provider.id).fadeIn('fast');
	      				});
        		  	}

        		  	provider.editable = !provider.editable;
        	  };
          }
        };
	}
)

.directive('editableSailName', function($modal, OneDesign) {

    return {
          restrict: 'E',
          templateUrl: 'views/directives/editableSailName.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  $scope.changed = function(sail) {

        		  OneDesign.updateSailName(sail).then(function(result){

        			  console.log("Changed sail name to "+sail.sail);

        			  if(!result.data.successful) {
        				  sail.sail = result.data.oldName;
        			  }
        			  else {
        				  $scope.loadSails();
        			  }
        		  });
        	  };

        	  $scope.clicked = function(sail) {

        		  	if(sail.editable) {
	        		  	$('#sailEdit-'+sail.odId).fadeOut('fast', function() {
		      			    $('#sailDisplay-'+sail.odId).fadeIn('fast');
	      				});
        		  	}
        		  	else {
        		  		$('#sailDisplay-'+sail.odId).fadeOut('fast', function() {
		      			    $('#sailEdit-'+sail.odId).fadeIn('fast');
	      				});

        		  		sail.oldName = sail.sail;
        		  	}

        		  	sail.editable = !sail.editable;
        	  };
          }
        };
	}
)

.directive('editableBoatName', function($modal, OneDesign) {

    return {
          restrict: 'E',
          templateUrl: 'views/directives/editableBoatName.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  $scope.changedName = function(boat) {

        		  OneDesign.updateBoatName(boat).then(function(result){

        			  console.log("Changed boat name to "+boat.boat);

        			  if(!result.data.successful) {
        				  boat.boat = result.data.oldName;
        			  }
        		  });
        	  };

        	  $scope.clickedName = function(boat) {

        		  	if(boat.editable) {
	        		  	$('#boatEdit-'+boat.uiId).fadeOut('fast', function() {
		      			    $('#boatDisplay-'+boat.uiId).fadeIn('fast');
	      				});
        		  	}
        		  	else {
        		  		$('#boatDisplay-'+boat.uiId).fadeOut('fast', function() {
		      			    $('#boatEdit-'+boat.uiId).fadeIn('fast');
	      				});

        		  		boat.oldName = boat.boat;
        		  	}

        		  	boat.editable = !boat.editable;
        	  };
          }
        };
	}
)

.directive('editableInput', function($modal, $rootScope) {

	return {
        restrict: 'E',
        scope: {
        	field: '=',
        	entity: '=',
        	callback: '=',
          editableByRole: '=',
          tooltipText: '=',
          width: '=',
          extraLabel: "="
        },
        templateUrl: 'views/directives/editableInput.html',
        link: function postLink(scope, element, attrs) {

      	  scope.editable = false;

          scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

          scope.$watch('entity.id', function(value){
            if(scope.tooltipText && scope.entity.id)
              $('#entityDisplay-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
          });


      	  /*scope.value = scope.entity[scope.field];*/

      	  scope.changed = function(entity) {

            if(entity[scope.field]) {
        		  scope.callback(entity, entity[scope.field], scope.field);

        		  scope.clicked(entity);
            }
      	  };

      	  scope.clicked = function(entity) {

            if(!scope.readonly) {

      		  	if(scope.editable) {
	        		  	$('#entityEdit-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
		      			    $('#entityDisplay-'+entity.id+'-'+scope.field).fadeIn('fast');
	      				  });

                  if(scope.tooltipText)
                    $('#value-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
      		  	}
      		  	else {
      		  		$('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
		      			    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
	      				});
      		  	}

      		  	scope.editable = !scope.editable;
            }
      	  };
        }
      };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('onedesignSails', function($modal, $rootScope, Previsions) {

    return {
          restrict: 'E',
          scope: {
            boat: "=",
            open: "=",
            editableByRole: "="
          },
          templateUrl: 'views/directives/onedesignSails.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

        	  $scope.changed = function(cut) {

        		  if(!cut.mtsCutted || !cut.selectedRoll) {
        			  // TODO show msg on invalid save of cut
        			  return;
        		  }

        		  cut.rollId = cut.selectedRoll.id;

        		  Previsions.savePlotterCut(cut).then(function(result){
        			  console.log("Changed cut to "+cut.mtsCutted+" mts");
        		  });
        	  };



        	  $scope.clicked = function(cut) {

              if(!scope.readonly) {

        		  	if(cut.editable) {
	        		  	$('#badgeEdit-'+cut.id).fadeOut('fast', function() {
		      			    $('#badgeDisplay-'+cut.id).fadeIn('slow');
	      				});
        		  	}
        		  	else {
        		  		$('#badgeDisplay-'+cut.id).fadeOut('fast', function() {
		      			    $('#badgeEdit-'+cut.id).fadeIn('slow');
	      				});
        		  	}

        		  	cut.editable = !cut.editable;
              }
        	  };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('orderRollsTags', function($modal, Orders) {
        
    return {
          restrict: 'E',
          templateUrl: 'views/directives/orderRollsTags.html',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  Orders.getRolls($scope.p.productId, $scope.p.orderId).then(function(result){
				  
				  if(result.data.length > 0) {
					  $scope.p.rolls = result.data;
				  }
			  });
          }
        };
	}
);
'use strict';

angular.module('vsko.stock')

.directive('plotterCutsTags', function($modal, $rootScope, Utils, Previsions, Plotters) {

    return {
          restrict: 'E',
          scope: {
            cuts: '=',
            p: '=plotter',
            editableByRole: '='
          },
          templateUrl: 'views/directives/plotterCutsTags.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

        	  $scope.changed = function(cut) {

        		  if(!cut.mtsCutted || !cut.selectedRoll) {
        			  // TODO show msg on invalid save of cut
        			  return;
        		  }

        		  cut.rollId = cut.selectedRoll.id;

        		  Previsions.savePlotterCut(cut).then(function(result){
        			  console.log("Changed cut to "+cut.mtsCutted+" mts");

                Utils.showMessage('notify.cut_assigned');
        		  });

        		  $scope.clicked(cut);
        	  };

        	  $scope.selectedRoll = function(cut, roll) {
        		  // update tooltip with available mts
        		  $('#mts-'+cut.id).tooltip('destroy');
        		  $('#mts-'+cut.id).tooltip({title: 'Disponible '+(roll.mts - roll.mtsPendingToBeCutted)+' mts'});
        	  };

        	  $scope.deleted = function(cut) {

        		  if(cut.id) {
        			  // call api to delete cut
	        		  Previsions.removePlotterCut(cut).then(function(result){
	        			  $scope.cuts.remove(cut);
	        		  });
        		  }
        		  else {
        			  // just remove from list, it is a new created cut withut values saved yet
        			  $scope.cuts.remove(cut);
        		  }

        		  $scope.clicked(cut);
        	  };

        	  $scope.clicked = function(cut) {

                if(!scope.readonly) {

          		  	if(cut.editable) {
  	        		  	$('#badgeEdit-'+cut.id).fadeOut('fast', function() {
  		      			    $('#badgeDisplay-'+cut.id).fadeIn('slow');
  	      				});
          		  	}
          		  	else {
          		  		// need to get possiblerolls again because of possible changes in other plotter cuts mts while this was closed
          		  		Plotters.getPossibleRolls($scope.p, cut.id).then(function(possibleRolls){

          		  			$('#badgeDisplay-'+cut.id).fadeOut('fast', function() {
      		      			    $('#badgeEdit-'+cut.id).fadeIn('slow');
      	      				});

          		  			cut.possibleRolls = possibleRolls.data;

      		  				  cut.selectedRoll = loadSelectedRoll(cut.rollId, possibleRolls.data);

  	        		  		// $('#mts-'+cut.id).tooltip('destroy');
  	        		  		// $('#mts-'+cut.id).tooltip({title: 'Disponible '+(cut.selectedRoll.mts - cut.selectedRoll.mtsPendingToBeCutted)+' mts'});
                      $scope.selectedRoll(cut, cut.selectedRoll);

          	    		});
          		  	}

          		  	cut.editable = !cut.editable;
                }
        	  };

            function loadSelectedRoll(rollId, possibleRolls) {
              var sameRoll = possibleRolls.filter(function(roll) {
                return rollId === roll.id;
              });
              if(sameRoll.length > 0) {
                return sameRoll[0];
              }
              // shouldnt happen
              return null;
            }
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

/*.directive('autocomplete', function factory($parse) {

    return {
          restrict: 'A',
          link: function postLink(scope, element, attrs, controller) {

            var key=attrs.key;
            var source=attrs.source;
            var minLength=attrs.minlength;

            element.typeahead({
                source: function (query, process) {

                    var getter = $parse(source);
//                    var setter = getter.assign;
                    var value = getter(scope);

                    if(!minLength || query.length >= minLength)
                    	value(query, process);
                },
                minLength: attrs.minlength || 1,
                items: attrs.items,
                updater: function (item) {
                    var getter = $parse(key), setter = getter.assign;

                    scope.$apply(function () {
                        setter(scope, map[item].uuid);
                    });
                    return item;
                },
                matcher: function (item) {
                    if (item.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
                        return true;
                    }
                },
                sorter: function (items) {
                    return items.sort();
                },
                highlighter: function (item) {
                    var regex = new RegExp( '(' + this.query + ')', 'gi' );
                    return item.replace( regex, "<strong>$1</strong>" );
                }
            });
          }
        };
})*/

.directive('datePicker', function() {

	return {
        restrict: 'A',

        link: function(scope, elem, attr) {

        	elem.datepicker( {
        		format: "dd-mm-yyyy",
                autoclose: true,
                todayHighlight: true,
        		language: "en"
        	} );
        }
    };
})

.directive('accessLevel', ['$rootScope', 'userRoles', 'accessLevels' , function($rootScope, userRoles, accessLevels) {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {
            // show/hide element depending on the accesslevel set for it, watching the role of the logged user
        	$rootScope.$watch('user.role', function(role){

        		var elemAccessLevel = attrs.accessLevel;

        		if(userRoles[role] && userRoles[role][0] & accessLevels[elemAccessLevel]) { // eg. 100 (4/admin) & 110 (6/design) = true
        			$(elem).show();
        		}
        		else {
        			$(elem).hide();
        		}
        	});
        }
    };
}])

.directive('accessRestricted', ['$rootScope', 'userRoles', 'accessLevels' , function($rootScope, userRoles, accessLevels) {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {
            // show/hide element depending on the accesslevel set for it, watching the role of the logged user
        	$rootScope.$watch('user.role', function(role){

        		var elemsAccessRestricted = attrs.accessRestricted.split(',');

        		if(elemsAccessRestricted.lastIndexOf(role) != -1) { // contains
        			$(elem).hide();
        		}
        		else {
        			$(elem).show();
        		}
        	});
        }
    };
}])

.directive('accessAllowed', ['$rootScope', 'userRoles', 'accessLevels' , function($rootScope, userRoles, accessLevels) {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {
            // show/hide element depending on the accesslevel set for it, watching the role of the logged user
        	$rootScope.$watch('user.role', function(role){

        		var elemsAccessAllowed = attrs.accessAllowed.split(',');

        		if(elemsAccessAllowed.lastIndexOf(role) != -1) { // contains
        			$(elem).show();
        		}
        		else {
        			$(elem).hide();
        		}
        	});
        }
    };
}])

.directive('focusMe', [function() {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {

        	$(elem).focus();
        }
    };
}])

.directive('stopPropagation', function() {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {

        	$(elem).click(function (e) {
        	    e.stopPropagation();
        	});
        }
    };
})

// Bootstrap tooltips -> http://getbootstrap.com/javascript/#tooltips
.directive('myTooltip', function() {

	return {
        restrict: 'A',

        scope: { message: '=myTooltip' },
        link: function(scope, elem) {

        	$(elem).tooltip({title: scope.message });
        }
    };

})

.directive('stockTooltip', function() {

	return {
        restrict: 'A',

        scope: { cloth: '=stockTooltip' },
        link: function(scope, elem) {

        	$(elem).tooltip({title: sumStockDef(scope.cloth.providers) + ' Def. / ' + sumStockTemp(scope.cloth.providers) + ' Temp.' });
        }
    };

    function sumStockDef(providers) {

    	var sum = 0;
			if(!providers)
				return sum;

    	$.each(providers, function(idx, p){ sum += new Number(p.stockDef); });
    	return sum;
    };

    function sumStockTemp(providers) {

    	var sum = 0;

			if(!providers)
				return sum;

    	$.each(providers, function(idx, p){ sum += new Number(p.stockTemp); });
    	return sum;
    };
})

.directive('priceTooltip', function() {

	return {
        restrict: 'AC',

        scope: { price: '=priceTooltip' },
        link: function(scope, elem) {

        	$(elem).tooltip({title: scope.price + ' / yds' });
        }
    };

})

.directive('googleAnalytics', function ( $location, $window ) {
  return {
	  restrict: 'A',
    scope: true,
    link: function (scope) {
      scope.$on( '$routeChangeSuccess', function () {
    	  if($window.ga)
    		  $window.ga('send', 'pageview', {'page': $location.path()});
      });
    }
  };
});

function sumDjai(cloth) {
              	
	var sum = 0;
	
	if(cloth) {
	  	$.each(cloth.djais, function(idx, d){
	  		sum += new Number(d.amount);
	  	});
	}
  	
  	return sum; 
};
'use strict';

angular.module('vsko.stock')

//.filter('translate', [ 'localize', function (localize) {
//        return function (input) {
//            return localize.getLocalizedString(input);
//        };
//    }]
//)

.filter('previsionsByType', function () {
	
		return function(previsions, type) {
	      
			var out = new Array();
			
			for (var i = 0; i < previsions.length; i++) {
				if(previsions[i].type == type) {
					out.push(previsions[i]);
				}
			}
			
			return out;
	    };
    }
);

'use strict';

angular.module('vsko.stock')

.factory('Files', ['$http', function ($http) {

    	var url = 'http://localhost:8080';
    	var apiContext = '/files/';
    	
        this.list = function(uri) 
        { 
        	return $http.get(url + apiContext + 'paths/' + uri);
        };
        
        this.createFolder = function(uri) 
        { 
        	return $http.post(url + apiContext + 'paths/' + uri);
        }; 
        
        this.contentHref = function(key)
        {
        	return url + apiContext + key + '/content';
        };
        
        this.previewHref = function(href, preview, width, height)
        {
        	return url + href + '?preview='+preview;//+'&width='+width+'&height='+height;
        };
        

        return this;
    }]);


// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Lists', ['$http', '$q', 'uuid4', function ($http, $q, uuid4) {

		var url = telasAPIUrl;

        this.clothPlottersHistory = function(cloth)
        {
        	return $http.get(url + 'lists_GET.php?plottersHistory=true&clothId='+cloth.id);
        };

        this.betweenDates = function(filter, type, groupBy)
        {
        	var startDate = filter.startDate ? filter.startDate : "01-01-1000";
        	var endDate = filter.endDate ? filter.endDate : "12-12-2999";
        	var paramCloth = (filter.selectedCloth && filter.selectedCloth.id) ? ('&clothId='+filter.selectedCloth.id) : '';
        	var paramInvoice = (filter.invoice) ? ('&invoiceNumber='+filter.invoice) : '';
					var paramUser = (filter.selectedUser && filter.selectedUser.name) ? ('&userName='+filter.selectedUser.name) : '';
					var paramGroup = (filter.selectedGroup && filter.selectedGroup.name) ? ('&groupName='+filter.selectedGroup.name) : '';
					var paramProvider = (filter.selectedProvider && filter.selectedProvider.name) ? ('&providerName='+filter.selectedProvider.name) : '';

					var paramGroupBy = groupBy ? '&groupBy='+groupBy : '';

        	return $http.get(url + 'lists_GET.php?betweenDates=true&type='+type+'&startDate='+startDate+"&endDate="+endDate+paramCloth+paramInvoice+paramUser+paramGroup+paramProvider+paramGroupBy);
        };

				this.betweenDatesGroupedBy = function(filter, type)
        {
        	var startDate = filter.startDate ? filter.startDate : "01-01-1000";
        	var endDate = filter.endDate ? filter.endDate : "12-12-2999";
        	var paramCloth = (filter.selectedCloth && filter.selectedCloth.id) ? ('&clothId='+filter.selectedCloth.id) : '';
        	var paramInvoice = (filter.invoice) ? ('&invoiceNumber='+filter.invoice) : '';
					var paramUser = (filter.selectedUser && filter.selectedUser.name) ? ('&userName='+filter.selectedUser.name) : '';

        	return $http.get(url + 'lists_GET.php?betweenDates=true&type='+type+'&startDate='+startDate+"&endDate="+endDate+paramCloth+paramInvoice+paramUser);
        };

        this.clothsUnderStock = function(filter)
        {
        	var groupId = filter.groupId ? "&groupId="+filter.groupId : "";
        	return $http.get(url + 'lists_GET.php?underStock=true'+groupId);
        };

        this.getAllRolls = function(distincts)
        {
        	return $http.get(url + 'rolls_GET.php?all=true&distincts='+distincts);
        };

        this.getRollLotes = function(roll)
        {
        	return $http.get(url + 'rolls_GET.php?lotes=true&rollNumber='+roll.number);
        };

        this.getRollCuts = function(roll, cloth)
        {
        	var rollParam = roll ? '&rollId='+roll.id : '';
        	var clothParam = cloth ? '&clothId='+cloth.id : '';

        	return $http.get(url + 'rolls_GET.php?cuts=true'+rollParam+clothParam);
        };

				this.stockUpToDate = function(groupId, date, includeStock0)
        {
        	return $http.get(url + 'lists_GET.php?upToDate=true&groupId='+groupId+'&date='+date+'&includeStock0='+includeStock0);
        };

				this.getPrices = function(group)
        {
					var groupCondition = group ? '&groupId='+group.id : '';

        	return $http.get(url + 'lists_GET.php?getPrices=true'+groupCondition);
        };

				//---------------------------------------------------------------------------//

        this.executeQuery = function(query)
        {
        	return $http.get(url + 'lists_GET.php?executeQuery=true&query='+query);
        };

        this.executeUpdate = function(query)
        {
        	return $http.get(url + 'lists_GET.php?executeUpdate=true&query='+query);
        };

				this.executePostUpdate = function(query)
        {
					var payload = {query: query};
        	return $http.post(url + 'lists_POST.php?executeUpdate=true', payload);
        };


				//---------------------------------------------------------------------------//

				this.log = function(log)
        {
        	return $http.post(url + 'log_POST.php', log);
        };

        return this;
    }]);

// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('OneDesign', ['$http', '$q', 'uuid4', function ($http, $q, uuid4) {

		var url = telasAPIUrl;

        this.getBoats = function()
        {
        	return $http.get(url + 'boats_GET.php?onedesign=true');
        };

        this.getSails = function()
        {
        	return $http.get(url + 'sails_GET.php?onedesign=true');
        };

        this.updateSailName = function(sail) {

        	return $http.post(url + 'sails_POST.php?updateSailName=true', sail);
        };

        this.save = function(onedesign) {

       		onedesign.id = uuid4.generate();

        	return $http.post(url + 'boats_POST.php?onedesign=true', onedesign);
        };

        this.updateBoatName = function(boat) {

        	return $http.post(url + 'boats_POST.php?updateBoatName=true', boat);
        };

        this.deleteCloth = function(onedesign) {

        	return $http.delete(url + 'boats_DELETE.php?deleteODCloth=true&odId='+onedesign.odId);
        };

        this.deleteBoat = function(boat) {

        	return $http.delete(url + 'boats_DELETE.php?deleteODBoat=true&boat='+boat.boat);
        };

        this.findCloths = function(boat, sail)
        {
					sail = sail.replace('+', '%2B');
        	return $http.get(url + 'boats_GET.php?onedesignCloths=true&boat='+boat+'&sail='+sail);
        };

        return this;
    }]);

'use strict';

angular.module('vsko.stock')

.factory('Orders', ['$http', 'uuid4', function ($http, uuid4) {

		var url = telasAPIUrl;

        this.getOrders = function(status, providerId)
        {
					var providerParam="";
					if(providerId)
						providerParam = '&providerId='+providerId;

        	return $http.get(url + 'orders_GET.php?status='+status+providerParam);
        } ;

        this.buy = function(provider)
        {
        	provider.opId = uuid4.generate();

        	return $http.post(url + 'buy_POST.php', provider);
        };

				this.assignProduct = function(provider, orderId)
        {
        	return $http.post(url + 'buy_POST.php?assignToOrderId='+orderId, provider);
        };

        this.incrementStatus = function(order)
        {
        	return $http.post(url + 'orders_POST.php', order);
        };

        this.partialSave = function(order)
        {
        	// updates some the info section of the order
        	return $http.post(url + 'orders_POST.php?update=true', order);
        };

        this.removeItem = function(orderproduct)
        {
        	// deletes an orden item
        	return $http.delete(url + 'orders_DELETE.php?orderproduct=true&opId='+orderproduct.opId+"&orderId="+orderproduct.orderId+"&productId="+orderproduct.productId);
        };

        this.validate = function(order)
        {
        	// validate order
        	return $http.post(url + 'orders_POST.php?validate=true', order);
        };

				this.updateProductAmount = function(product)
        {
        	// validate order
        	return $http.post(url + 'orders_POST.php?updateProductAmount=true', product);
        };

        this.getRolls = function(productId, orderId)
        {
        	var orderParam = "";
        	if(orderId!=null) {
        		orderParam = "&orderId="+orderId;
        	}

        	return $http.get(url + 'rolls_GET.php?productId='+productId + orderParam);
        };

        this.saveRolls = function(orderProduct)
        {

        	$.each(orderProduct.rolls, function(index){
        		if(!this.id && (this.number && this.lote && this.mts))
        			this.id = uuid4.generate();
        	});

        	return $http.post(url + 'rolls_POST.php', orderProduct);
        };

        this.removeOrder = function(order)
        {
        	// deletes an orden item
        	return $http.delete(url + 'orders_DELETE.php?removeorder=true&orderId='+order.orderId);
        };

        return this;
    }]);

// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Plotters', ['$http', 'uuid4', function ($http, uuid4) {

		var url = telasAPIUrl;

        //-- PLOTTERS --//

        this.getAllPlotters = function(cutted)
        {
        	if(!cutted)
        		cutted = false;

        	return $http.get(url + 'plotters_GET.php?cutted='+cutted);
        };

        this.search = function(input) {

        	return $http.get(url + 'plotters_GET.php?search='+input);
        };

        this.cutted = function(plotter, loggedUser) {

        	// buscar o recibir como param el user logueado
        	plotter.cuttedBy = loggedUser;

        	return $http.post(url + 'plotters_POST.php?cutted=true', plotter);
        };

        this.restore = function(plotter) {

        	return $http.post(url + 'plotters_POST.php?restore=true', plotter);
        };

        this.editObservations = function(plotter) {

        	return $http.post(url + 'plotters_POST.php?edit=true&field=observations', plotter);
        };

        this.editPlotterPrevision = function(plotter, field) {

        	return $http.post(url + 'plotters_POST.php?editPlotterPrevision=true&field='+field, plotter);
        };

        this.removePlotter = function(plotterId) {

        	return $http.delete(url + 'plotters_DELETE.php?removePlotter=true&id='+ plotterId);
        };

        this.restoreToDesign = function(plotter) {

        	return $http.post(url + 'plotters_POST.php?toDesign=true', plotter);
        };

        this.removeManualPlotter = function(manualPlotterId) {

        	return $http.delete(url + 'plotters_DELETE.php?removeManualPlotter=true&id='+ manualPlotterId);
        };

        this.savePlotterCut = function(cut) {

        	if(!cut.id)
        		cut.id = uuid4.generate();

        	return $http.post(url + 'plotters_POST.php?saveCut=true', cut);
        };

        this.removePlotterCut = function(cut) {

        	return $http.delete(url + 'plotters_DELETE.php?cutId='+ cut.id);
        };

        this.getPossibleRolls = function(plotter, cutId)
        {
					var cutIdParam = '';
					if(cutId) {
						cutIdParam = '&cutId=' + cutId;
					}
        	return $http.get(url + 'rolls_GET.php?clothId='+plotter.clothId+'&plotterId='+plotter.id+cutIdParam+'&possibleRolls=true');
        };

        return this;
    }]);

// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Previsions', ['$http', 'uuid4', function ($http, uuid4) {

		var url = telasAPIUrl;

        this.getAll = function(includeDesigned)
        {
					var designedCondition = "";
        	if(!includeDesigned)
        		designedCondition = "designed=false&";

        	return $http.get(url + 'previsions_GET.php?'+designedCondition+'&expand=FULL');
        };

        this.getPrevisions = function(clothId)
        {
        	return $http.get(url + 'previsions_GET.php?clothId='+clothId+'&designed=false&expand=FULL');
        };

        this.save = function(prevision, loggedUser) {

					if(prevision.previsionId) {
						prevision.id = prevision.previsionId;
					}

        	if(!prevision.id)
        		prevision.id = uuid4.generate();

        	$.each(prevision.cloths, function(index){
        		if(!this.cpId)
        			this.cpId = uuid4.generate();
        	});

					prevision.modifiedBy = loggedUser;

        	return $http.post(url + 'previsions_POST.php', prevision);
        };

        this.designed = function(prevision) {

        	return $http.post(url + 'previsions_POST.php?designed=true', prevision);
        };

        this.remove = function(prevision) {

        	return $http.delete(url + 'previsions_DELETE.php?id='+ prevision.id);
        };

        this.updateClothMts = function(cloth) {

        	return $http.post(url + 'previsions_POST.php?updateMts=true', cloth);
        };

        //-- PLOTTERS --//

        this.getAllPlotters = function(cutted)
        {
        	if(!cutted)
        		cutted = false;

        	return $http.get(url + 'plotters_GET.php?cutted='+cutted);
        };

        this.savePlotterCut = function(cut) {

        	if(!cut.id)
        		cut.id = uuid4.generate();

        	return $http.post(url + 'plotters_POST.php?saveCut=true', cut);
        };

        this.removePlotterCut = function(cut) {

        	return $http.delete(url + 'plotters_DELETE.php?cutId='+ cut.id);
        };

        this.getPossibleRolls = function(plotter)
        {
        	return $http.get(url + 'rolls_GET.php?clothId='+plotter.clothId+'&possibleRolls=true');
        };


        this.saveManualPlotter = function(plotter) {

        	if(!plotter.id)
        		plotter.id = uuid4.generate();

        	return $http.post(url + 'plotters_POST.php?manualPlotter=true', plotter);
        };

				this.editObservations = function(prevision) {

        	return $http.post(url + 'previsions_POST.php?edit=true&field=observations', prevision);
        };

				this.updatePrevisionState = function(clothIds) {

        	return $http.post(url + 'previsions_POST.php?updatePrevisionState=true&clothIds='+clothIds, clothIds);
        };

				this.updateAllPrevisionsStates = function() {

        	return $http.post(url + 'previsions_POST.php?updateAllPrevisionsStates=true', {});
        };

				this.acceptStateChange = function(prevision) {

        	return $http.post(url + 'previsions_POST.php?acceptStateChange=true', prevision);
        };

        return this;
    }]);

// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Stock', ['$http', '$q', 'uuid4', function ($http, $q, uuid4) {

		var url = telasAPIUrl;

        this.getAllGroups = function()
        {
        	return $http.get(url + 'groups_GET.php?expand=FULL');
        };

        this.idp = function()
        {
//        	return $http.post('http://testproefidp.vvkbao.be/idp/api/enscriptions', {test:'test', input:'inputTests'});
//        	return $http.post('http://testproefidp.vvkbao.be/idp/alive', "{test:'test', input:'inputTests'}");
//        	return $http.post('http://testproefidp.vvkbao.be/idp/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

//		return $http.post('http://localhost:8080/idp/alive?input=test');
        	//return $http.post('http://testproefidp.vvkbao.be/idp/alive?input=test');
//        	return $http.get('http://testproefidp.vvkbao.be/idp/alive?input=test');

//		return $http.post('http://localhost:8080/files/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

//        	return $http.post('http://eznibe.no-ip.biz/files/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

//        	return $http.post('http://accfiles.vsko.be/files/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

	//	return $http.post('http://testdavid.vsko.be/david/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

//        	return $http.post('http://testwerkgroepen.vsko.be/alive?input=Belgi%C3%AB', {'test':'test', 'input':'inputTests'});
        	return $http.get('http://testwerkgroepen.vsko.be/alive?input=Belgi%C3%AB');
        };

        this.alive = function() {
        	$http({method: 'GET', url: 'http://testwerkgroepen.vsko.be/alive?input=Belgie', timeout: 7000}).
//        	$http({method: 'GET', url: 'http://localhost:8080/alive?input=Belgie', timeout: 7000}).
            success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                if(data && data.$$meta) {
                    console.log('Succesful OK');
                } else {
                	console.log('Succesful OK, but check');
                }
            }).
            error(function (data, status, headers, config) {
            	console.log('Error in something');
            });
        };

        this.cors = function() {
//        	$http({method: 'GET', url: 'http://testwerkgroepen.vsko.be/alive?input=Belgie&managedBy=/persons/cf2dccb1-3056-4402-e044-d4856467bfb8', timeout: 7000, headers: {'Authorization': 'Bearer K3zvWqpDzlq7tLCjWvihhp2N4qPzUZu4bVtu6GerPhoWVMQ9gZyagwdhhMtAr/D/D4522sa3okT/57vqovwNDTu2ndnI1iUNr9cuEuE3ASDhuv81+Ea3yZCHrT/ZP/VDGxC3gcyqJhXbIpGY4FKteQ=='}}).
        	$http({method: 'GET', url: 'http://testapi.vsko.be/workgroups?offset=30', timeout: 7000, headers: {'Authorization': 'Bearer O4v8L2NF1mymozGYaISC0owbIApDBdeeMm9BnhYzrRja8OSpdP0Qr3AKSctKRNRXXNFtUzGXqyu7JUDNDBkdXyOP2cYCl4r0euZtnPZXaSXn8IsN4HDBQvzA7/OQw+M5vyEncEq5nKI='}}).
//        	$http({method: 'GET', url: 'http://api.vsko.be/workgroups?offset=30', timeout: 7000, headers: {'Authorization': 'Bearer K3zvWqpDzlq7tLCjWvihhp2N4qPzUZu4bVtu6GerPhoWVMQ9gZyagwdhhMtAr/D/D4522sa3okT/57vqovwNDTu2ndnI1iUNr9cuEuE3ASDhuv81+Ea3yZCHrT/ZP/VDGxC3gcyqJhXbIpGY4FKteQ=='}}).
            success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                if(data && data.$$meta) {
                    console.log('Succesful OK');
                } else {
                	console.log('Succesful OK, but check');
                }
            }).
            error(function (data, status, headers, config) {
            	console.log('Error in something');
            });
        };

        this.getGroup = function(groupId, expansion)
        {
        	return $http.get(url + 'groups_GET.php?id='+groupId+'&expand='+expansion);
        };

        this.getAllCloths = function()
        {
        	return $http.get(url + 'cloths_GET.php?expand=FULL');
        };

        this.getProviders = function(clothId)
        {
        	return $http.get(url + 'providers_GET.php?clothId='+clothId+'&expand=FULL');
        };

        this.saveCloth = function(cloth)
        {
        	if(!cloth.id) {
        		cloth.id = uuid4.generate();
        		cloth.isNew = true;
        	}

        	return $http.post(url + 'cloths_POST.php', cloth);
        };

				this.deleteCloth = function(cloth) {

					return $http.delete(url + 'cloths_DELETE.php?clothId='+ cloth.id);
				};

        this.getDjai = function(djai, expansion)
        {
        	return $http.get(url + 'djais_GET.php?djaiNumber='+escape(djai.number)+'&expand='+expansion);
        };

        this.saveDjai = function(djai)
        {
        	$.each(djai.cloths, function(index){
        		if(!this.djaiId)
        			this.djaiId = uuid4.generate();
        	});

        	return $http.post(url + 'djais_POST.php', djai);
        };

        this.getDolar = function()
        {
        	return $http.get(url + 'cloths_GET.php?dolar=true');
        };

        this.saveDolar = function(value)
        {
        	var dolar = {value: value};
        	return $http.post(url + 'cloths_POST.php?dolar=true', dolar);
        };

				this.getPctNac = function()
        {
        	return $http.get(url + 'cloths_GET.php?pctNac=true');
        };

				this.savePctNac = function(value)
        {
        	var pctNac = {value: value};
        	return $http.post(url + 'cloths_POST.php?pctNac=true', pctNac);
        };

        this.getAllProviders = function()
        {
        	return $http.get(url + 'providers_GET.php?expand=FULL');
        };

        this.saveNewProduct = function(newProduct)
        {
        	newProduct.productId = uuid4.generate();

        	if(!newProduct.provider.id)
        		newProduct.provider.id = uuid4.generate();

        	return $http.post(url + 'providers_POST.php', newProduct);
        };

        this.getAllSails = function()
        {
        	return $http.get(url + 'sails_GET.php?expand=FULL');
        };

        this.getAllBoats = function()
        {
        	return $http.get(url + 'boats_GET.php?expand=FULL');
        };

        this.getClothRolls = function(clothId, onlyAvailables)
        {
        	return $http.get(url + 'lists_GET.php?clothRolls=true&clothId='+clothId+"&onlyAvailables="+onlyAvailables);
        };

        this.updateProductCode = function(product)
        {
        	return $http.post(url + 'providers_POST.php?updateCode=true', product);
        };

        this.updateProductPrice = function(product)
        {
        	return $http.post(url + 'providers_POST.php?updatePrice=true', product);
        };

        this.updateRollType = function(roll)
        {
        	return $http.post(url + 'rolls_POST.php?updateType=true', roll);
        };

        this.updateRollField = function(roll, rollField, value)
        {
        	return $http.post(url + 'rolls_POST.php?updateField='+rollField+'&value='+value, roll);
        };

        this.updateProviderName = function(provider)
        {
        	return $http.post(url + 'providers_POST.php?updateName=true', provider);
        };

        this.saveManualRoll = function(roll)
        {
        	roll.id = uuid4.generate();

        	return $http.post(url + 'rolls_POST.php?manualRoll=true', roll);
        };

				this.saveGroup = function(group)
        {
        	return $http.post(url + 'groups_POST.php', group);
        };

        return this;
    }]);

'use strict';

angular.module('vsko.stock')

.factory('Users', ['$http', 'uuid4', function ($http, uuid4) {

				var url = telasAPIUrl;

        this.login = function(user, passw)
        {

        	var data = {user: user, passw: passw};

        	return $http.post(url + 'login_POST.php', data);
        };

        this.getAllUsers = function() {
        	return $http.get(url + 'users_GET.php');
        } ;

        this.getUser = function(userId) {
        	return $http.get(url + 'users_GET.php?id='+userId);
        } ;

				// Only users that did at least one plotter cut
				this.getPlotterUsers = function() {
        	return $http.get(url + 'users_GET.php?plotter=true');
        } ;

        this.getRoles = function() {
        	return $http.get(url + 'users_GET.php?roles=true');
        } ;

        this.save = function(user) {

        	if(!user.id) {
        		user.id = uuid4.generate();
        	}

        	return $http.post(url + 'users_POST.php', user);
        };

        this.deleteUser = function(user) {

        	return $http.delete(url + 'users_DELETE.php?id='+ user.id);
        };

        return this;
    }]);

/**
 * Created by matthias.snellings on 10/07/2014.
 */
angular.module('vsko.stock').factory('Utils',[ '$translate', function ($translate) { //eslint-disable-line
  var that = {};

  that.showMessage = function (key, type, params) {
    $translate(key, params ? params : {}).then(function(value) {
      $.notify(value, {className: type ? type : 'success', globalPosition: "bottom right"});
    });
  };

  return that;
}]);

'use strict';

angular.module('vsko.stock').controller('BetweenDatesCtrl', ['$scope', 'Stock', 'Lists', 'Users', '$modal', function ($scope, Stock, Lists, Users, $modal) {

				Stock.getAllCloths().then(function(result) {
					$scope.cloths = result.data;
				});

				Users.getPlotterUsers().then(function(result) {
					$scope.users = result.data;
				});

				Stock.getAllProviders().then(function(result) {
					$scope.providers = result.data;
				});

				Stock.getAllGroups().then(function(result) {
					$scope.groups = result.data;
				});

    		// initial filter options
        $scope.filter = {};
        $scope.filter.types = [{name:'Consumos', type: 'plotters', id:'TYPE_PLOTTERS'},
                               {name:'Ingresos', type: 'orders', id:'TYPE_ORDERS'},
                               {name:'Todos', type: 'all', id:'TYPE_BOTH'}];
        $scope.filter.selectedType = $scope.filter.types[0];
        $scope.filter.type = $scope.filter.types[0].id;

				var optionsPlotters = [{name:'Tela', id:'OPTION_CLOTH'},
															 {name:'Grupo', id:'OPTION_GROUP'},
															 {name:'Proveedor', id:'OPTION_PROVIDER'},
															 {name:'Usuario', id:'OPTION_USER'}];
			 	var optionsOrders = [{name:'Tela', id:'OPTION_CLOTH'},
														 {name:'Grupo', id:'OPTION_GROUP'},
														 {name:'Proveedor', id:'OPTION_PROVIDER'},
														 {name:'Nr. factura', id:'OPTION_INVOICE'}];
				var optionsBoth = [{name:'Tela', id:'OPTION_CLOTH'}];

        $scope.filter.options = optionsPlotters;
        $scope.filter.selectedOption = $scope.filter.options[0];

				$scope.filter.groupByOptions = [{name:'Tela', id:'GROUP_BY_CLOTH'}];
        //$scope.filter.selectedGroupByOption = $scope.filter.groupByOptions[0];


        $scope.search = function() {

        	$scope.filter.type = $scope.filter.selectedType.id;
					var groupBy = ($scope.filter.selectedGroupBy && $scope.filter.selectedGroupBy.id) ? $scope.filter.selectedGroupBy.id : null;

					$scope.filter.searchedWithGroupBy = groupBy;

       		Lists.betweenDates($scope.filter, $scope.filter.selectedType.type, groupBy).then(function(result) {
       			$scope[$scope.filter.selectedType.type] = result.data;
        	});
        };

        $scope.showRolls = function(rolls) {

	    		var toStringRolls = "";

	    		$.each(rolls, function(idx, r){
	    			toStringRolls += "("+r.number+" / "+r.lote+") ";
	        	});

	    		return toStringRolls;
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

'use strict';

angular.module('vsko.stock').controller('ClothsPriceCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

			Stock.getAllGroups().then(function(result) {

				$scope.groups = result.data;
			});

			Lists.getPrices(null).then(function(result) {

				$scope.cloths = result.data;
			});

    	$scope.filter = function(selectedGroup) {

	    		Lists.getPrices($scope.filter.selectedGroup).then(function(result) {

        		$scope.cloths = result.data;
        	});
    	};

}]);

'use strict';

angular.module('vsko.stock').controller('ClothsStockCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

			Stock.getAllGroups().then(function(result) {

				$scope.groups = result.data;
			});

    	$scope.filter = function(selectedGroup) {

				$scope.filter.pastAvailability = $scope.filter.upToDate;

				if($scope.filter.selectedGroup) {

						if($scope.filter.upToDate) {
							Lists.stockUpToDate($scope.filter.selectedGroup.id, $scope.filter.upToDate).then(function(result) {
								$scope.cloths = result.data;
							});
						}
						else {
			    		Stock.getGroup($scope.filter.selectedGroup.id, 'WITH_ROLLS').then(function(result) {

		        		$scope.cloths = result.data.cloths;
		        		divideRollsByState($scope.cloths);
		        	});
						}
				}
    	};

    	$scope.sumStock = function(cloth) {

				var providers = cloth.providers;

				if(!cloth.providers)
					return 0;

      	var sum = 0;

      	$.each(providers, function(idx, p){
      		sum += new Number(p.stock);
      	});

      	return sum;
      };


      function divideRollsByState(cloths) {

					if(!cloths)
						return;

    			$.each(cloths, function(idx, c){

	    			c.rollsAvailable = new Array();
	    			c.rollsInTransit = new Array();

	    			$.each(c.rolls, function(idx, r){

	    				r.incoming == '1' ? c.rollsInTransit.push(r) : c.rollsAvailable.push(r);
	    			});
        	});
      }
}]);

'use strict';

angular.module('vsko.stock').controller('ClothsValuedStockCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

			Stock.getAllGroups().then(function(result) {

				$scope.groups = result.data;
			});

			var d = new Date();
			$scope.filter = { upToDate: (d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear()) };

    	$scope.doFilter = function(selectedGroup) {

				if($scope.filter.selectedGroup && $scope.filter.upToDate) {

					Lists.stockUpToDate($scope.filter.selectedGroup.id, $scope.filter.upToDate, true).then(function(result) {
						$scope.cloths = result.data;
						$scope.filter.searched = true;
					});
				}
    	};

    	$scope.sumStock = function(cloth) {

				var providers = cloth.providers;

				if(!cloth.providers)
					return 0;

      	var sum = 0;

      	$.each(providers, function(idx, p){
      		sum += new Number(p.stock);
      	});

      	return sum;
      };

			$scope.sumPrevision = function(cloth) {

				var sum = 0;

				$.each(cloth.previsions, function(idx, p){
					sum += new Number(p.mts);
				});

				return sum;
			};

			$scope.sumPending = function(cloth) {

				var sum = 0;

				if(!cloth || !cloth.previsions || !cloth.plotters)
					return sum;

				$.each(cloth.plotters, function(idx, pl){
					var res = cloth.previsions.findAll({id:pl.previsionId});
					if(res && res.length==0) {
						sum += new Number(pl.mtsDesign);
					}
				});

				return sum;
			};

			$scope.sumTemporary = function(cloth) {

				var sum = 0;

				$.each(cloth.rollsAvailable, function(idx, r){
						if(r.type == 'TEMP')
							sum += new Number(r.mts);
				});

				return sum;
			};

			$scope.sumInTransit = function(cloth) {

				var sum = 0;

				if(!cloth || !cloth.ordersInTransit || cloth.ordersInTransit.length==0)
					return sum;

				$.each(cloth.ordersInTransit, function(idx, o){

					$.each(o.products, function(idx, p){
						if(p.clothId == cloth.clothId)
							sum += new Number(p.amount);
					});
				});

				return sum;
			};

			$scope.delta = function(c) {
				return c.sumAvailable - $scope.sumPrevision(c) - $scope.sumPending(c);
			};

			$scope.deltaWithTransit = function(c) {
				return c.sumAvailable - $scope.sumPrevision(c) - $scope.sumPending(c) + $scope.sumInTransit(c);
			};

			$scope.sumTotalValued = function() {

				var sum = 0;

				if($scope.filter.searched) {
					$.each($scope.cloths, function(idx, c){

						var total = (c.price * c.sumAvailable).toFixed(2);
						sum += new Number(total);
					});
				}

				return sum.toFixed(2);
			};

			$scope.sumDeltaValued = function(positives) {

				var sum = 0;

				if($scope.filter.searched) {
					$.each($scope.cloths, function(idx, c){

						if(positives && $scope.delta(c) > 0) {
							sum += new Number($scope.delta(c) * c.price);
						}
						else if(!positives && $scope.delta(c) < 0) {
							sum += new Number($scope.delta(c) * c.price);
						}
					});
				}

				if(!positives) {
					sum = sum * -1;
				}

				return sum.toFixed(2);
			};

			$scope.sumDeltaWithTransitValued = function() {

				var sum = 0;

				if($scope.filter.searched) {
					$.each($scope.cloths, function(idx, c){
							sum += new Number($scope.deltaWithTransit(c) * c.price);
					});
				}

				return sum.toFixed(2);
			};

			$scope.stock0 = function(c) {
				// exclude thos with stock available 0 but also the pending/transit/plotter should be 0
				return c.sumAvailable > 0 || $scope.delta(c) !== 0 || $scope.deltaWithTransit(c) !== 0 || $scope.sumTemporary(c) !== 0;
			}

      function divideRollsByState(cloths) {

					if(!cloths)
						return;

    			$.each(cloths, function(idx, c){

	    			c.rollsAvailable = new Array();
	    			c.rollsInTransit = new Array();

	    			$.each(c.rolls, function(idx, r){

	    				r.incoming == '1' ? c.rollsInTransit.push(r) : c.rollsAvailable.push(r);
	    			});
        	});
      }
}]);

'use strict';

angular.module('vsko.stock').controller('OldPrevisionsCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

	Stock.getAllCloths().then(function(result) {
		$scope.cloths = result.data;
	});
	
	
	$scope.fillClothsPlottersHistory = function(cloth) {
		
		Lists.clothPlottersHistory(cloth).then(function(result){
			
			$scope.plotters = result.data;
		});
	};
	
	$scope.showRolls = function(rolls) {
		
		var toStringRolls = "";
		
		$.each(rolls, function(idx, r){
			toStringRolls += "("+r.number+" / "+r.lote+") ";
    	});
		
		return toStringRolls;
	};
        
}]);


'use strict';

angular.module('vsko.stock').controller('RollsCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

    	Lists.getAllRolls(true).then(function(result) {
    		$scope.rolls = result.data;
    	});
    	
    	Stock.getAllCloths().then(function(result) {
    		$scope.cloths = result.data;
    	});
    
    	
    	$scope.rollSelected = function(roll) {
    		
    		if(roll) {
	    		$scope.filter.selectedLote = {};
	    		
	    		Lists.getRollLotes(roll).then(function(result) {
	        		$scope.lotes = result.data;
	        		
	        		if($scope.lotes.length==1) {
	        			$scope.filter.selectedLote = $scope.lotes[0]; 
	        		}
	        	});
    		}
    		else {
    			$scope.lotes = [];
    			$scope.filter.selectedLote = null;
    		}
    	};
    	
    	$scope.search = function() {
    		
    		if($scope.filter.selectedLote || $scope.filter.selectedCloth) {
    			
    			var roll = $scope.filter.selectedLote;
    			var cloth = $scope.filter.selectedCloth;
    			
    			Lists.getRollCuts(roll, cloth).then(function(result) {
            		$scope.plotters = result.data;
            	});
    		}
    	};
    	
}]);


'use strict';

angular.module('vsko.stock').controller('UnderStockCtrl', ['$scope', 'Stock', '$modal', function ($scope, Stock, $modal) {

		Stock.getAllCloths().then(function(result) {
    		
    		$scope.cloths = getUnderStock(result.data);
    	});

		Stock.getAllGroups().then(function(result) {
			
			$scope.groups = result.data;
		});
		
    	
    	$scope.filterByGroup = function(selectedGroup) {
    		
			if(selectedGroup) {
	    		Stock.getGroup(selectedGroup.id, 'FULL').then(function(result) {
	        		
	        		$scope.cloths = getUnderStock(result.data.cloths);
	        	});
			}
			else {
				Stock.getAllCloths().then(function(result) {
		    		
		    		$scope.cloths = getUnderStock(result.data);
		    	});
			}
    	};
    	
    	$scope.sumStock = function(providers) {
        	
        	var sum = 0;
        	
        	$.each(providers, function(idx, p){
        		sum += new Number(p.stock);
        	});
        	
        	return sum; 
        };
        
        $scope.sumPrevision = function(cloth) {
        	
        	var sum = 0;
        	
        	$.each(cloth.previsions, function(idx, p){
        		
        		$.each(p.cloths, function(idx2, c){
        			
        			if(c.clothId == cloth.id)
        				sum += new Number(c.mts);
        		});
        	});
        	
        	return sum; 
        };
        
        $scope.sumPending = function(cloth) {
        	
        	var sum = 0;
        	
        	$.each(cloth.plotters, function(idx, p){
        		sum += new Number(p.mtsDesign);
        	});
        	
        	return sum; 
        };
        
        
        function getUnderStock(cloths) {

        	var underStockCloths = new Array();
    		
    		$.each(cloths, function(idx, c){
    			if($scope.sumStock(c.providers) < c.stockMin) {
    				underStockCloths.push(c);
    			}
        	});
    		
    		return underStockCloths;
        }
}]);


'use strict';

angular.module('vsko.stock')

.directive('confirmModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;
        	  
        	  
        	  $scope.showConfirmDeleteModal = function(selected, callbackFn) {
        		  
        		  $scope.selected = selected;
        		  
        		  if(callbackFn)
        			  callback = callbackFn;
        		  
                  $scope.modalConfirm = $modal({template: 'views/modal/confirmDelete.html', show: false, scope: $scope, callback: callback, backdrop:'static'});

                  $scope.modalConfirm.$promise.then($scope.modalConfirm.show);
        	  };
        	  
        	  $scope.showConfirmModal = function(selected, callbackFn) {
        		  
        		  $scope.selected = selected;
        		  
        		  if(callbackFn)
        			  callback = callbackFn;
        		  
                  $scope.modalConfirm = $modal({template: 'views/modal/confirm.html', show: false, scope: $scope, callback: callback, backdrop:'static'});

                  $scope.modalConfirm.$promise.then($scope.modalConfirm.show);
        	  };
        	  
              $scope.confirm = function() {

            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;
            	  
            	  if(typeof($scope.modalConfirm.$options.callback) == "function") {
            		  $scope.modalConfirm.$options.callback(param);
            	  }
            	  else {
            		  $scope[$scope.modalConfirm.$options.callback](param);
              	  }
            	  
            	  $scope.modalConfirm.hide();
              };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('clothDjaisModal', function($modal, Previsions) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  
       		  $scope.showClothDjaisModal = function(cloth) {
            		  
        		  $scope.cloth = cloth;
              	
        		  
                  $scope.modalDjais = $modal({template: 'views/modal/clothDjais.html', show: false, scope: $scope});

                  $scope.modalDjais.$promise.then($scope.modalDjais.show);
        	  };
        	  
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('clothInTransitModal', function($modal, Orders, orderStatus) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  
        	  $scope.showClothInTransitModal = function(cloth) {
        		  
        		  $scope.cloth = cloth;
              	
              	  Orders.getOrders(orderStatus.in_transit).then(function(result) {
              		  var orders = result.data;
              		  $scope.clothInTransitOrders = new Array();
              		  
              		  $.each(orders, function(index){
              			  
              			  var order = this;
              			  $.each(order.products, function(idx){
              				  
              				  if(this.clothId == cloth.id) {
              					  $scope.clothInTransitOrders.push(order);
              					  order.amount = this.amount;
              				  }
              				  
              				  order.unformattedArriveDate = new Date(order.unformattedArriveDate);
              			  });
              		  });
              	  });
              	
              	
                  $scope.modalInTransit = $modal({template: 'views/modal/clothInTransit.html', show: false, scope: $scope});

                  $scope.modalInTransit.$promise.then($scope.modalInTransit.show);
        	  };
        	  
        	  $scope.setModalCtrl = function(modalCtrl) {
              	
              	$scope.modalCtrl = modalCtrl;
              };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('clothModal', function($modal, Utils, Stock, Orders, orderStatus) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  /*$scope.pctNac = 1.45; // TODO move to constants*/
            Stock.getPctNac().then(function(result){
        		  $scope.pctNac = new Number("1." + result.data[0].value);
        	  });

        	  Stock.getDolar().then(function(result){
        		  $scope.dolar = result.data[0].value;
        	  });

        	  $scope.showClothModal = function(cloth) {

        		  if(cloth) {
	        		  $scope.cloth = cloth;

	              	  Stock.getProviders(cloth.id).then(function(result){
	              		  $scope.cloth.providers = result.data;
	              	  });
        		  }
        		  else {
        			  $scope.cloth = {};
        		  }

          	  Stock.getAllGroups().then(function(result){
          		  $scope.groups = $scope.groups ? $scope.groups : result.data;

          		  $.each($scope.groups, function(index, value){

          			  if($scope.groups[index].id == $scope.cloth.groupId) {
          				  $scope.cloth.selectedGroup = $scope.groups[index];
          			  }
          		  });

          		  if(!$scope.cloth.id) {
          			  // new cloth default first group
          			  $scope.cloth.selectedGroup = $scope.groups[0];
          		  }
          	  });

              $scope.modalCloth = $modal({template: 'views/modal/cloth.html', show: false, scope: $scope});

              $scope.modalCloth.$promise.then($scope.modalCloth.show);
        	  };

        	  $scope.saveCloth = function(cloth) {

              console.log('Saving cloth');

        		  cloth.groupId = cloth.selectedGroup ? cloth.selectedGroup.id : null;

              cloth.selectedGroup = null;

        		  Stock.saveCloth(cloth).then(function(result){

                $scope.modalCloth.hide();

                Utils.showMessage('notify.saved_changes');

        			  Stock.getAllGroups().then(function(result){
        				    // refresh groups because of possible modification in the cloth group
                  	$scope.groups = result.data;
                });
        		  });
        	  };

            $scope.deleteCloth = function(cloth) {

              Stock.deleteCloth(cloth).then(function(result){

                if(result.data.successful) {

                  $scope.cloths.remove(cloth);

                  $scope.modalCloth.hide();

                  Utils.showMessage('notify.cloth_deleted');
                }
              });
            };

        	  $scope.showBuyModal= function(provider) {

              	// init selected cloth provider
        		    $scope.provider = provider;

                $scope.filter = {orderTypes: [{id: 'TO_CONFIRM', name: 'A confirmar'}, {id: 'IN_TRANSIT', name: 'En transito'}]};
                $scope.filter.selectedOrderType = $scope.filter.orderTypes[0];

                Orders.getOrders(orderStatus.to_confirm, provider.id).then(function(result){
                  $scope.ordersToConfirm = result.data;

                  $.each($scope.ordersToConfirm, function(idx, o){
                		o.description = o.provider + ' ' + o.orderDate + ' (' + o.products.length + ') - #'+o.number;
                	});
                });

                Orders.getOrders(orderStatus.in_transit, provider.id).then(function(result){
                  $scope.ordersInTransit = result.data;

                  $.each($scope.ordersInTransit, function(idx, o){
                		o.description = o.provider + ' ' + o.orderDate + ' (' + o.products.length + ') - #'+o.number;
                	});
                });

        		    $scope.modalCloth.hide();

                $scope.modalBuy = $modal({template: 'views/modal/buy.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

                $scope.modalBuy.$promise.then($scope.modalBuy.show);
            };

            $scope.buy = function(amount) {

            	  $scope.modalBuy.hide();

            	  $scope.provider.amount = amount;

                // we need to identify if it should create a new order or assign the new buy to a existent order
                if(!($scope.filter.selectedOrder && $scope.filter.selectedOrder.orderId)) {

              	  Orders.buy($scope.provider).then(function(result){

              		  // show feedback message
                    if(result.data.successful) {
                      Utils.showMessage('notify.buy_amount', 'success', {amount: amount});
                    }
                    else {
                      Utils.showMessage('notify.buy_failed', 'error');
                    }
              	  });
                }
                else {
                  Orders.assignProduct($scope.provider, $scope.filter.selectedOrder.orderId).then(function(result){

              		  // show feedback message
                    if(result.data.successful) {
                      Utils.showMessage('notify.buy_assigned', 'success', {orderNumber: scope.filter.selectedOrder.number});
                    }
                    else {
                      Utils.showMessage('notify.buy_assign_failed', 'error');
                    }
              	  });
                }
            };

            $scope.toPriceNac = function(price) {

            	  return (price * $scope.pctNac).toFixed(2) ;
              };

              $scope.toPriceRef = function(price) {

            	  return (price * $scope.pctNac * $scope.dolar).toFixed(2);
              };

              $scope.sumDjai = function(cloth) {
            	  return sumDjai(cloth);
              };

              $scope.sumStock = function(providers) {

            	 if(!providers)
            		 return 0;

              	var sum = 0;

              	$.each(providers, function(idx, p){
              		sum += new Number(p.stock);
              	});

              	return sum;
              };

              $scope.changedCode = function(product) {

          		  Stock.updateProductCode(product).then(function(result){

          			  console.log("Changed product code to "+product.code);
          		  });
          	  };

              $scope.changedPrice = function(product) {

          		  Stock.updateProductPrice(product).then(function(result){

          			  console.log("Changed price to "+product.price);
          		  });
          	  };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('clothPendingsModal', function($modal, Previsions) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;


        	  $scope.showClothPendingsModal = function(cloth) {

        		  $scope.cloth = cloth;


                  $scope.modalPendings = $modal({template: 'views/modal/clothPendings.html', show: false, scope: $scope});

                  $scope.modalPendings.$promise.then($scope.modalPendings.show);
        	  };

            $scope.acceptStateChange = function(p) {
              Previsions.acceptStateChange(p).then(function() {
                $.notify("Cambio de estado aceptado.", {className: "success", globalPosition: "bottom right"});
                p.stateAccepted = '1';
              });
            };

          }
    };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('clothPrevisionsModal', function($modal, Utils, Previsions) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;


        	  $scope.showClothPrevisionsModal = function(cloth) {

        		  $scope.cloth = cloth;

          	  Previsions.getPrevisions(cloth.id).then(function(result) {
          		  $scope.cloth.previsions = result.data;
          	  });

              $scope.modalPrevisions = $modal({template: 'views/modal/clothPrevisions.html', show: false, scope: $scope});

              $scope.modalPrevisions.$promise.then($scope.modalPrevisions.show);
        	  };

            $scope.acceptStateChange = function(p) {
              Previsions.acceptStateChange(p).then(function() {
                Utils.showMessage('notify.state_accepted_prevision');
                p.stateAccepted = '1';
              });
            };
          }
    };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('clothRollsModal', function($modal, Stock, orderStatus) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  
        	  $scope.showClothRollsModal = function(cloth) {
        		  
        		  $scope.cloth = cloth;
              	
              	  Stock.getClothRolls(cloth.id, true).then(function(result) {
              		  $scope.rolls = result.data;
              		  
              		  $scope.availableRolls = $scope.rolls.findAll(function(r) {
	              			  return r.incoming == '0'; 
              		  });
              		  
              		  $scope.inTransitRolls = $scope.rolls.findAll(function(r) {
            			  return r.incoming == '1'; 
              		  });
              	  });
              	
              	
                  $scope.modalRolls = $modal({template: 'views/modal/clothRolls.html', show: false, scope: $scope});

                  $scope.modalRolls.$promise.then($scope.modalRolls.show);
        	  };
        	  
        	  $scope.setModalCtrl = function(modalCtrl) {
              	
              	$scope.modalCtrl = modalCtrl;
              };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('confirmCutModal', function($modal, Stock) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;


        	  $scope.showCutConfirmModal = function(selected, callbackFn) {

        		  $scope.selected = selected;

        		  if(callbackFn)
        			  callback = callbackFn;

        		  var d = new Date();
        		  $scope.cut = {date: (d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear())};

              $scope.modalCutConfirm = $modal({template: 'views/modal/confirmCut.html', show: false, scope: $scope, callback: callback, backdrop:'static'});

              $scope.modalCutConfirm.$promise.then($scope.modalCutConfirm.show);
        	  };

              $scope.confirmCut = function() {

            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;

            	  param.cutDate = $scope.cut.date;

            	  if(typeof($scope.modalCutConfirm.$options.callback) == "function") {
            		  $scope.modalCutConfirm.$options.callback(param);
            	  }
            	  else {
            		  $scope[$scope.modalCutConfirm.$options.callback](param);
              	  }

            	  $scope.modalCutConfirm.hide();
              };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('confirmModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;
        	  
        	  
        	  $scope.showConfirmDeleteModal = function(selected, callbackFn) {
        		  
        		  $scope.selected = selected;
        		  
        		  if(callbackFn)
        			  callback = callbackFn;
        		  
                  $scope.modalConfirm = $modal({template: 'views/modal/confirmDelete.html', show: false, scope: $scope, callback: callback, backdrop:'static'});

                  $scope.modalConfirm.$promise.then($scope.modalConfirm.show);
        	  };
        	  
        	  $scope.showConfirmModal = function(selected, callbackFn) {
        		  
        		  $scope.selected = selected;
        		  
        		  if(callbackFn)
        			  callback = callbackFn;
        		  
                  $scope.modalConfirm = $modal({template: 'views/modal/confirm.html', show: false, scope: $scope, callback: callback, backdrop:'static'});

                  $scope.modalConfirm.$promise.then($scope.modalConfirm.show);
        	  };
        	  
              $scope.confirm = function() {

            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;
            	  
            	  if(typeof($scope.modalConfirm.$options.callback) == "function") {
            		  $scope.modalConfirm.$options.callback(param);
            	  }
            	  else {
            		  $scope[$scope.modalConfirm.$options.callback](param);
              	  }
            	  
            	  $scope.modalConfirm.hide();
              };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('confirmRemovePlotterModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  var callbackDelete = attrs.callback;
        	  var callbackRestore = attrs.callback2;
        	  var params = attrs.params;
        	  var index = attrs.index;
        	  
        	  
        	  $scope.showRemovePlotterConfirmModal = function(selected, callbackFnRestore, callbackFnDelete) {
        		  
        		  $scope.selected = selected;
        		  
        		  if(callbackFnRestore)
        			  callbackRestore = callbackFnRestore;
        		  
        		  if(callbackFnDelete)
        			  callbackDelete = callbackFnDelete;
        		  
                  $scope.modalRemovePlotterConfirm = $modal({template: 'views/modal/confirmRemovePlotter.html', show: false, scope: $scope, callback: {callbackRestore: callbackRestore, callbackDelete: callbackDelete}, backdrop:'static'});

                  $scope.modalRemovePlotterConfirm.$promise.then($scope.modalRemovePlotterConfirm.show);
        	  };
        	  
              $scope.confirmForPlotter = function(type) {

            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;
            	  
            	  if(typeof($scope.modalRemovePlotterConfirm.$options.callback['callback'+type]) == "function") {
            		  $scope.modalRemovePlotterConfirm.$options.callback['callback'+type](param);
            	  }
            	  else {
            		  $scope[$scope.modalRemovePlotterConfirm.$options.callback['callback'+type]](param);
              	  }
            	  
            	  $scope.modalRemovePlotterConfirm.hide();
              };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('djaiModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;

        	  
        	  $scope.showDjaiModal = function(djai, previousModal) {
              	
        		  if(!djai) {
        			  $scope.djai = {};
        			  $scope.origDjai = {};
        			  
        			  if(!$scope.djai.cloths || $scope.djai.cloths.length == 0) {
            			  // init with one cloth empty, useful for creating new djai
                      	  $scope.djai.cloths = new Array();
//                      	  $scope.djai.cloths.push({});
                      }
        			  
        			  Stock.getAllCloths().then(function(result) { $scope.allCloths = result.data; });
        		  }
        		  else {
        			  
        			  Stock.getDjai(djai, 'FULL').then(function(result){
        				  
//        				  $scope.djai = $.extend(true, djai, result.data);
        				  $scope.djai = result.data;
        	              	
                		  $scope.origDjai = $.extend(true, {}, $scope.djai); // used when the user cancel the modifications (close the modal)
                      	
                		  if(!$scope.allCloths) {
                			  
            	        	  Stock.getAllCloths().then(function(result) {
            	        		  $scope.allCloths = result.data;
            	        		  
            	        		  loadSelectedCloth($scope.allCloths);
            	          	  });
                    	  }
                		  else {
	                		  loadSelectedCloth($scope.allCloths);
                		  }
        			  });
        		  }
              	
              	

              	  $scope.modalDjai = $modal({template: 'views/modal/djai.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

                  $scope.modalDjai.$promise.then($scope.modalDjai.show);
                  
                  
                  if(previousModal) {
        			  $scope.previousModal = previousModal;
        			  previousModal.hide();
        		  }
              };
        	  
              $scope.addCloth = function() {
            	  $scope.djai.cloths.push({});
              };
              
              $scope.removeCloth = function(index) {
            	  $scope.djai.cloths.splice(index, 1);
              	
              	  if($scope.djai.cloths.length==0) {
//              		  $scope.djai.cloths.push({});
              	  }
              };
              
              $scope.save = function() {
              
            	  // save changes in each cloth (extending current values only if a new cloth was selected)
              	  $scope.djai.cloths.each(function( item ) {
              		if(item.selectedCloth && item.id != item.selectedCloth.id) {
              			$.extend(item, item.selectedCloth);
              			//item.id = item.selectedCloth.id; // when the cloth is new the previsionid is not set, other cases will have no effect
              		}
              	  });

              	  
              	  Stock.saveDjai($scope.djai).then(function(result) {
              		  
              		  if(result.data.successful && result.data.isNew) {
              			
              			  //$scope.djais.push($scope.djai);
              		  }
              	  });
              	
              	  
              	  $scope.modalDjai.hide();
              	  
              	  if($scope.previousModal) {
              		  $scope.previousModal.show();
              	  }
              };
              
              $scope.deleteDjai = function(djai) {
              	
            	  console.log('Deleteing djai: '+djai.id);
              	
              };
              
              $scope.close = function(force) {
              	
            	  $.extend($scope.djai, $scope.origDjai);
              	
              	  $scope.modalDjai.hide();
              	  
              	  if($scope.previousModal && !force) {
              		  $scope.previousModal.show();
            	  }
              };
              
              $scope.back = function() {
                	
            	  $.extend($scope.djai, $scope.origDjai);
              	
              	  $scope.modalDjai.hide();
              	  
              	  if($scope.previousModal) {
              		  $scope.previousModal.show();
            	  }
              };
              
              function dbFormat(date) {
            	  
            	  if(!date) return;
            	  
            	  var dateParts = date.split("-");

              	  return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
              }
              
              function loadSelectedCloth(allCloths) {
            	  // set current value for each cloth (needed for dropdown)
              	  $scope.djai.cloths.each(function( cloth ) {
              		  cloth.selectedCloth = allCloths.findAll({id:cloth.id})[0];
              	  }); 
              }
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('documentsModal', function($modal, Files) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope; // scope of the template where is located the directive (first parent?)
        	  
        	  $scope.loading = true;
        	  
        	  $scope.showDocuments= function(path, previousModal) {
              	
              	  // init selected cloth provider
        		  $scope.path = path;
              	
        		  if(previousModal) {
        			  $scope.previousModal = previousModal;
        			  previousModal.hide();
        		  }
              	
                  $scope.modalDocuments = $modal({template: 'views/modal/documents.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

                  $scope.modalDocuments.$promise.then(function(){
                			  
                			  $scope.modalDocuments.show();
                			  
                			  Files.list($scope.path).then(
                					  function(response){
	                    				  $scope.documents = response.data.results;
	                    				  $scope.loading = false;
	                    			  },
	                    			  function(error){
	                    				  console.log(error);
	                    			  }
	                    	  );
                		  }
				  );
              }; 
              
              $scope.upload = function() {
            	  
              };
              
              $scope.downloadContentHref = function(document) {
            	  
            	  return Files.contentHref(document.$$expanded.key);
              };
              
              $scope.previewHref = function(document) {
            	  
            	  return Files.previewHref(document.href, 'medium', 180, 150);
              };
              
              $scope.back = function() {
            	  
            	  $scope.modalDocuments.hide();
            	  $scope.previousModal.show();
              };
              
              $scope.ok = function() {

            	  $scope.modalDocuments.hide();
            	  
            	  alert('Path: '+$scope.path);
              };
          }
        };
    }
);

'use strict';

angular.module('vsko.stock')

.directive('editTextModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          scope: {
        	  field: '=',
          },
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;
        	  
        	  
        	  $scope.$parent.showEditModal = function(selected, callbackFn) {
        		  
        		  scope.selected = selected;
        		  scope.edit = { text: selected[scope.field] };
        		  
        		  if(callbackFn)
        			  callback = callbackFn;
        		  
                  $scope.modalEdit = $modal({template: 'views/modal/editText.html', show: false, scope: scope, callback: callback, backdrop:'static'});

                  $scope.modalEdit.$promise.then($scope.modalEdit.show);
        	  };
        	  
              scope.confirmEdition = function() {

            	  scope.selected[scope.field] = scope.edit.text;
            	  
            	  var param = index ? $scope[params][$scope[index]] : $scope.selected;
            	  
            	  if(typeof($scope.modalEdit.$options.callback) == "function") {
            		  $scope.modalEdit.$options.callback(param);
            	  }
            	  else {
            		  $scope[$scope.modalEdit.$options.callback](param);
              	  }
            	  
            	  $scope.modalEdit.hide();
              };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('manualPlotterModal', function($modal, Stock, Previsions, Plotters) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  Stock.getAllCloths().then(function(result) {
        		  $scope.cloths = result.data;
          	  });

        	  $scope.showManualPlotterModal = function(plotter, previousModal) {

        		  $scope.plotter = plotter ? plotter : {};

        		  $scope.origPlotter = plotter ? $.extend(true, {}, plotter) : {}; // used when the user cancel the modifications (close the modal)

        		  if(!$scope.plotter.cloths || $scope.plotter.cloths.length == 0) {
        			  // init with one cloth empty, useful for creating new plotter
                  	  $scope.plotter.cloths = new Array();
                  	  $scope.plotter.cloths.push({});
                  }

              	  // set current value for each cloth (needed for dropdown)
           		  $scope.plotter.selectedCloth = $scope.cloths.findAll({id:$scope.plotter.clothId})[0];


              	  $scope.modalManualPlotter = $modal({template: 'views/modal/manualPlotter.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

                  $scope.modalManualPlotter.$promise.then($scope.modalManualPlotter.show);


                  if(previousModal) {
        			  $scope.previousModal = previousModal;
        			  previousModal.hide();
        		  }
              };

              $scope.saveManualPlotter = function() {

              	  Previsions.saveManualPlotter($scope.plotter).then(function(result) {

              		  if(result.data.successful && result.data.isNew) {

              			  $scope.plotter.name = $scope.plotter.selectedCloth.name;
              			  $scope.plotter.clothId = $scope.plotter.selectedCloth.id;
              			  $scope.plotter.cuts = new Array();
              			  $scope.plotter.cutted = '0';

              			  Plotters.getPossibleRolls($scope.plotter).then(function(possibleRolls){

              				  $scope.plotter.possibleRolls = possibleRolls.data;
              			  });

              			  $scope.plotters.push($scope.plotter);

              			  $.notify("Plotter creado.", {className: "success", globalPosition: "bottom right"});
              		  }
              		  else if(result.data.successful && !result.data.isNew) {
              			  $.notify("Plotter modificado.", {className: "success", globalPosition: "bottom right"});
              		  }
              	  });

              	  $scope.modalManualPlotter.hide();

              	  if($scope.previousModal) {
              		  $scope.previousModal.show();
              	  }
              };


              $scope.closeManualPlotter = function() {

            	  $.extend($scope.plotter, $scope.origPlotter);

              	  $scope.modalManualPlotter.hide();

              	  if($scope.previousModal) {
              		  $scope.previousModal.show();
            	  }
              };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('manualRollModal', ['$modal', 'Utils', 'Stock', function($modal, Utils, Stock) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
        	  var callback = attrs.callback;


        	  $scope.showManualRollModal = function() {

        		  $scope.roll = {type: 'DEF'};

              $scope.modalManualRoll = $modal({template: 'views/modal/manualRoll.html', show: false, scope: $scope, callback: callback, backdrop: 'static'});

              $scope.modalManualRoll.$promise.then($scope.modalManualRoll.show);
        	  };

              $scope.saveRoll = function(roll) {

            	  roll.clothId = $scope.cloth.id;
            	  roll.mtsOriginal = roll.mts;

            	  Stock.saveManualRoll(roll).then(function(result){

            		  if(result.data.successful) {

            			  $scope.rolls.push(roll);

            			  $scope.availableRolls.push(roll);

                    Utils.showMessage('notify.roll_created');

            			  $scope.modalManualRoll.hide();
            		  }
            		  else {
                    Utils.showMessage('notify.roll_create_failed', 'error');
            		  }
            	  });
              };

          }
        };
	}
]);

'use strict';

angular.module('vsko.stock')

.directive('onedesignModal', function($modal, Utils, Stock, OneDesign) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  Stock.getAllCloths().then(function(result) {
        		  $scope.cloths = result.data;
          	  });


        	  $scope.showOneDesignModal = function(boat) {

        		  $scope.onedesign = boat ? boat : {isNew: true};

        		  $scope.onedesign.isManualSail = false;

        		  // trasform data toshow in table
        		  if(boat) {
	        		  $scope.boat = boat;
	        		  $scope.boat.allsails = getBoatSails(boat);
        		  }
        		  else {
        			  $scope.boat = {};
        		  }

                  $scope.modalOneDesign = $modal({template: 'views/modal/onedesignDetails.html', show: false, scope: $scope});

                  $scope.modalOneDesign.$promise.then($scope.modalOneDesign.show);
        	  };

        	  $scope.save = function(onedesign) {

        		  onedesign.clothId = onedesign.selectedCloth.id;
        		  if(onedesign.selectedSail)
        			  onedesign.sail = onedesign.selectedSail.sail;

        		  OneDesign.save(onedesign).then(function(result){

        			  	  if(result.data.successful) {

        			  		  if(!$scope.boat.allsails)
        			  			  $scope.boat.allsails = [];

        			  		  result.data.onedesign.odId = result.data.onedesign.id;

        			  		  $scope.boat.allsails.push(result.data.onedesign);

        			  		  $scope.onedesign = {boat: result.data.onedesign.boat};

        			  		  $scope.loadSails();
        			  	  }
        			  	  else {

        			  	  }

//            			  $scope.modalOneDesign.hide();

                    Utils.showMessage('notify.od_cloth_added');
        		  });
        	  };

        	  $scope.deleteOneDesignCloth = function(odCloth) {

        		  OneDesign.deleteCloth(odCloth).then(function(result){

        			  if(result.data.successful) {

        				  $scope.boat.allsails.remove(odCloth);

        				  $scope.loadSails();

                  Utils.showMessage('notify.od_cloth_deleted');
        			  }
        		  });
        	  };


        	  function getBoatSails(boat) {

        		  var allsails = new Array();

        		  if(boat) {

	        		  $.each(boat.sails, function(i, sail){

	        			  $.each(sail.cloths, function(j, cloth){

	        				  allsails.push({odId: cloth.odId, sail: sail.sail, boat: boat.boat, cloth: cloth.name, mts: cloth.mts});
	            		  });
	        		  });
        		  }

        		  return allsails;
        	  }

        	  $scope.loadSails = function() {

        		  OneDesign.getSails().then(function(result){
            		  $scope.sails = result.data;
            	  });
        	  };

        	  $scope.loadSails();
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('orderModal', function($modal, Utils, Orders, Previsions, orderStatus) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
        	  var callback = attrs.callback;
        	  var params = attrs.params;
        	  var index = attrs.index;

        	  $scope.deliveryTypes = ['Desconocido', 'Nacional', 'Courier', 'Aereo1', 'Aereo2', 'Maritimo'];

        	  $scope.showOrderModal = function(order) {

        		      $scope.order = order;

                  $scope.modalOrder = $modal({template: 'views/modal/order.html', show: false, scope: $scope, callback: callback});

                  $scope.modalOrder.$promise.then($scope.modalOrder.show);
        	  };

            $scope.confirmModal = function() {

            	  var param = index ? $scope[params][$scope[index]] : $scope.order;

            	  if($scope[$scope.modalOrder.$options.callback](param)) {
            		  $scope.modalOrder.hide();
            	  }
            };

            $scope.partialSave = function(order) {
  	      			Orders.partialSave(order).then(function(result){
  	      				// ok
  	      				$scope.modalCtrl.formOrderInfo.$setPristine();

                  if(order.status == orderStatus.in_transit) {
                    var clothsIds = order.products.map(function(p) { return p.clothId; }).join(',');
                    Previsions.updatePrevisionState(clothsIds).then(function() {
                      Utils.showMessage('notify.previsions_state_updated');
                    });
                  }
  	      			});
	      	  };

	      	  $scope.removeItem = function(orderproduct) {

	      			Orders.removeItem(orderproduct).then(function(result){
	      				// ok
	      				if(result.data.successful) {

		      				$scope.order.products.remove(orderproduct);

                  Utils.showMessage('notify.order_item_deleted');

                  if($scope.order.status == orderStatus.in_transit) {
                    Previsions.updatePrevisionState(orderproduct.clothId).then(function() {
                      Utils.showMessage('notify.previsions_state_updated');
                    });
                  }

		      				if($scope.order.products.length==0 && result.data.orderDeleted) {

		      					$scope.modalOrder.hide();

		      					if($scope.orders_buy){
		      						$scope.orders_buy.remove($scope.order);
		      					}

                    Utils.showMessage('notify.order_no_items_deleted');
		      				}
	      				}
	      			});
	      	  };

	      	  $scope.receive = function() {

	      		  var missingRolls = false;

	      		  $.each($scope.order.products, function(idx, p) {

	      			  if(!p.rolls || p.rolls.length==0 || (p.rolls.length==1 && $scope.isEmptyRoll(p.rolls[0])))
	      				  missingRolls = true;
	      		  });

	      		  if(missingRolls) {
	      			  $scope.showWarningModal({message: 'Hay productos de la orden sin rollos asignados. <br><br> Desea confirmar la orden igual?'}, $scope.confirmModal, $scope.order);
	      	  	  }
	      		  else {
	      			  $scope.showWarningModal({message: 'Confirma el arribo de la orden con los rollos asignados?'}, $scope.confirmModal, $scope.order);
	      		  }
	      	  };

            $scope.updateProductAmount = function(product) {

              Orders.updateProductAmount(product).then(function(result){

                console.log('Updated product amount to '+product.amount);

                if($scope.order.status == orderStatus.in_transit) {
                  Previsions.updatePrevisionState(product.clothId).then(function() {
                    Utils.showMessage('notify.previsions_state_updated');
        					});
                }
              });
            }

	      	  $scope.isEmptyRoll = function(roll) {
	      		  return !roll.number && !roll.lote && !roll.mts;
	      	  };

	      	  $scope.subTotal = function(p) {
	      		  var subtotal = p.amount * p.price;
	      		  return +(Math.round(subtotal + "e+2")  + "e-2");
	      	  };

	      	  $scope.total = function(products) {
	      		  var total = 0;
	      		  $.each(products, function(idx, p){
	      			  total += p.amount * p.price;
	      		  });
	      		  return +(Math.round(total + "e+2")  + "e-2");
	      	  };
          }
        };
	}
)

.directive('rollsModal', ['$modal', 'Orders', function($modal, Orders) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
        	  var callback = attrs.callback;


        	  $scope.showRollsModal = function(orderProduct) {

        		  $scope.orderProduct = orderProduct;

        		  if(!$scope.orderProduct.rolls) {

        			  Orders.getRolls($scope.orderProduct.productId, $scope.orderProduct.orderId).then(function(result){

        				  if(result.data.length==0) {
        					  $scope.orderProduct.rolls = new Array();
                			  $scope.orderProduct.rolls.push({});
        				  }
        				  else {
        					  $scope.orderProduct.rolls = result.data;
        				  }
        			  });
        		  }

        		  $scope.origOrderProduct = $scope.orderProduct ? $.extend(true, {}, $scope.orderProduct) : {}; // used when the user cancel the modifications (close the modal)


                  $scope.modalRolls = $modal({template: 'views/modal/rolls.html', show: false, scope: $scope, callback: callback, backdrop: 'static'});

                  $scope.modalRolls.$promise.then($scope.modalRolls.show);
        	  };

        	  $scope.addRoll = function() {
        		  $scope.orderProduct.rolls.push({});
        	  };

        	  $scope.removeRoll = function(index) {

        		  $scope.orderProduct.rolls.splice(index, 1);

        		  if($scope.orderProduct.rolls.length==0) {
        			  $scope.orderProduct.rolls.push({});
        		  }
        	  };

              $scope.saveRolls = function(orderProduct) {

            	  // TODO save rolls, could be new and other to update

            	  Orders.saveRolls(orderProduct).then(function(result){
            		  // ok
            		  console.log('Saved rolls.');

            		  if(result.data.successful)
            			  $scope.modalRolls.hide();
            	  });

            	  $scope.modalRolls.hide();
              };

              $scope.closeRolls = function(orderProduct) {

            	  $.extend($scope.orderProduct, $scope.origOrderProduct);

            	  $scope.modalRolls.hide();
              };

              $scope.allEmpty = function() {

            	  var allEmpty = $scope.orderProduct.rolls.length==0;

            	  if($scope.orderProduct.rolls.length==1) {

            		  var firstRoll = $scope.orderProduct.rolls[0];

            		  if(firstRoll.number || firstRoll.lote || firstRoll.mts) {
            			  allEmpty = false;
            		  }
            		  else
            			  allEmpty = true;
            	  }

            	  return allEmpty;
              };
          }
        };
	}
]);

'use strict';

angular.module('vsko.stock')

.directive('previsionModal', function($modal, $rootScope, $q, $translate, Utils, Stock, Previsions, Files, OneDesign, Lists) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;


        	  Stock.getAllCloths().then(function(result) {
        		  $scope.cloths = result.data;
          	  });

        	  Stock.getAllSails().then(function(result) {
        		  $scope.sails = result.data;
          	  });

        	  OneDesign.getBoats().then(function(result) {
        		  $scope.boats = result.data;
          	  });

        	  OneDesign.getSails().then(function(result) {
        		  $scope.oneDesignSails = result.data;
          	  });

            $scope.acceptStateChange = function(p) {
              Previsions.acceptStateChange(p).then(function() {
                Utils.showMessage('notify.state_accepted_prevision');
                p.stateAccepted = '1';
              });
            };

        	  $scope.showPrevisionModal = function(prevision, previousModal) {

        		  $scope.prevision = prevision ? prevision : {oneDesign: false, greaterThan44: false};

        		  $scope.origPrevision = prevision ? $.extend(true, {}, prevision) : {}; // used when the user cancel the modifications (close the modal)

              $scope.prevision.startedAsOD = prevision ? prevision.oneDesign : true;

        		  if(!$scope.prevision.cloths || $scope.prevision.cloths.length == 0) {
        			  // init with one cloth empty, useful for creating new prevision
              	  $scope.prevision.cloths = new Array();
              	  $scope.prevision.cloths.push({});
              }

          	  // set current value for each cloth (needed for dropdown)
          	  $scope.prevision.cloths.each(function( cloth ) {
          		  cloth.selectedCloth = $scope.cloths.findAll({id:cloth.id})[0];
          	  });

          	  // set current selected sail
          	  $scope.prevision.selectedSail = $scope.prevision.sailId ? $scope.sails.findAll({id:$scope.prevision.sailId})[0] : {};

          	  // set current selected boat
          	  $scope.prevision.selectedBoat = $scope.prevision.oneDesign ? $scope.boats.findAll({boat:$scope.prevision.boat})[0] : {};

          	  // set current selected one design sail
          	  $scope.prevision.selectedOneDesignSail = $scope.prevision.oneDesign ? $scope.oneDesignSails.findAll({sail:$scope.prevision.sailOneDesign})[0] : {};


          	  $scope.modalPrevision = $modal({template: 'views/modal/prevision.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

              $scope.modalPrevision.$promise.then($scope.modalPrevision.show);


              if(previousModal) {
        			  $scope.previousModal = previousModal;
        			  previousModal.hide();
        		  }
          };

          $scope.addCloth = function() {
        	  $scope.prevision.cloths.push({});
          };

          $scope.removeCloth = function(index) {
        	  $scope.prevision.cloths.splice(index, 1);

          	  if($scope.prevision.cloths.length==0) {
          		  $scope.prevision.cloths.push({});
          	  }
          };

          $scope.save = function() {

        	  // save changes in each cloth (extending current values only if a new cloth was selected)
          	  $scope.prevision.cloths.each(function( item ) {
          		if(item.selectedCloth && item.id != item.selectedCloth.id) {
          			$.extend(item, item.selectedCloth);
          			item.clothId = item.selectedCloth.id;
          			item.previsionId = $scope.prevision.id; // when the cloth is new the previsionid is not set, other cases will have no effect
          		}
          	  });

          	  if($scope.prevision.selectedSail.id) {
          		  $scope.prevision.sailId = $scope.prevision.selectedSail.id;
          	  }

          	  if($scope.prevision.selectedBoat.boat) {
          		  $scope.prevision.boat = $scope.prevision.selectedBoat.boat;
          	  }

          	  if($scope.prevision.selectedOneDesignSail && $scope.prevision.selectedOneDesignSail.sail) {
        		  $scope.prevision.sailOneDesign = $scope.prevision.selectedOneDesignSail.sail;
        	  }

            var waitForPossiblePrevisionStateChange = false;
            var showChangedStateModal = false;

            function newStateClose() {
              $scope.modalPrevision.hide();

              if($scope.previousModal) {
                $scope.previousModal.show();
              }
            }

        	  Previsions.save($scope.prevision, $rootScope.user.name).then(function(result) {

        		  if(result.data.successful && result.data.isNew) {

        			  $scope.previsions.push($scope.prevision);

                Utils.showMessage('notify.prevision_created');

                waitForPossiblePrevisionStateChange = true;

                updatePrevisionState($scope.prevision).then(function(state) {
                  console.log('Ended update prev state (new):', state);
                  // the prevision is new => show modal with the prev state for the user
                  $scope.state = state;
                  $scope.onClose = newStateClose;
                  var modal = $modal({template: 'views/modal/showNewState.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});
                  modal.$promise.then(modal.show);
                });;
        		  }
        		  else if(result.data.successful && !result.data.isNew) {

                Utils.showMessage('notify.prevision_modified');

                waitForPossiblePrevisionStateChange = true;

                updatePrevisionState($scope.prevision).then(function(state) {
                  console.log('Ended update prev state:', state);
                  if(state) {
                    // the prevision state was updated => show modal with the new prev state for the user
                    $scope.state = state;
                    $scope.onClose = newStateClose;
                    var modal = $modal({template: 'views/modal/showNewState.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});
                    modal.$promise.then(modal.show);
                  } else {
                    newStateClose();
                  }
                });
        		  }
        		  else if(!result.data.successfulInsert && result.data.insert) {
                Lists.log({type: 'error.insertPrevision', log: result.data.insert}).then(function(result) {});
                Utils.showMessage('notify.prevision_create_failed', 'error');
        		  }
              else if(!result.data.successfulUpdate && result.data.update) {
                Lists.log({type: 'error.updatePrevision', log: result.data.update}).then(function(result) {});
                Utils.showMessage('notify.prevision_edit_failed', 'error');
        		  }
              else if(!result.data.successfulCloths && result.data.queryCloths) {
                Lists.log({type: 'error.queryCloths', log: result.data.queryCloths}).then(function(result) {});
                Utils.showMessage('notify.prevision_cloth_save_failed', 'error');
        		  }
              else if(!result.data.successful) {
                Utils.showMessage('notify.unknown_error', 'error');
        		  }

              if(!waitForPossiblePrevisionStateChange) {
                $scope.modalPrevision.hide();

                if($scope.previousModal) {
                  $scope.previousModal.show();
                }
              }
        	  });
          };

          $scope.deletePrevision = function(prevision) {

        	  console.log('Deleteing prevision: '+prevision.id);

          	  Previsions.remove($scope.prevision).then(function(result) {
          		  $scope.previsions.remove(prevision);

          		  $scope.modalPrevision.hide();

                Utils.showMessage('notify.prevision_deleted');

                updatePrevisionState($scope.prevision, true);
          	  });
          };

          $scope.selectedPrevision = function(prevision) {

            if(prevision) {

              $scope.prevision.orderNumber = prevision.originalObject.orderNumber;

              // load the values of the selected prevision in the new one we are creating
              $scope.prevision.client = prevision.originalObject.client;
              $scope.prevision.boat = prevision.originalObject.boat;
              $scope.prevision.deliveryDate = prevision.originalObject.deliveryDate;
              $scope.prevision.type = prevision.originalObject.type;
              $scope.prevision.greaterThan44 = prevision.originalObject.greaterThan44;
              $scope.prevision.oneDesign = prevision.originalObject.oneDesign;
              $scope.prevision.selectedBoat = $scope.prevision.oneDesign ? $scope.boats.findAll({boat:$scope.prevision.boat})[0] : {};

              $scope.prevision.p = prevision.originalObject.p;
              $scope.prevision.e = prevision.originalObject.e;
              $scope.prevision.i = prevision.originalObject.i;
              $scope.prevision.j = prevision.originalObject.j;
              $scope.prevision.area = prevision.originalObject.area;

              /*console.log('Selected prevision: '+prevision.originalObject.orderNumber);
              console.log('Stored in entity: '+$scope.prevision.orderNumber);*/
            }
          };

          $scope.orderNumberChanged = function(str) {
            $scope.prevision.orderNumber = str;
          }

          $scope.close = function() {

        	  $.extend($scope.prevision, $scope.origPrevision);

        	  $scope.modalPrevision.hide();

        	  if($scope.previousModal) {
        		  $scope.previousModal.show();
        	  }
          };

          $scope.calculateMts = function() {

        	  if(!$scope.prevision.oneDesign && $scope.prevision.selectedSail) {

        		  // for sails that split the mts in two cloths (grande y chica) check that there are at least 2 cloths already added
        		  if($scope.prevision.selectedSail.splitF1=='Y' && $scope.prevision.cloths.length < 2) {
        			  $scope.prevision.cloths.push({});
        		  }
        		  else if ((!$scope.prevision.selectedSail.splitF1 || $scope.prevision.selectedSail.splitF1=='N') && $scope.prevision.cloths.length > 1 && !$scope.prevision.cloths[1].selectedCloth) {
        			  // selected sail with NO split in two cloths, if the second cloth is not selected yet remove it and leave only one cloth
        			  var cloth = $scope.prevision.cloths[0];

        			  $scope.prevision.cloths = new Array();
        			  $scope.prevision.cloths.push(cloth);
        		  }


    			  if(!$scope.prevision.greaterThan44) {
    				  $scope.calculateClothMts($scope.prevision.selectedSail.valueF1, $scope.prevision.selectedSail.fieldsF1, $scope.prevision.selectedSail.typeF1, $scope.prevision.selectedSail.splitF1, $scope.prevision.cloths[0], $scope.prevision.cloths[1]);
        		  }
        		  else {
        			  $scope.calculateClothMts($scope.prevision.selectedSail.valueF2, $scope.prevision.selectedSail.fieldsF2, $scope.prevision.selectedSail.typeF2, $scope.prevision.selectedSail.splitF2, $scope.prevision.cloths[0], $scope.prevision.cloths[1]);
        		  }
        	  }
          };

          $scope.calculateClothMts = function(value, fields, type, split, cloth1, cloth2) {

        	  var mts=undefined;

        	  if(fields == 'PE') {
        		  mts = doFormula(type, value, $scope.prevision.p, $scope.prevision.e );
        	  }
        	  else if(fields == 'IJ') {
        		  mts = doFormula(type, value, $scope.prevision.i, $scope.prevision.j );
        	  }
        	  else if(fields == 'SUP') {
        		  mts = doFormula(type, value, $scope.prevision.area );
        	  }

        	  if(mts) {

        		  if(cloth2 && split=='Y') {
        			  cloth1.mts = Math.round((mts * 0.7).toFixed(2));
        			  cloth2.mts = Math.round((mts * 0.3).toFixed(2));
        		  }
        		  else {
        			  cloth1.mts = Math.round(mts.toFixed(2));
        		  }
        	  }
          };

          function doFormula(type, value, op1, op2) {

        	  if(type == 'MULT_DIV' && op1 && op2) {
        		  return ((op1 * op2) / 2) * value;
        	  }
	  	  	    else if(type == 'MULT' && op1) {
	  	  		      return op1 * value;
		        }
  				  else if(type == 'MULT_MULT' && op1 && op2) {
  					  return op1 * op2 * value;
  				  }

        	  return undefined;
          }

          $scope.oneDesignCloths = function() {

        	  if($scope.prevision.oneDesign && $scope.prevision.selectedBoat && $scope.prevision.selectedBoat.boat && $scope.prevision.selectedOneDesignSail && $scope.prevision.selectedOneDesignSail.sail) {

        		  var sail = $scope.prevision.selectedOneDesignSail.description;

        		  $scope.prevision.cloths = new Array();

        		  OneDesign.findCloths($scope.prevision.selectedBoat.boat, $scope.prevision.selectedOneDesignSail.sail).then(function(result) {

        			  	$scope.prevision.cloths = new Array();

    			    	$.each(result.data, function(index){

    			    		var cloth = $scope.cloths.findAll({id:this.clothId})[0];

    			    		$scope.prevision.cloths.push({selectedCloth: cloth, mts: this.mts});
    			    	});

    			    	if($scope.prevision.cloths.length==0) {
              			  	$scope.prevision.cloths.push({});
              		  	}
        		  });

        	  }
          };

          function dbFormat(date) {

        	  if(!date) return;

        	  var dateParts = date.split("-");

          	  return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
          }

          function updatePrevisionState(prevision, skipNotify) {

            var d = $q.defer();

            console.log('Prevision', prevision);

  					var clothsIds = prevision.cloths.map(function(c) { return c.clothId; }).join(',');

  					Previsions.updatePrevisionState(clothsIds).then(function(result) {

              console.log('update prevision state', result);
              if(skipNotify) {
                Utils.showMessage('notify.previsions_state_updated');
              }

              var currentPrevisionUpdated = false;

              // update the state of the modified previsions in the scope
              result.data.modifiedPrevisions.map(function(modifiedPrevision) {

                var previsionsToUpdate = $scope.previsions || ($scope.cloth && $scope.cloth.previsions) || $scope.plotters;

                if(previsionsToUpdate) {
                  previsionsToUpdate.map(function(p) {
                    if(modifiedPrevision.id == p.id || modifiedPrevision.id == p.previsionId) {

                      if(p.state != modifiedPrevision.state) {
                        p.state = modifiedPrevision.state;
                        p.stateAccepted = "0";

                        // the prevision of this modal was updated => resolve the promise with the new state
                        if(p.id == prevision.id) {
                          d.resolve(p.state);
                          currentPrevisionUpdated = true;
                        }
                      }
                    }
                  });
                }
              });

              if(!currentPrevisionUpdated) {
                d.resolve(null);
              }
  					});

            return d.promise;
  				}
        }
      };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('providerModal', function($modal, Stock, Orders) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;

        	  $scope.pctNac = 1.45; // TODO move to constants
        	  Stock.getDolar().then(function(result){
        		  $scope.dolar = result.data[0].value;
        	  });
        	  
        	  $scope.showProviderModal = function(provider) {
        		  
        		  $scope.provider = provider;
              	
                  $scope.modalNewProduct = $modal({template: 'views/modal/provider.html', show: false, scope: $scope});

                  $scope.modalNewProduct.$promise.then($scope.modalNewProduct.show);
        	  };
        	  
        	  $scope.saveProvider = function(provider) {
        		  
        		  Stock.saveCloth(cloth).then(function(result){

        			  Stock.getAllGroups().then(function(result){
        				  // refresh groups because of possible modification in the cloth group 
                  		  $scope.groups = result.data;
                  		  
            			  $scope.modalNewProduct.hide();
            			  
            			  $.notify("Cambios guardados.", {className: "success", globalPosition: "bottom right"});
                  	  });
        		  });
        	  };
        	  
        	  $scope.showBuyModal= function(provider, product) {
              	
              	  // init selected cloth provider
        		  $scope.provider = provider;
        		  $scope.product = product;
              	  $scope.cloth = {name: product.name};
              	
              	
                  $scope.modalBuy = $modal({template: 'views/modal/buy.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

                  $scope.modalBuy.$promise.then($scope.modalBuy.show);
              }; 
              
              $scope.buy = function(amount) {

            	  $scope.modalBuy.hide();
            	  
            	  $scope.provider.amount = amount;
            	  $scope.provider.providerId = $scope.provider.id;  
            	  $scope.provider.productId = $scope.product.productId;
            	  $scope.provider.clothId = $scope.product.clothId;
            	  $scope.provider.price = $scope.product.price;
            	  
            	  Orders.buy($scope.provider).then(function(result){
            		 
            		  // show feedback message
            		  $.notify("Cantidad a comprar: "+amount+ " mts", {className: "success", globalPosition: "bottom right"});
            	  });
              };
              
              $scope.toPriceNac = function(price) {

            	  return (price * $scope.pctNac).toFixed(2) ;
              };
              
              $scope.toPriceRef = function(price) {

            	  return (price * $scope.pctNac * $scope.dolar).toFixed(2);
              };
          }
        };
	}
)

.directive('newProductModal', function($modal, Stock, Orders) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;

        	  Stock.getAllCloths().then(function(result) {
        		  $scope.cloths = result.data;
          	  });
        	  
        	  $scope.showNewProductModal = function(provider) {
        		  
        		  $scope.newProduct = {provider: provider ? provider : {}, selectedCloth: {}};
              	
                  $scope.modalNewProduct = $modal({template: 'views/modal/newProduct.html', show: false, scope: $scope});

                  $scope.modalNewProduct.$promise.then($scope.modalNewProduct.show);
        	  };
        	  
        	  $scope.saveNewProduct = function(newProduct) {
        		  
        		  newProduct.clothId = newProduct.selectedCloth.id;
        		  
        		  Stock.saveNewProduct(newProduct).then(function(result){
        			  
        			  	  if(result.data.isNewProvider) {
        			  		  $scope.providers.push(result.data.provider);
        			  	  }
        			  	  else {
        			  		  $scope.provider.products.push(result.data.product);
        			  	  }
        			  	  
            			  $scope.modalNewProduct.hide();
            			  
            			  $.notify("Nuevo producto guardado.", {className: "success", globalPosition: "bottom right"});
        		  });
        	  };
          }
        };
	}
);

'use strict';

angular.module('vsko.stock')

.directive('warningModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;
        	  
        	  $scope.showWarningModal = function(warning, callbackFn, params) {
        		  
        		  $scope.warning = warning;
        		  
                  $scope.modalWarning = $modal({template: 'views/modal/warning.html', show: false, scope: $scope, callback: callbackFn, params: params, backdrop:'static'});

                  $scope.modalWarning.$promise.then($scope.modalWarning.show);
        	  };
        	  
              $scope.confirmWarning = function() {

           		  $scope.modalWarning.$options.callback($scope.modalWarning.$options.params);
            	  
            	  $scope.modalWarning.hide();
              };
          }
        };
	}
);
