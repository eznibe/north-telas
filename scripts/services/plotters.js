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

        	return $http.get(url + 'plotters_GET.php?search='+encodeURIComponent(input));
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

        	return $http.post(url + 'plotters_DELETE.php?removePlotter=true&id='+ plotterId);
        };

        this.restoreToDesign = function(plotter) {

        	return $http.post(url + 'plotters_POST.php?toDesign=true', plotter);
        };

        this.removeManualPlotter = function(manualPlotterId) {

        	return $http.post(url + 'plotters_DELETE.php?removeManualPlotter=true&id='+ manualPlotterId);
        };

				// deprecated, use Prevision.savePlotterCut
        this.savePlotterCut = function(cut) {

        	if(!cut.id)
        		cut.id = uuid4.generate();

        	return $http.post(url + 'plotters_POST.php?saveCut=true', cut);
        };

        this.removePlotterCut = function(cut) {

        	return $http.post(url + 'plotters_DELETE.php?cutId='+ cut.id);
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
