// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Previsions', ['$http', 'uuid4', '$q', '$rootScope', 'Utils', function ($http, uuid4, $q, $rootScope, Utils) {

		var url = telasAPIUrl;

        this.getAll = function(includeDesigned, expand)
        {
					var designedCondition = "";
        	if(!includeDesigned) {
						designedCondition = "&designed=false";
					}

					var countryCondition = "";
					if (expand == 'DESIGN') {
						countryCondition = "&storedCountry="+$rootScope.user.storedCountry;
					}

					var d = $q.defer();
					var startTime = Date.now();

					$http.get(url + 'previsions_GET.php?expand='+(expand ? expand : 'FULL') + designedCondition + countryCondition).then(function(result) {
						Utils.logTiming(startTime, url + 'previsions_GET.php?expand='+(expand ? expand : 'FULL') + designedCondition + countryCondition, 'previsions.getAll', 'GET');
						d.resolve(result);
					});

					return d.promise;
        	// return $http.get(url + 'previsions_GET.php?expand='+(expand ? expand : 'FULL') + designedCondition);
        };

        this.getPrevisions = function(clothId)
        {
					var d = $q.defer();
					var startTime = Date.now();

					$http.get(url + 'previsions_GET.php?clothId='+clothId+'&designed=false&expand=FULL').then(function(result) {
						Utils.logTiming(startTime, url + 'previsions_GET.php?clothId='+clothId+'&designed=false&expand=FULL', 'previsions.getPrevisions', 'GET');
						d.resolve(result);
					});

					return d.promise;
        	// return $http.get(url + 'previsions_GET.php?clothId='+clothId+'&designed=false&expand=FULL');
        };

				this.getPrevisionsForProduction = function(sellerCode, filters, offset)
        {
					sellerCode = sellerCode ? '&sellerCode=' + sellerCode : '';
					offset = ((offset || offset == 0) && filters.limit) ? ('&offset=' + offset) : '';

					var d = $q.defer();
					var startTime = Date.now();

					$http.post(url + 'previsions_POST.php?listForProduction=true' + offset + sellerCode, filters).then(function(result) {
						Utils.logTiming(startTime, url + 'previsions_POST.php?listForProduction=true' + offset + sellerCode, 'previsions.getPrevisionsForProduction', 'POST', filters);
						d.resolve(result);
					});

					return d.promise;
					// return $http.post(url + 'previsions_POST.php?listForProduction=true' + offset + sellerCode , filters);
        };

				this.getPrevisionsHistoric = function(sellerCode, filters, offset)
        {
					sellerCode = sellerCode ? '&sellerCode=' + sellerCode : '';
					offset = offset || offset == 0 ? ('&offset=' + offset) : '';

					return $http.post(url + 'previsions_POST.php?listHistoric=true' + offset + sellerCode, filters);
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

					var d = $q.defer();
					var startTime = Date.now();

					$http.post(url + 'previsions_POST.php', prevision).then(function(result) {
						var failed = !result.data.successful ? '-FAILED' : '';

						Utils.logTiming(startTime, url + 'previsions_POST.php', 'previsions.save', 'POST'+failed, prevision);
						d.resolve(result);
					}, function(err) {
						d.reject(err);
					});

					return d.promise;
        };

        this.designed = function(prevision) {

        	return $http.post(url + 'previsions_POST.php?designed=true', prevision);
        };

        this.remove = function(prevision) {

        	return $http.post(url + 'previsions_DELETE.php?id='+ prevision.id);
        };

        this.updateClothMts = function(cloth) {

					var d = $q.defer();
					var startTime = Date.now();

					$http.post(url + 'previsions_POST.php?updateMts=true', cloth).then(function(result) {
						Utils.logTiming(startTime, url + 'previsions_POST.php?updateMts=true', 'previsions.updateClothMts', 'POST', cloth);
						d.resolve(result);
					});

					return d.promise;
					// return $http.post(url + 'previsions_POST.php?updateMts=true', cloth);
        };

				this.validateUniqueOrderNumber = function(orderNumber) {
					return $http.get(url + 'previsions_GET.php?validate=true&orderNumber='+escape(orderNumber));
				};

        //-- PLOTTERS --//

        this.getAllPlotters = function(cutted)
        {
        	if(!cutted)
        		cutted = false;

        	return $http.get(url + 'plotters_GET.php?cutted='+cutted);
        };

        this.savePlotterCut = function(cut) {

        	if(!cut.id) {
        		cut.id = uuid4.generate();
					}

					var d = $q.defer();
					var startTime = Date.now();

					$http.post(url + 'plotters_POST.php?saveCut=true', cut).then(function(result) {
						Utils.logTiming(startTime, url + 'plotters_POST.php?saveCut=true', 'previsions.savePlotterCut', 'POST', cut);
						d.resolve(result);
					});

					return d.promise;
        	// return $http.post(url + 'plotters_POST.php?saveCut=true', cut);
        };

        this.removePlotterCut = function(cut) {

					var d = $q.defer();
					var startTime = Date.now();

					$http.post(url + 'plotters_DELETE.php?cutId='+ cut.id).then(function(result) {
						Utils.logTiming(startTime, url + 'plotters_DELETE.php?cutId='+ cut.id, 'previsions.removePlotterCut', 'DELETE');
						d.resolve(result);
					});

					return d.promise;
        	// return $http.post(url + 'plotters_DELETE.php?cutId='+ cut.id);
        };

        this.getPossibleRolls = function(plotter)
        {
        	return $http.get(url + 'rolls_GET.php?clothId='+plotter.clothId+'&possibleRolls=true');
        };

				this.checkAllClothsCutted = function(previsionId)
        {
        	return $http.get(url + 'previsions_GET.php?checkAllClothsCutted=true&previsionId='+previsionId);
        };


        this.saveManualPlotter = function(plotter) {

        	if(!plotter.id)
        		plotter.id = uuid4.generate();

        	return $http.post(url + 'plotters_POST.php?manualPlotter=true', plotter);
        };

				this.editObservations = function(prevision, fieldName) {

        	return $http.post(url + 'previsions_POST.php?edit=true&field='+fieldName, prevision);
        };

				this.editField = function(prevision, field) {

					var d = $q.defer();
					var startTime = Date.now();

					$http.post(url + 'previsions_POST.php?edit=true&field='+field, prevision).then(function(result) {
						Utils.logTiming(startTime, url + 'previsions_POST.php?edit=true&field='+field, 'previsions.editField('+field+')', 'POST', prevision);
						d.resolve(result);
					});

					return d.promise;
        	// return $http.post(url + 'previsions_POST.php?edit=true&field='+field, prevision);
        };

				this.updatePrevisionState = function(clothIds, previsionId) {

					var d = $q.defer();
					var startTime = Date.now();

					var previInitiator = previsionId ? ('&previsionInitiator=' + previsionId) : '';

					$http.post(url + 'previsions_POST.php?updatePrevisionState=true&clothIds='+clothIds + previInitiator, clothIds).then(function(result) {
						Utils.logTiming(startTime, url + 'previsions_POST.php?updatePrevisionState=true&clothIds='+clothIds, 'previsions.updatePrevisionState', 'POST', clothIds);
						d.resolve(result);
					});

					return d.promise;
        	// return $http.post(url + 'previsions_POST.php?updatePrevisionState=true&clothIds='+clothIds, clothIds);
        };

				this.updatePrevisionStateWithDeliveryType = function(deliveryType) {

					var d = $q.defer();
					var startTime = Date.now();

					$http.post(url + 'previsions_POST.php?updatePrevisionState=true&deliveryType='+deliveryType, deliveryType).then(function(result) {
						Utils.logTiming(startTime, url + 'previsions_POST.php?updatePrevisionState=true&deliveryType='+deliveryType, 'previsions.updatePrevisionStateWithDeliveryType', 'POST', deliveryType);
						d.resolve(result);
					});

					return d.promise;
        	// return $http.post(url + 'previsions_POST.php?updatePrevisionState=true&clothIds='+clothIds, clothIds);
        };

				this.updateAllPrevisionsStates = function() {

        	return $http.post(url + 'previsions_POST.php?updateAllPrevisionsStates=true', {});
        };

				this.acceptStateChange = function(prevision) {

					var d = $q.defer();
					var startTime = Date.now();

					$http.post(url + 'previsions_POST.php?acceptStateChange=true', prevision).then(function(result) {
						Utils.logTiming(startTime, url + 'previsions_POST.php?acceptStateChange=true', 'previsions.acceptStateChange', 'POST', prevision);
						d.resolve(result);
					});

					return d.promise;
        	// return $http.post(url + 'previsions_POST.php?acceptStateChange=true', prevision);
        };

				this.isInPlotterWithCuts = function(previsionId) {
					return $http.get(url + 'plotters_GET.php?previsionId='+previsionId+'&hasPlotterCuts=true');
				};

				this.isInSomeDispatch = function(previsionId) {
					return $http.get(url + 'previsions_GET.php?previsionId='+previsionId+'&isInSomeDispatch=true');
				};

				this.weekUp = function(previsionIds) {
					return $http.post(url + 'previsions_POST.php?weekUp=true', {ids: previsionIds, user: $rootScope.user.name});
				};

				this.weekDown = function(previsionIds) {
					return $http.post(url + 'previsions_POST.php?weekDown=true', {ids: previsionIds, user: $rootScope.user.name});
				};

        return this;
    }]);
