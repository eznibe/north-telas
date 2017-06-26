'use strict';

angular.module('vsko.stock').controller('ProfileCtrl', ['$scope', '$translate', '$cookieStore', '$rootScope', 'countries', 'Utils', 'Users', function ($scope, $translate, $cookieStore, $rootScope, countries, Utils, Users) {

  $scope.changeLanguage = function(lang) {
    $translate.use(lang);
    $cookieStore.put('lang', lang);
  };

  $scope.changeFontSize = function(sizeClass) {
    $rootScope.fontSizeClass = sizeClass;
    $cookieStore.put('fontsize', sizeClass);

    Utils.showMessage('notify.fontsize_updated');
  };


  $scope.countries = countries.list;//, 'ALL'];
  $scope.country = $rootScope.user.country;

  $scope.changeCountry = function() {
    var user = $rootScope.user;
    user.country = $scope.country;
    $cookieStore.put('user', user);

    // save country change
    Users.updateCountry(user).then(function(result) {
      if(!result.data.successful) {

      }
    });
  };

}]);
