'use strict';

angular.module('vsko.stock').controller('TemporariesCompareCtrl', ['$scope', '$translate', 'Utils', 'Stock', 'Temporaries', '$modal', function ($scope, $translate, Utils, Stock, Temporaries, $modal) {

  $scope.filterOptions = {};
  $scope.filter = {};
  
  Stock.getAllGroups(true).then(function(result) {
    
    $scope.groups = result.data;

    $scope.groups.unshift({name: 'Ver todos'});
    
    $scope.filter.selectedGroup = $scope.groups[1];
    
    $scope.search();
  });

  
  $scope.filterByGroup = function(selectedGroup) {
    
    if(selectedGroup) {
      Temporaries.getTemporariesStock(selectedGroup.id).then(function(result) {
          
        $scope.cloths = result.data;
      });
    }
  };

  $scope.search = function() {

    $scope.filter.groupId = $scope.filter.selectedGroup.id;

    Temporaries.getTemporariesStock($scope.filter).then(function(result) {
          
      $scope.cloths = result.data;
    });
  };

  $scope.changeOrder = function() {

    if ($scope.filter.selectedSort) {
      $scope.filter.selectedSort.mode = $scope.filter.selectedSort.mode == 'asc' ? 'desc' : 'asc';

      $scope.search();
    }
  }

  $scope.sort = function(column) {
    console.log('Sory by:',column)
  }

  $scope.totalTemp = function(c) {
    return +c.temporaryAvailable <= 0 ? 0 : (+c.temporaryAvailable - +c.toExportCutted).toFixed(0);
  };

  $scope.compareStocks = function(c) {
    return (+c.stockInHouse - $scope.totalTemp(c)).toFixed(0);
  };

  $scope.compareStocksStyle = function(c) {
    return $scope.compareStocks(c) < 0 ? {'color': 'red', 'background-color': '#e4e4e4'} : {'background-color': '#e4e4e4'};
  };

  $scope.filterOptions.sort = [
    {
      key: 'cloth',
      name: 'Cloth',
      mainOrder: 'c.name',
      extraOrder: '',
      mode: 'asc'
    },
    {
      key: 'stock',
      name: 'Stock north',
      mainOrder: 'c.stockInHouse',
      extraOrder: ', c.name',
      mode: 'asc'
    },
    {
      key: 'files',
      name: 'Files today',
      mainOrder: 'c.temporaryAvailable',
      extraOrder: ', c.name',
      mode: 'asc'
    },
    {
      key: 'cutted',
      name: 'Temporaries cutted',
      mainOrder: 'c.toExportCutted',
      extraOrder: ', c.name',
      mode: 'asc'
    },
    {
      key: 'compare',
      name: 'Compare real stock',
      mainOrder: 'c.stockCompare',
      extraOrder: ', c.name',
      mode: 'asc'
    }
  ];

  // translate order options
  $scope.filterOptions.sort.forEach(function(order) {
    order.name = $translate.instant(order.name);
  });

  $scope.filter.selectedSort = $scope.filterOptions.sort[0];
}]);
