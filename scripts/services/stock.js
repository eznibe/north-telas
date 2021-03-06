// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Stock', ['$http', '$q', '$rootScope', 'uuid4', 'Utils', function ($http, $q, $rootScope, uuid4, Utils) {

		var url = telasAPIUrl;

        this.getAllGroups = function(light, expand)
        {
          const d = $q.defer();
					const startTime = Date.now();
					let expandCondition = '?expand=FULL';
					if(light) {
						expandCondition = '?expand=NONE';
					} else if (expand === 'SUMMARY') {
            expandCondition = `?expand=${expand}`;
          }
          $http.get(url + 'groups_GET.php' + expandCondition).then(function(result) {
						Utils.logTiming(startTime, url + 'groups_GET.php' + expandCondition, 'stock.getAllGroups', 'GET');
						d.resolve(result);
          });
          return d.promise;
        };

        this.alive = function() {
        	$http({method: 'GET', url: 'http://testwerkgroepen.vsko.be/alive?input=Belgie', timeout: 7000}).
//        	$http({method: 'GET', url: 'http://localhost:8080/alive?input=Belgie', timeout: 7000}).
            success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                if(data && data.$$meta) {
                    console.log('Succesful OK');
                } else {
                	console.log('Succesful OK, but check');
                }
            }).
            error(function (data, status, headers, config) {
            	console.log('Error in something');
            });
        };

        this.cors = function() {
//        	$http({method: 'GET', url: 'http://testwerkgroepen.vsko.be/alive?input=Belgie&managedBy=/persons/cf2dccb1-3056-4402-e044-d4856467bfb8', timeout: 7000, headers: {'Authorization': 'Bearer K3zvWqpDzlq7tLCjWvihhp2N4qPzUZu4bVtu6GerPhoWVMQ9gZyagwdhhMtAr/D/D4522sa3okT/57vqovwNDTu2ndnI1iUNr9cuEuE3ASDhuv81+Ea3yZCHrT/ZP/VDGxC3gcyqJhXbIpGY4FKteQ=='}}).
        	$http({method: 'GET', url: 'http://testapi.vsko.be/workgroups?offset=30', timeout: 7000, headers: {'Authorization': 'Bearer O4v8L2NF1mymozGYaISC0owbIApDBdeeMm9BnhYzrRja8OSpdP0Qr3AKSctKRNRXXNFtUzGXqyu7JUDNDBkdXyOP2cYCl4r0euZtnPZXaSXn8IsN4HDBQvzA7/OQw+M5vyEncEq5nKI='}}).
//        	$http({method: 'GET', url: 'http://api.vsko.be/workgroups?offset=30', timeout: 7000, headers: {'Authorization': 'Bearer K3zvWqpDzlq7tLCjWvihhp2N4qPzUZu4bVtu6GerPhoWVMQ9gZyagwdhhMtAr/D/D4522sa3okT/57vqovwNDTu2ndnI1iUNr9cuEuE3ASDhuv81+Ea3yZCHrT/ZP/VDGxC3gcyqJhXbIpGY4FKteQ=='}}).
            success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                if(data && data.$$meta) {
                    console.log('Succesful OK');
                } else {
                	console.log('Succesful OK, but check');
                }
            }).
            error(function (data, status, headers, config) {
            	console.log('Error in something');
            });
        };

        this.getGroup = function(groupId, expansion)
        {
					var d = $q.defer();
					var startTime = Date.now();

					$http.get(url + 'groups_GET.php?id='+groupId+'&expand='+expansion).then(function(result) {
						Utils.logTiming(startTime, url + 'groups_GET.php?id='+groupId+'&expand='+expansion, 'stock.getGroup', 'GET');
						d.resolve(result);
					});

					return d.promise;
        	// return $http.get(url + 'groups_GET.php?id='+groupId+'&expand='+expansion);
        };

        this.getAllCloths = function(light, country)
        {
					var expand = '?1=1';
					if(!light) {
						expand += '&expand=FULL';
					}

					country = country ? "&previsionCountry="+country + "&clothCountry="+country : "";

					var d = $q.defer();
					var startTime = Date.now();

					$http.get(url + 'cloths_GET.php' + expand + country).then(function(result) {
						Utils.logTiming(startTime, url + 'cloths_GET.php'+expand + country, 'stock.getAllCloths', 'GET');
						d.resolve(result);
					});

					return d.promise;
        	// return $http.get(url + 'cloths_GET.php'+expand);
        };

        this.getProviders = function(clothId)
        {
        	return $http.get(url + 'providers_GET.php?clothId='+clothId+'&expand=FULL');
        };

        this.saveCloth = function(cloth)
        {
        	if(!cloth.id) {
        		cloth.id = uuid4.generate();
        		cloth.isNew = true;
        	}

        	return $http.post(url + 'cloths_POST.php', cloth);
        };

				this.copyCloth = function(cloth, country)
        {
        	return $http.post(url + 'cloths_POST.php?copy=true&clothCountry='+country, cloth);
        };

				this.deleteCloth = function(cloth) {

					return $http.post(url + 'cloths_DELETE.php?clothId='+ cloth.id);
				};

        this.getDjai = function(djai, expansion)
        {
        	return $http.get(url + 'djais_GET.php?djaiNumber='+escape(djai.number)+'&expand='+expansion);
        };

        this.saveDjai = function(djai)
        {
        	$.each(djai.cloths, function(index){
        		if(!this.djaiId)
        			this.djaiId = uuid4.generate();
        	});

        	return $http.post(url + 'djais_POST.php', djai);
        };

        this.getDolar = function()
        {
        	return $http.get(url + 'cloths_GET.php?dolar=true');
        };

        this.getHistoricDolar = function()
        {
        	return $http.get(url + 'cloths_GET.php?historicdolar=true');
        };

        this.saveDolar = function(dolar)
        {
          if (!dolar.fromDate) {
            var d = new Date();
			      dolar.fromDate = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
          }
        	var dolar = {value: dolar.value, fromDate: dolar.fromDate};
        	return $http.post(url + 'cloths_POST.php?dolar=true', dolar);
        };

        this.saveHistoricDolar = function(dolar)
        {
        	return $http.post(url + 'cloths_POST.php?dolarhistoric=true', dolar);
        };

				this.getPctNac = function()
        {
        	return $http.get(url + 'cloths_GET.php?pctNac=true');
        };

				this.savePctNac = function(value)
        {
        	var pctNac = {value: value};
        	return $http.post(url + 'cloths_POST.php?pctNac=true', pctNac);
        };

        this.getInflation = function(year, month)
        {
          let dateParams = '';
          if (year && month) {
            dateParams = '&year='+year+'&month='+month;
          }
        	return $http.get(url + 'cloths_GET.php?inflation=true' + dateParams);
        };

				this.saveInflation = function(year, month, value, isNew)
        {
        	var inflation = {value: value, year: year, month: month, isNew: isNew};
        	return $http.post(url + 'cloths_POST.php?inflation=true', inflation);
        };

        this.getAllProviders = function()
        {
        	return $http.get(url + 'providers_GET.php?expand=FULL');
        };

        this.saveNewProduct = function(newProduct)
        {
        	newProduct.productId = uuid4.generate();

        	if(!newProduct.provider.id)
        		newProduct.provider.id = uuid4.generate();

        	return $http.post(url + 'providers_POST.php', newProduct);
        };

        this.getSails = function(groupId)
        {
        	return $http.get(url + 'sails_GET.php?expand=FULL&groupId='+groupId);
        };

				this.getAllSailGroups = function()
        {
        	return $http.get(url + 'sails_GET.php?sailGroups=true');
        };

        this.getAllBoats = function()
        {
        	return $http.get(url + 'boats_GET.php?expand=FULL');
        };

        this.getClothRolls = function(clothId, onlyAvailables)
        {
        	return $http.get(url + 'lists_GET.php?clothRolls=true&clothId='+clothId+"&onlyAvailables="+onlyAvailables);
        };

        this.updateProductCode = function(product)
        {
        	return $http.post(url + 'providers_POST.php?updateCode=true', product);
        };

        this.updateProductPrice = function(product)
        {
        	return $http.post(url + 'providers_POST.php?updatePrice=true', product);
        };

        this.updateRollType = function(roll)
        {
        	return $http.post(url + 'rolls_POST.php?updateType=true', roll);
        };

        this.updateRollField = function(roll, rollField, value)
        {
        	return $http.post(url + 'rolls_POST.php?updateField='+rollField+'&value='+value, roll);
        };

        this.updateProviderName = function(provider)
        {
        	return $http.post(url + 'providers_POST.php?updateName=true', provider);
        };

        this.saveManualRoll = function(roll)
        {
        	roll.id = uuid4.generate();

        	return $http.post(url + 'rolls_POST.php?manualRoll=true', roll);
        };

				this.saveGroup = function(group)
        {
        	return $http.post(url + 'groups_POST.php', group);
        };

				this.getCorrespondingCountryCloth = function(matchIds, country) {
					return $http.get(url + 'cloths_GET.php?matchIds='+matchIds.join(',')+'&previsionCountry='+country);
        }
        
        this.updateSailDesignMinutes = function(sail) {
          return $http.post(url + 'sails_POST.php?designMinutes=true', sail);
        }

        return this;
    }]);
