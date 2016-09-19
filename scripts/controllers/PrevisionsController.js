'use strict';

angular.module('vsko.stock').controller('PrevisionsCtrl', ['$scope', '$timeout', 'Previsions', 'DriveAPI', '$modal', function ($scope, $timeout, Previsions, DriveAPI, $modal) {

    	$scope.maxCloths = 3;

      // initial list of cloth groups
    	Previsions.getAll(true, 'LIST').then(function(result) {
        $scope.previsions = result.data;
      });

      // just init the drive api to ensure we have the v3 loaded (avoiding problems with v2 loaded by the google picker)
      $timeout(function() {
  			DriveAPI.init();
  		}, 2500);

    	$scope.sortOptions = [{id:'unformattedDeliveryDate', name:'Fecha'}, {id:'orderNumber', name:'Numero de orden'}];

    	$scope.reverse = false;

    	$scope.changeOrder = function() {
    		$scope.reverse = !$scope.reverse;
    	};

			$scope.updatePrevision = function() {
    		Previsions.updatePrevisionState('148');
    	};

      $scope.updateAllPrevisionsStates = function() {
    		Previsions.updateAllPrevisionsStates();
    	};

      $scope.filterStateChanged = function(p) {

        if(!$scope.showStateChanged) {

          return !p.designed;
        }

    		return p.stateAccepted=='0';
    	};

      $scope.acceptStateChange = function(p) {
        Previsions.acceptStateChange(p).then(function() {
          $.notify("Cambio de estado aceptado.", {className: "success", globalPosition: "bottom right"});
          p.stateAccepted = '1';
        });
      };

    	$scope.format = function(date) {
      	  var dateParts = date.split("-");

      	  return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
        };
}]);
