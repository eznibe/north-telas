'use strict';

angular.module('vsko.stock')

.factory('Users', ['$http', 'uuid4', function ($http, uuid4) {

				var url = telasAPIUrl;

        this.login = function(user, passw)
        {

        	var data = {user: user, passw: passw};

        	return $http.post(url + 'login_POST.php', data);
        };

        this.getAllUsers = function() {
        	return $http.get(url + 'users_GET.php');
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

        this.deleteUser = function(user) {

        	return $http.delete(url + 'users_DELETE.php?id='+ user.id);
        };

        return this;
    }]);
