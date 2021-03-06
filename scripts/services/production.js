// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Production', ['$http', 'uuid4', '$q', '$rootScope', 'Utils', 'Users', function ($http, uuid4, $q, $rootScope, Utils, Users) {

		var url = telasAPIUrl;

      this.getLines = function()
      {
		var lines = [{name: 'OD'}, {name: 'CA'}, {name: 'NY'}, {name: 'RA'}, {name: 'DA'}, {name: 'REP'}, {name: 'LO'}, {name: '3DL/3Di'}];
      	return lines;
      };

			this.getSellers = function(country)
      {
				return $http.get(url + 'users_GET.php?sellerCodes=true' + (country ? '&sellerCountry='+country : ''));
      };

			this.getDesigners = function(country)
      {
				return $http.get(url + 'users_GET.php?designerCodes=true' + (country ? '&designerCountry='+country : ''));
      };

      this.getPrevisions = function(clothId)
      {
      	return $http.get(url + 'previsions_GET.php?clothId='+clothId+'&designed=false&expand=FULL');
      };


			this.getWeeksBySeason = function() {
					return $http.get(url + 'previsions_GET.php?weeksBySeason=true');
			}

			this.saveSeasonWeeks = function(key, seasonWeeks) {
				var seasonWeeks = {key: key, value: seasonWeeks};
				return $http.post(url + 'previsions_POST.php?weeksBySeason=true', seasonWeeks);
			}

			this.updateDate = function(prevision, fieldName) {

				var d = $q.defer();
				var startTime = Date.now();

				$http.post(url + 'production_POST.php?updateDate=true&field='+fieldName, prevision).then(function(result) {
					var failed = !result.data.successful ? '-FAILED' : '';

					Utils.logTiming(startTime, url + 'production_POST.php?updateDate=true&field='+fieldName, 'production.updateDate('+fieldName+')', 'POST'+failed, prevision);

					d.resolve(result);
				}, function(err) {
					d.reject(err);
				});

				return d.promise;
			};

			this.updateField = function(prevision, fieldName, isNumeric, origValue) {

				var numeric = '';
				if (isNumeric) {
					numeric = '&isNumber=true';
				}

				var d = $q.defer();
				var startTime = Date.now();

				$http.post(url + 'previsions_POST.php?edit=true&field='+fieldName + numeric, prevision).then(function(result) {
					var failed = !result.data.successful ? '-FAILED' : '';

					Utils.logTiming(startTime, url + 'previsions_POST.php?edit=true&field='+fieldName + numeric, 'production.updateField('+fieldName+')', 'POST'+failed, prevision);

					if (fieldName === 'observations' && origValue !== prevision[fieldName]) {
						// send prevision observations changed notify
						Users.storePrevisionNotify($rootScope.user, prevision.orderNumber).then(function(result) {
							console.log('Notify result:',result);
						});
					}

					d.resolve(result);
				}, function(err) {
					d.reject(err);
				});

				return d.promise;
      };

      return this;
    }]);
