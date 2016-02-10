'use strict';

angular.module('vsko.stock').controller('PrevisionsCtrl', ['$scope', 'Previsions', '$modal', function ($scope, Previsions, $modal) {

    	$scope.maxCloths = 3;

        // initial list of cloth groups
    	Previsions.getAll(true).then(function(result) {
        	$scope.previsions = result.data;

//        	$.each($scope.previsions, function(index) {
//
//        	});
        });

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
