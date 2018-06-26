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

        return this;
    }]);
