'use strict';

angular.module('vsko.stock').controller('TemporariesForDispatcherCtrl', ['$scope', 'Utils', 'Temporaries', '$modal', function ($scope, Utils, Temporaries, $modal) {

	Temporaries.getAllDispatchs().then(function(result) {
    $scope.dispatchs = result.data.map(function(dispatch) {
      
      updateDispatchAvailable(dispatch)

      return dispatch;
    });
  });
  
  $scope.temporariesDispatchUpdated = function() {

    console.log('Dispatch udpated')
  }

  $scope.calculateTotalMts = function() {
    var total = 0;

    if ($scope.dispatchs) {

      $scope.dispatchs.forEach(function(dispatch) {
        dispatch.files.forEach(function(f) {
          total += +f.fileAvailable;;
        });
      });
    }

    return total.toFixed(2);
  }

  function updateDispatchAvailable(dispatch) {

    var dispatchTotalAvailable = 0;
    var dispatchTotalInitial = 0;

    // foreach file calcultae and set .available
    dispatch.files.forEach(f => {
      
      f.available = Utils.calculateTemporariesFileAvailable(f);
      dispatchTotalAvailable += +f.available;
      dispatchTotalInitial += +f.mtsInitial;
    });
    
    // calculate dispatch available percantage according to the availbale of each cloth in it
    dispatch.available = (dispatchTotalAvailable * 100 / dispatchTotalInitial).toFixed(2);
  }
}]);
