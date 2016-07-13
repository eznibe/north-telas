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

				this.getPrevisionsForProduction = function()
        {
					return $http.get(url + 'previsions_GET.php?listForProduction=true');
        };

				this.getPrevisionsHistoric = function()
        {
					return $http.get(url + 'previsions_GET.php?listHistoric=true');
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

				this.checkAllClothsCutted = function(previsionId)
        {
        	return $http.get(url + 'previsions_GET.php?checkAllClothsCutted=true&previsionId='+previsionId);
        };


        this.saveManualPlotter = function(plotter) {

        	if(!plotter.id)
        		plotter.id = uuid4.generate();

        	return $http.post(url + 'plotters_POST.php?manualPlotter=true', plotter);
        };

				this.editObservations = function(prevision) {

        	return $http.post(url + 'previsions_POST.php?edit=true&field=observations', prevision);
        };

				this.editField = function(prevision, field) {

        	return $http.post(url + 'previsions_POST.php?edit=true&field='+field, prevision);
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
