'use strict';

angular.module('vsko.stock')

.controller('UsersCtrl', ['$scope', 'Users', '$modal', 'countries', '$rootScope', function ($scope, Users, $modal, countries, $rootScope) {

        // initial list of all users
        Users.getAllUsers($rootScope.user.storedCountry).then(function(result) {

        	$scope.users = result.data;
        });

        $scope.countries = countries;

        // Modal functions
        $scope.showModal = function(user) {

        	$scope.user = user ? user : {country: $rootScope.user.country};

        	$scope.oldPassword = $scope.user.password;

        	$scope.origUser = user ? $.extend(true, {}, user) : {}; // used when the user cancel the modifications (close the modal)

        	Users.getRoles().then(function(result) {

            	$scope.roles = result.data;
            });


        	$scope.modalUser = $modal({template: 'views/modal/user.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

            $scope.modalUser.$promise.then($scope.modalUser.show);
        };

        $scope.save = function(user) {

        	if(user.newPassword){
        		if($scope.oldPassword == user.oldPassword) {

        			user.password = user.newPassword;
        		}
	        	else {
	        		$scope.modalCtrl.form.oldPassword.$setValidity('oldPassword', false);
	        		return;
	        	}
        	}

        	var newUser = !user.id;

	    		Users.save(user).then(function(result){

	    			if(newUser)
	    				$scope.users.push(user);

	    			$scope.modalUser.hide();
	    		});
        };

        $scope.deleteUser = function(user) {

      		Users.deleteUser(user).then(function(result){

      			$scope.users.remove(user);
      		});
        };

        $scope.close = function() {

        	$.extend($scope.user, $scope.origUser);

        	$scope.modalUser.hide();
        };

        $scope.setModalCtrl = function(modalCtrl) {
        	// used later to access the form elements of the modal html
        	$scope.modalCtrl = modalCtrl;
        };

        $scope.canEditUser = function(user) {
          return $rootScope.user.storedCountry === 'ARG' || user.country === 'BRA';
        }

        $scope.canEditCountry = function(user) {
          return $rootScope.user.storedCountry === 'ARG';
        }
}]);
