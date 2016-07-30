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
				// var sellers = [{name: 'GB'}, {name: 'MB'}, {name: 'HS'}, {name: 'CC'}, {name: 'FL'}, {name: 'SA'}, {name: 'DS'}, {name: 'MU'}, {name: 'RH'}, {name: 'PN'},
				// 							 {name: 'LF'}, {name: 'LS'}, {name: 'GBA'}, {name: 'TB'}, {name: 'PC'}, {name: 'OS'}, {name: 'GC'}, {name: 'ED'}, {name: 'OJ'}, {name: 'RZ'},
				// 							 {name: 'AN'}, {name: 'LB'}, {name: 'RF'}, {name: 'PB'}, {name: 'MRC'}, {name: 'IA'}, {name: 'RM'}, {name: 'GRV'}, {name: 'JPM'}, {name: 'CS'}, {name: 'HM'}];
      	// return sellers;
				return $http.get(url + 'users_GET.php?sellerCodes=true');
      };

      this.getPrevisions = function(clothId)
      {
      	return $http.get(url + 'previsions_GET.php?clothId='+clothId+'&designed=false&expand=FULL');
      };

      this.updateDate = function(prevision, fieldName) {

      	return $http.post(url + 'production_POST.php?updateDate=true&field='+fieldName, prevision);
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

      	return $http.post(url + 'previsions_POST.php?edit=true&field='+fieldName + numeric, prevision);
      };

      return this;
    }]);
