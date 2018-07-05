'use strict';

angular.module('vsko.stock').controller('TemporariesForDispatcherCtrl', ['$scope', 'Utils', 'Temporaries', '$modal', function ($scope, Utils, Temporaries, $modal) {

	Temporaries.getAllDispatchs().then(function(result) {
    $scope.dispatchs = result.data;
  });
  
  $scope.temporariesDispatchUpdated = function() {

    console.log('Dispatch udpated');

    Temporaries.getAllDispatchs().then(function(result) {
      $scope.dispatchs = result.data;
    });
  }

  $scope.calculateTotalMts = function() {
    var total = 0;

    if ($scope.dispatchs) {

      $scope.dispatchs.forEach(function(dispatch) {
        dispatch.files.forEach(function(f) {
          total += +f.available;
        });
      });
    }

    return total.toFixed(2);
  }

  $scope.dispatchAvailablePercentage = function(dispatch) {
    if (!dispatch) {
      return;
    }
    return (+dispatch.available * 100 / (+dispatch.init)).toFixed(0);
  }

}]);
