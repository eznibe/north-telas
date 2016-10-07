'use strict';

angular.module('vsko.stock').controller('ProfileCtrl', ['$scope', '$translate', '$cookieStore', '$rootScope', 'Utils', function ($scope, $translate, $cookieStore, $rootScope, Utils) {

      $scope.changeLanguage = function(lang) {
        $translate.use(lang);
        $cookieStore.put('lang', lang);
      };

      $scope.changeFontSize = function(sizeClass) {
        $rootScope.fontSizeClass = sizeClass;
        $cookieStore.put('fontsize', sizeClass);
        
        Utils.showMessage('notify.fontsize_updated');
      };

}]);
