'use strict';

angular.module('vsko.stock').controller('DefaultPageCtrl', ['$rootScope', '$location', 'userRoles',
                                                             function ($rootScope, $location, userRoles) {
	$location.path(userRoles[$rootScope.user.role][1]);
}]);
