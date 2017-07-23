'use strict';

angular.module('vsko.stock').controller('NotifyAlertCtrl', ['$scope', '$rootScope', '$translate', '$location', 'Utils', 'Users', 'userRoles',
                                                             function ($scope, $rootScope, $translate, $location, Utils, Users, userRoles) {

  $scope.hidePrevisionsAlert = true;

  function checkForPrevisionsNotify() {

    Users.existsPrevisionsNotify($rootScope.user).then(function(result) {

      if (result.data.existsPrevisionsNotify) {
        $scope.hidePrevisionsAlert = false;

        // only distinct order numbers
        var orders = []
        var allorders = result.data.orders.split(', ').forEach(function(o) {
          if (orders.indexOf(o) === -1)  {
            orders.push(o);
          }
        });

        $translate('Previsions alert', {orders: orders.join(', ')}).then(function(value) {
          $scope.message = value;
        });
      }
    });
  }

  $rootScope.pageChangedObservers.push(checkForPrevisionsNotify);

	$scope.closePrevisionsAlert = function() {

		$scope.hidePrevisionsAlert = true;

    Users.acceptPrevisionsNotify($rootScope.user).then(function(result) {

    });
	};

}]);
