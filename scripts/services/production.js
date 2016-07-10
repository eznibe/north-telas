// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Production', ['$http', 'uuid4', function ($http, uuid4) {

		var url = telasAPIUrl;

      this.getLines = function()
      {
				var lines = [{name: 'OD'}, {name: 'CA'}, {name: 'NY'}, {name: 'RA'}, {name: 'DA'}, {name: 'REP'}];
      	return lines;
      };

			this.getSellers = function()
      {
				var sellers = [{name: 'MP'}, {name: 'EB'}, {name: 'HP'}, {name: 'GS'}];
      	return sellers;
      };

      this.getPrevisions = function(clothId)
      {
      	return $http.get(url + 'previsions_GET.php?clothId='+clothId+'&designed=false&expand=FULL');
      };

      this.updateDate = function(prevision, fieldName) {

      	return $http.post(url + 'production_POST.php?updateDate=true&field='+fieldName, prevision);
      };

			this.updateField = function(prevision, fieldName, isNumeric) {

				var numeric = '';
				if (isNumeric) {
					numeric = '&isNumber=true';
				}

      	return $http.post(url + 'previsions_POST.php?edit=true&field='+fieldName + numeric, prevision);
      };

      return this;
    }]);
