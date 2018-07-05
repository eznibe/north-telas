'use strict';

angular.module('vsko.stock').controller('TemporariesStockCtrl', ['$scope', 'Utils', 'Stock', 'Temporaries', '$modal', function ($scope, Utils, Stock, Temporaries, $modal) {

  $scope.filter = {};
  
  Stock.getAllGroups().then(function(result) {
    
    $scope.groups = result.data;
    
    $scope.filter.selectedGroup = $scope.groups[0];
    
    Temporaries.getTemporariesStock($scope.filter.selectedGroup.id).then(function(result) {
          
      $scope.cloths = result.data;
    });
  });

  
  $scope.filterByGroup = function(selectedGroup) {
    
    if(selectedGroup) {
      Temporaries.getTemporariesStock(selectedGroup.id).then(function(result) {
          
        $scope.cloths = result.data;
      });
    }
  };
}]);
