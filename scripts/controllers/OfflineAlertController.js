'use strict';

angular.module('vsko.stock').controller('OfflineAlertCtrl', ['$scope', '$rootScope', '$translate', '$location', 'Utils', 'Users', 'userRoles',
                                                             function ($scope, $rootScope, $translate, $location, Utils, Users, userRoles) {

   $translate('Offline alert').then(function(value) {
     $scope.offlinemessage = value;
   });

}]);
