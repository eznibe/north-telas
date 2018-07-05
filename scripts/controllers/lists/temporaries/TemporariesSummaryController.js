'use strict';

angular.module('vsko.stock').controller('TemporariesSummaryCtrl', ['$scope', 'Utils', 'Temporaries', '$modal', function ($scope, Utils, Temporaries, $modal) {

  $scope.columns = [];

	Temporaries.getAllDispatchs().then(function(result) {
    $scope.dispatchs = result.data.map(function(dispatch) {
      
      updateDispatchAvailable(dispatch);      
      
      return dispatch;
    });

    $scope.columns = generateColumns($scope.dispatchs);
  });
  
  $scope.temporariesDispatchUpdated = function() {

    console.log('Dispatch udpated')
  }

  $scope.getFiles = function(dispatch, column) {

    var files = [];

    $scope.dispatchs.forEach(function(d) {
      if (d.id === dispatch.id) {
        d.files.forEach(function(f) {
          if (f.clothType === column) {
            files.push(f);
          }
        });
      }
    });

    return files;
  }

  $scope.calculateTotalMtsForColumn = function(column) {
    var total = 0;

    $scope.dispatchs.forEach(function(d) {
      d.files.forEach(function(f) {
        if (f.clothType === column) {
          total += +f.available;
        }
      });
    });

    return total.toFixed(2);
  }

  $scope.calculateTotalMts = function() {
    var total = 0;

    $scope.columns.forEach(function(column) {
      total += +$scope.calculateTotalMtsForColumn(column);
    });

    return total.toFixed(2);
  }

  function generateColumns(dispatchs) {

    var columns = [];

    dispatchs.forEach(function(d) {
      d.files.forEach(function(f) {
        // var matchColumns = columns.filter(function(c) { return f.clothType === c.name});
        if (columns.indexOf(f.clothType) === -1) {
          columns.push(f.clothType);
        }
      });
    }); 

    columns.sort();

    return columns;
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
