'use strict';

angular.module('vsko.stock').controller('DesignCtrl', ['$scope', 'Previsions', '$modal', function ($scope, Previsions, $modal) {

        // initial list of previsions
        Previsions.getAll(false).then(function(result) {
        	$scope.previsions = result.data;
        });

        $scope.designed = function(prevision) {

        	Previsions.designed(prevision).then(function(result) {
            	$scope.previsions.remove(prevision);

            	console.log('Designed: '+prevision.orderNumber);

            	$.notify("Orden pasada a plotter.", {className: "success", globalPosition: "bottom right"});
            });

        	//prevision.designed = prevision.designed ? !prevision.designed : true;
        };

        $scope.editObservations = function(prevision) {

        	Previsions.editObservations(prevision).then(function(result){

        	   console.log('Observation changed to: '+prevision.observations);
    		  });
        }
}]);
