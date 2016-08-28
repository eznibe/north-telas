'use strict';

angular.module("vsko.stock", [
	    'ngRoute',
	    'ngCookies',
      'mgcrea.ngStrap',
      'pascalprecht.translate',
      'uuid4',
      'toaster',
      // 'angular-loading-bar',
			'angucomplete-alt',
			'anguFixedHeaderTable',
			'angularStats',
			'angular.bind.notifier',
			'xeditable'
			// , 'ui.bootstrap'
    ])
    .run(['$cookieStore', '$rootScope', '$translate', function ($cookieStore, $rootScope, $translate) {
    	console.log('vsko.stock run');

    	var user = $cookieStore.get('user');
    	$rootScope.user = user ? user : {};

			var lang = $cookieStore.get('lang');
			if (lang) {
	    	$translate.use(lang);
			}

			$rootScope.searchBoxChangedObservers = [];

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
						.when('/production', {
                templateUrl: 'views/production.html',
                controller: 'ProductionCtrl',
                access: 'public'
            })
						.when('/historic', {
                templateUrl: 'views/historic.html',
                controller: 'HistoricCtrl',
                access: 'public'
            })
						.when('/dispatch', {
                templateUrl: 'views/dispatchs.html',
                controller: 'DispatchCtrl',
                access: 'public'
            })
						.when('/canvas', {
                templateUrl: 'views/canvas.html',
                controller: 'CanvasCtrl',
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
						.when('/lists/dispatchsHistoric', {
                templateUrl: 'views/lists/dispatchsHistoric.html',
                controller: 'DispatchsHistoricCtrl',
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
