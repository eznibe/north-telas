// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Production', ['$http', 'uuid4', '$q', 'Utils', function ($http, uuid4, $q, Utils) {

		var url = telasAPIUrl;

      this.getLines = function()
      {
				var lines = [{name: 'OD'}, {name: 'CA'}, {name: 'NY'}, {name: 'RA'}, {name: 'DA'}, {name: 'REP'}];
      	return lines;
      };

			this.getSellers = function()
      {
				return $http.get(url + 'users_GET.php?sellerCodes=true');
      };

      this.getPrevisions = function(clothId)
      {
      	return $http.get(url + 'previsions_GET.php?clothId='+clothId+'&designed=false&expand=FULL');
      };

      this.updateDate = function(prevision, fieldName) {

				var d = $q.defer();
				var startTime = Date.now();

				$http.post(url + 'production_POST.php?updateDate=true&field='+fieldName, prevision).then(function(result) {
					Utils.logTiming(startTime, url + 'production_POST.php?updateDate=true&field='+fieldName, 'production.updateDate('+fieldName+')', 'POST', prevision);
					d.resolve(result);
				});

				return d.promise;
      	// return $http.post(url + 'production_POST.php?updateDate=true&field='+fieldName, prevision);
      };

			this.getWeeksBySeason = function() {
					return $http.get(url + 'previsions_GET.php?weeksBySeason=true');
			}

			this.saveSeasonWeeks = function(key, seasonWeeks) {
				var seasonWeeks = {key: key, value: seasonWeeks};
				return $http.post(url + 'previsions_POST.php?weeksBySeason=true', seasonWeeks);
			}

			this.updateField = function(prevision, fieldName, isNumeric) {

				var numeric = '';
				if (isNumeric) {
					numeric = '&isNumber=true';
				}

				var d = $q.defer();
				var startTime = Date.now();

				$http.post(url + 'previsions_POST.php?edit=true&field='+fieldName + numeric, prevision).then(function(result) {
					Utils.logTiming(startTime, url + 'previsions_POST.php?edit=true&field='+fieldName + numeric, 'production.updateField('+fieldName+')', 'POST', prevision);
					d.resolve(result);
				});

				return d.promise;
      	// return $http.post(url + 'previsions_POST.php?edit=true&field='+fieldName + numeric, prevision);
      };

      return this;
    }]);
