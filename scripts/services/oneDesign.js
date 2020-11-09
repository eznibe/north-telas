// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('OneDesign', ['$http', '$q', 'uuid4', 'Utils', function ($http, $q, uuid4, Utils) {

		var url = telasAPIUrl;

        this.getBoats = function(storedCountry)
        {
					storedCountry = storedCountry === 'BRA' ? '&storedCountry=BRA' : '';
        	return $http.get(url + 'boats_GET.php?onedesign=true'+storedCountry);
        };

        this.getSails = function(storedCountry)
        {
					storedCountry = storedCountry === 'BRA' ? '&storedCountry=BRA' : '';
        	return $http.get(url + 'sails_GET.php?onedesign=true'+storedCountry);
        };

        this.getModels = async function(storedCountry)
        {
            storedCountry = storedCountry === 'BRA' ? '&storedCountry=BRA' : '';
            
            const startTime = Date.now();

            const result = await $http.get(url + 'onedesign_GET.php?onedesignmodels=true'+storedCountry);
            Utils.logTiming(startTime, url + 'onedesign_GET.php?onedesignmodels=true'+storedCountry, 'onedesignmodels.getAll', 'GET');

            return result;
        };

        this.getModel = async function(boat, sail)
        {
            const startTime = Date.now();

            const result = await $http.get(`${url}onedesign_GET.php?onedesignmodels=true&boat=${boat}&sail=${sail}`);
            Utils.logTiming(startTime, `${url}onedesign_GET.php?onedesignmodels=true&boat=${boat}&sail=${sail}`, 'onedesignmodels.getModel', 'GET');

            return result;
        };

        this.getModelsHistoricData = async function(boat, sail, year)
        {
            const startTime = Date.now();

            const modelParam = boat && sail ? `&boat=${boat}&sail=${sail}` : '';
            const yearParam = year ? `&year=${year}` : '';

            const requestUrl = boat && sail 
                ? `${url}onedesign_GET.php?onedesignmodelsHistoricByModel=true${modelParam}${yearParam}`
                : `${url}onedesign_GET.php?onedesignmodelsHistoric=true`; 
            
            const result = await $http.get(requestUrl);
            Utils.logTiming(startTime, requestUrl, 'onedesignmodelsHistoric.getAll', 'GET');

            return result;
        };

        this.updateSailName = function(sail) {

        	return $http.post(url + 'sails_POST.php?updateSailName=true', sail);
        };

        this.save = function(onedesign) {

       		onedesign.id = uuid4.generate();

        	return $http.post(url + 'boats_POST.php?onedesign=true', onedesign);
        };

        this.saveModel = function(model) {
            return $http.post(url + 'onedesign_POST.php?updateODModel=true', model);
        };

        this.updateBoatName = function(boat) {

        	return $http.post(url + 'boats_POST.php?updateBoatName=true', boat);
        };

        this.deleteCloth = function(onedesign) {

        	return $http.post(url + 'boats_DELETE.php?deleteODCloth=true&odId='+onedesign.odId);
        };

        this.deleteBoat = function(boat) {

        	return $http.post(url + 'boats_DELETE.php?deleteODBoat=true&boat='+boat.boat);
        };

        this.findCloths = function(boat, sail)
        {
					sail = sail.replace('+', '%2B');
        	return $http.get(url + 'boats_GET.php?onedesignCloths=true&boat='+boat+'&sail='+sail);
        };

        this.getProperties = function(name) {
            return $http.get(url + 'previsions_GET.php?properties=true&filter='+name);
        }

        this.updateProperties = function(name, value) {
            var property = {
                name: name,
                value: value
            };
            return $http.post(url + 'previsions_POST.php?properties=true', property);
        }

        this.getNextModelSerie = function(boat, sail) {
            return $http.get(`${url}onedesign_GET.php?modelNextSerie=true&boat=${boat}&sail=${sail}`);
        }

        this.getModelPrevisions = function(boat, sail, onlyAvailables = false, onlyAssigned = false) {
            return $http.get(`${url}onedesign_GET.php?modelPrevisions=true&boat=${boat}&sail=${sail}&onlyAvailables=${onlyAvailables}&onlyAssigned=${onlyAssigned}`);
        }

        this.getModelMeasurements = (model) => {
            return $http.get(`${url}onedesign_GET.php?modelMeasurements=true&modelId=${model.id}`);
        }

        this.saveModelMeasurement = (measure, modelId) => {
            if (!measure.id) {
                measure.id = uuid4.generate();
            }
            measure.modelId = modelId;

            return $http.post(url + 'onedesign_POST.php?updateODModelMeasurement=true', measure);
        }

        this.updateModelField = function(entity, type, fieldName, isNumeric) {

            let numeric = '';
            if (isNumeric) {
                numeric = '&isNumber=true';
            }

            const typeParam = `&type=${type}`;

            return $http.post(url + 'onedesign_POST.php?edit='+fieldName + numeric + typeParam, entity);
        };

        this.deleteModelMeasurement = (measure) => {
            return $http.post(url + 'onedesign_DELETE.php?deleteODModelMeasurement=true&id='+measure.id);
        }

        // model items
        this.getModelItems = (model) => {
            return $http.get(`${url}onedesign_GET.php?modelItems=true&modelId=${model.id}`);
        }

        this.saveModelItem = (item, modelId) => {
            if (!item.id) {
                item.id = uuid4.generate();
            }
            item.modelId = modelId;

            return $http.post(url + 'onedesign_POST.php?updateODModelItem=true', item);
        }

        this.updateModelItemField = function(item, fieldName, isNumeric) {

            var numeric = '';
            if (isNumeric) {
                numeric = '&isNumber=true';
            }

            return $http.post(url + 'onedesign_POST.php?edit='+fieldName + numeric, item);
        };

        this.deleteModelItem = (item) => {
            return $http.post(url + 'onedesign_DELETE.php?deleteODModelItem=true&id='+item.id);
        }

        return this;
    }]);
