// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('OneDesign', ['$http', '$q', 'uuid4', function ($http, $q, uuid4) {

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

        return this;
    }]);
