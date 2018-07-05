'use strict';

angular.module('vsko.stock').controller('TemporariesFilesCtrl', ['$scope', '$translate', 'Utils', 'Temporaries', '$modal', function ($scope, $translate, Utils, Temporaries, $modal) {

  $scope.filterOptions = {};
  $scope.filter = {};

  $scope.search = function() {
    
    $scope.files = [];
    
    Temporaries.getFilesList($scope.filter).then(function(result) {
      $scope.files = result.data;
    });
  }    
  
  $scope.temporariesFileUpdated = function() {

    console.log('File udpated')
  }

  $scope.changeOrder = function() {

    if ($scope.filter.selectedSort) {
      $scope.filter.selectedSort.mode = $scope.filter.selectedSort.mode == 'asc' ? 'desc' : 'asc';

      $scope.search();
    }
  }

  $scope.filterOptions.sort = [
    {
      key: 'shortName',
      name: 'Dispatch',
      mainOrder: 'd.shortName',
      extraOrder: ', c.name',
      mode: 'asc'
    },
    {
      key: 'cloth',
      name: 'Cloth',
      mainOrder: 'c.name',
      extraOrder: ', d.shortName',
      mode: 'asc'
    },
    {
      key: 'clothType',
      name: 'Cloth type',
      mainOrder: 'clothType',
      extraOrder: ', d.shortName, c.name',
      mode: 'asc'
    },
    {
      key: 'dueDate',
      name: 'Due date',
      mainOrder: 'd.dueDate',
      extraOrder: ', d.shortName, c.name',
      mode: 'asc'
    },
    {
      key: 'available',
      name: 'Temporaries available',
      mainOrder: 'fileAvailable',
      extraOrder: ', c.name, d.shortName',
      mode: 'asc'
    }
  ];

  // translate order options
  $scope.filterOptions.sort.forEach(function(order) {
    order.name = $translate.instant(order.name);
  });

  $scope.filter.selectedSort = $scope.filterOptions.sort[0];


  $scope.filterOptions.visibility = [
    {
      key: 'DISPATCH_AVAILABLE',
      name: 'Dispatch with availability',
    },
    {
      key: 'ONLY_EMPTIES',
      name: 'Without availability',
    },
    {
      key: 'ONLY_AVAILABLES',
      name: 'With availability',
    },
    {
      key: 'ALL',
      name: 'All',
    }
  ];

  $scope.filter.selectedVisibility = $scope.filterOptions.visibility[0];

  // translate visibility options
  $scope.filterOptions.visibility.forEach(function(v) {
    v.name = $translate.instant(v.name);
  });

  // initial search
  $scope.search();

}]);
