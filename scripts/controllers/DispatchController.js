'use strict';

angular.module('vsko.stock').controller('DispatchCtrl', ['$scope', '$rootScope', 'Utils', 'Dispatchs', '$modal', 'uuid4', function ($scope, $rootScope, Utils, Dispatchs, $modal, uuid4) {

	$scope.isSeller = $rootScope.user.role === 'vendedor';

	Dispatchs.getDispatchs('CURRENTS', null, null, $rootScope.user.sellerCode).then(function(result){

		$scope.dispatchs = result.data.map(r => {
			r.closedForSellers = r.closedForSellers === "1" ? true : false;
			return r;
		});
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

			dispatch.user = $rootScope.user.name;

			Dispatchs.archive(dispatch).then(function(result) {
				if (result.data.successful) {
					$scope.dispatchs = $scope.dispatchs.filter(function(d) {
						return d.id != dispatch.id;
					});

					Utils.showMessage('notify.dispatch_archived');
				} else {
					Utils.showMessage('notify.dispatch_archived_error', 'error');
				}
			});
		};

		$scope.openDispatch = async (dispatch) => {
			if (!$scope.isSeller) {
				dispatch.closedForSellers = false;
				await Dispatchs.toggleClosedForSellers(dispatch);
			}
		}

		$scope.closeDispatch = async (dispatch) => {
			if (!$scope.isSeller) {
				dispatch.closedForSellers = true;
				await Dispatchs.toggleClosedForSellers(dispatch);
			}
		}
}]);
