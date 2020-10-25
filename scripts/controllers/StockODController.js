'use strict';

angular.module('vsko.stock').controller('StockODCtrl', ['$scope', '$rootScope', 'Utils', 'OneDesign', '$modal', 'uuid4', function ($scope, $rootScope, Utils, OneDesign, $modal, uuid4) {

  $scope.isSeller = $rootScope.user.role === 'vendedor';
  
  $scope.filter = {
    boats: [],
    models: []
  }
  $scope.models = [];

  OneDesign.getModels($rootScope.user.storedCountry).then(function(result){

    $scope.models = [...result.data];

    $scope.filter.boats = Array.from($scope.models.reduce((set, item) => set.add(item.boat), new Set()));
  });

  $scope.boatFilter = (model) => {
    return !$scope.filter.selectedBoat || model.boat === $scope.filter.selectedBoat;
  } 

  $scope.createOwnProduction = () => {
    $scope.showPrevisionModal({isNew: true, oneDesign: true, odUnassigned: true, ownProduction: true, greaterThan44: false, country: $rootScope.user.country})
  }

  $scope.stock = (model) => {
    return +model.stock;
  }

  $scope.manufacture = (model) => {
    return +model.manufacture;
  }

  $scope.plotter = (model) => {
    return +model.plotter;
  }

  $scope.total = (model) => {
    return $scope.stock(model) + $scope.manufacture(model) + $scope.plotter(model);
  }

  $scope.isNextModelSerieEmpty = (model) => {
    return !+model.maxSequence && !+model.nextSequence;
  }
}]);
