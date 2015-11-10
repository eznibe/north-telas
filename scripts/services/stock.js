// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Stock', ['$http', '$q', 'uuid4', function ($http, $q, uuid4) {

		var url = telasAPIUrl;

        this.getAllGroups = function()
        {
        	return $http.get(url + 'groups_GET.php?expand=FULL');
        };

        this.idp = function()
        {
//        	return $http.post('http://testproefidp.vvkbao.be/idp/api/enscriptions', {test:'test', input:'inputTests'});
//        	return $http.post('http://testproefidp.vvkbao.be/idp/alive', "{test:'test', input:'inputTests'}");
//        	return $http.post('http://testproefidp.vvkbao.be/idp/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

//		return $http.post('http://localhost:8080/idp/alive?input=test');
        	//return $http.post('http://testproefidp.vvkbao.be/idp/alive?input=test');
//        	return $http.get('http://testproefidp.vvkbao.be/idp/alive?input=test');

//		return $http.post('http://localhost:8080/files/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

//        	return $http.post('http://eznibe.no-ip.biz/files/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

//        	return $http.post('http://accfiles.vsko.be/files/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

	//	return $http.post('http://testdavid.vsko.be/david/alive?input=Belgie', {'test':'test', 'input':'inputTests'});

//        	return $http.post('http://testwerkgroepen.vsko.be/alive?input=Belgi%C3%AB', {'test':'test', 'input':'inputTests'});
        	return $http.get('http://testwerkgroepen.vsko.be/alive?input=Belgi%C3%AB');
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
        	return $http.get(url + 'groups_GET.php?id='+groupId+'&expand='+expansion);
        };

        this.getAllCloths = function()
        {
        	return $http.get(url + 'cloths_GET.php?expand=FULL');
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

				this.deleteCloth = function(cloth) {

					return $http.delete(url + 'cloths_DELETE.php?clothId='+ cloth.id);
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

        this.saveDolar = function(value)
        {
        	var dolar = {value: value};
        	return $http.post(url + 'cloths_POST.php?dolar=true', dolar);
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

        this.getAllSails = function()
        {
        	return $http.get(url + 'sails_GET.php?expand=FULL');
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

        return this;
    }]);
