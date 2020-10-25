'use strict';

angular.module('vsko.stock').controller('HistoricODCtrl', ['$scope', '$rootScope', 'Utils', 'OneDesign', '$modal', function ($scope, $rootScope, Utils, OneDesign, $modal) {

  $scope.isSeller = $rootScope.user.role === 'vendedor';
  $scope.filter = {
    boats: [],
  }

  $scope.models = [];

  OneDesign.getModelsHistoricData().then(function(result){

    const ungroupedModels = [...result.data];

    $scope.models = ungroupedModels.reduce((models, item) => {
      const model = models.find(m => m.boat === item.boat && m.sail === item.sail);
      if (model) {
        model.years.push({year: +item.year, amount: +item.amount});
      } else {
        models.push({
          ...item,
          years: [{year: +item.year, amount: +item.amount}]
        })
      }
      delete item.year;
      delete item.amount;
      return models;
    }, []);

    console.log($scope.models);

    $scope.filter.boats = Array.from($scope.models.reduce((set, item) => set.add(item.boat), new Set()));
  });

  // TODO calculate
  const currentYear = 2020;
  $scope.years = [];
  for(let y=(currentYear); y > (currentYear - 8); y--) {
    $scope.years.push(y);
  }

  $scope.boatFilter = (model) => {
    return !$scope.filter.selectedBoat || model.boat === $scope.filter.selectedBoat;
  } 

  $scope.yearAmount = (model, year) => {
    const modelYear = model.years.find(y => y.year === year);
    return modelYear ? modelYear.amount : '-';
  }
}]);
