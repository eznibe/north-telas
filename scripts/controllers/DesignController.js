'use strict';

angular.module('vsko.stock').controller('DesignCtrl', ['$scope', 'Utils', 'Previsions', '$modal', function ($scope, Utils, Previsions, $modal) {

        // initial list of previsions
        Previsions.getAll(false).then(function(result) {
        	$scope.previsions = result.data;
        });

        $scope.designed = function(prevision) {

        	Previsions.designed(prevision).then(function(result) {
            	$scope.previsions.remove(prevision);

            	console.log('Designed: '+prevision.orderNumber);

              Utils.showMessage('notify.order_to_plotter');

              var clothsIds = prevision.cloths.map(function(c) { return c.clothId; }).join(',');

              Previsions.updatePrevisionState(clothsIds).then(function() {
                Utils.showMessage('notify.previsions_state_updated');
  						});
            });

        	//prevision.designed = prevision.designed ? !prevision.designed : true;
        };

        $scope.editObservations = function(prevision) {

        	Previsions.editObservations(prevision).then(function(result){

        	   console.log('Observation changed to: '+prevision.observations);
    		  });
        }
}]);
