'use strict';

angular.module('vsko.stock').controller('ProvidersCtrl', ['$scope', '$rootScope', 'Stock', '$modal', function ($scope, $rootScope, Stock, $modal) {

  // initial list of providers
	Stock.getAllProviders().then(function(result) {
  	$scope.providers = result.data;
  });
}]);
