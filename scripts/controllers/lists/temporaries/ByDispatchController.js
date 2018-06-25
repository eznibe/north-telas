'use strict';

angular.module('vsko.stock').controller('TemporariesByDispatchCtrl', ['$scope', 'Utils', 'Temporaries', '$modal', function ($scope, Utils, Temporaries, $modal) {

	Temporaries.getAllDispatchs().then(function(result) {
    $scope.dispatchs = result.data.map(function(dispatch) {
      
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

      return dispatch;
    });
  });
  
  $scope.temporariesDispatchUpdated = function() {

    console.log('Dispatch udpated')
  }
}]);
