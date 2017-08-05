'use strict';

angular.module('vsko.stock')

.factory('Users', ['$http', 'uuid4', function ($http, uuid4) {

				var url = telasAPIUrl;

        this.login = function(user, passw)
        {

        	var data = {user: user, passw: passw};

        	return $http.post(url + 'login_POST.php', data);
        };

        this.getAllUsers = function(storedCountry) {
        	return $http.get(url + 'users_GET.php?storedCountry='+storedCountry);
        } ;

        this.getUser = function(userId) {
        	return $http.get(url + 'users_GET.php?id='+userId);
        } ;

				// Only users that did at least one plotter cut
				this.getPlotterUsers = function() {
        	return $http.get(url + 'users_GET.php?plotter=true');
        } ;

        this.getRoles = function() {
        	return $http.get(url + 'users_GET.php?roles=true');
        } ;

        this.save = function(user) {

        	if(!user.id) {
        		user.id = uuid4.generate();
        	}

        	return $http.post(url + 'users_POST.php', user);
        };

				this.updateCountry = function(user) {

        	return $http.post(url + 'users_POST.php?updateCountry=true', user);
        };

        this.deleteUser = function(user) {

        	return $http.delete(url + 'users_DELETE.php?id='+ user.id);
        };

				this.existsNewDispatch = function(user) {
					return $http.get(url + 'users_GET.php?existsNewDispatch=true&id='+ user.id);
				};

				this.acceptNewDispatch = function(user) {
					return $http.post(url + 'users_POST.php?acceptNewDispatch=true', user);
				};

				// used to show alert of prevision with general obs changed
				this.existsPrevisionsNotify = function(user) {
					return $http.get(url + 'users_GET.php?existsPrevisionsNotify=true&id='+ user.id);
				};

				this.acceptPrevisionsNotify = function(user) {
					return $http.post(url + 'users_POST.php?acceptPrevisionsNotify=true', user);
				};

				this.storePrevisionNotify = function(user, orderNumber) {
					user.orderNumber = orderNumber;
					return $http.post(url + 'users_POST.php?storePrevisionNotify=true', user);
				};

				// store / load columns state
				this.loadColumnsState = function(userId, type) {
					return $http.get(url + 'users_GET.php?loadColumnsState=true&userId=' + userId + '&type=' + type);
				};

				this.storeColumnsState = function(userId, type, columnsState) {
					console.log('Columns state:',columnsState)
					var data = {userId: userId, type: type, columnsState: JSON.stringify(columnsState)};
					return $http.post(url + 'users_POST.php?storeColumnsState=true', data);
				};

        return this;
    }]);
