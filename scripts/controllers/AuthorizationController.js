'use strict';

angular.module('vsko.stock').controller('AuthorizationCtrl', ['$scope', '$rootScope', '$cookieStore', '$location', '$route', '$window', 'Users', 'userRoles',
                                                             function ($scope, $rootScope, $cookieStore, $location, $route, $window, Users, userRoles) {

		$scope.login = function(user, passw) {

			Users.login(user, passw).then(function(response){

				if(response.data.successful) {

					$rootScope.user.name = user;
					$rootScope.user.password = "";
					$rootScope.user.role = response.data.role;
					$rootScope.user.sellerCode = response.data.sellerCode;
          $rootScope.user.id = response.data.id;

					// store in cookie to have access after a f5 reload
					$cookieStore.put('user', $rootScope.user);

					if($location.path() != '/login') {
						// reload the same view the user tried to enter
						// $route.reload();
            $window.location.reload();
					}
					else {
						// come from login -> redirect to the default page for the user role
						$location.path(userRoles[$rootScope.user.role][1]);
					}

					$rootScope.login_error = false;
				}
				else {
					$rootScope.login_error = true;
				}
			});
		};

		$scope.logout = function() {

			$rootScope.user = {};

			$cookieStore.remove('user');
		};

    $scope.searchBoxChanged = function() {

      $rootScope.searchBoxChangedObservers.map(function(fn) {
        fn($scope.searchBox);
      });
		};

}]);
