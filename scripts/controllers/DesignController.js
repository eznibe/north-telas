'use strict';

angular.module('vsko.stock').controller('DesignCtrl', ['$scope', 'Utils', 'Previsions', 'Rules', '$modal', function ($scope, Utils, Previsions, Rules, $modal) {

        // initial list of previsions
        Previsions.getAll(false, 'DESIGN').then(function(result) {
        	$scope.previsions = result.data;
        });

        $scope.designed = function(prevision) {

          Previsions.designed(prevision).then(function(result) {

            if (result.data.successful) {

              prevision.designed = true;

              Rules.updatePrevisionPercentage(prevision, true);

              $scope.previsions.remove(prevision);

              console.log('Designed: '+prevision.orderNumber);

              Utils.showMessage('notify.order_to_plotter');

              var clothsIds = prevision.cloths.map(function(c) { return c.clothId; }).join(',');

              Previsions.updatePrevisionState(clothsIds, prevision.id).then(function() {
                Utils.showMessage('notify.previsions_state_updated');
              });
            } else {
              Utils.showMessage('notify.order_to_plotter_error', 'error');
            }
          });

          //prevision.designed = prevision.designed ? !prevision.designed : true;
        };

        $scope.editObservations = function(prevision) {

        	Previsions.editObservations(prevision, 'designObservations').then(function(result){
            $scope.$broadcast('$$rebind::refreshObservations');
    		  });
        }
}]);
