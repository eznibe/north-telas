'use strict';

angular.module('vsko.stock').controller('DispatchCtrl', ['$scope', 'Utils', 'Dispatchs', '$modal', 'uuid4', function ($scope, Utils, Dispatchs, $modal, uuid4) {

		Dispatchs.getDispatchs('CURRENTS').then(function(result){

			$scope.dispatchs = result.data;
		});


    $scope.addOrder = function(onedesign) {

    	plotter.cuts.push({plotterId:plotter.id, possibleRolls: plotter.possibleRolls, editable:true, isNew: true, id:uuid4.generate()});
    };

		$scope.deleteDispatch = function(dispatch) {

			Dispatchs.remove(dispatch).then(function(result) {
				if (result.data.successful) {
					$scope.dispatchs = $scope.dispatchs.filter(function(d) {
						return d.id != dispatch.id;
					});

					Utils.showMessage('notify.dispatch_removed');
				}
			});
		};

		$scope.archiveDispatch = function(dispatch) {

			Dispatchs.archive(dispatch).then(function(result) {
				if (result.data.successful) {
					$scope.dispatchs = $scope.dispatchs.filter(function(d) {
						return d.id != dispatch.id;
					});

					Utils.showMessage('notify.dispatch_archived');
				}
			});
		};

}]);
