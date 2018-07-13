'use strict';

angular.module('vsko.stock').controller('TemporariesStockCtrl', ['$scope', 'Utils', 'Stock', 'Temporaries', '$modal', function ($scope, Utils, Stock, Temporaries, $modal) {

  $scope.filter = {};
  
  Stock.getAllGroups(true).then(function(result) {
    
    $scope.groups = result.data;

    $scope.groups.unshift({name: 'Ver todos'});
    
    $scope.filter.selectedGroup = $scope.groups[1];
    
    $scope.search();
  });


  $scope.search = function() {

    $scope.filter.groupId = $scope.filter.selectedGroup.id;

    Temporaries.getTemporariesStock($scope.filter).then(function(result) {
          
      $scope.cloths = result.data.filter(function(cloth) {
        return !$scope.filter.onlyAvailable || +cloth.temporaryAvailable > 0;
      });
    });
  };
}]);
