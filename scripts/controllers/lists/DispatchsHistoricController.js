'use strict';

angular.module('vsko.stock').controller('DispatchsHistoricCtrl', ['$scope', 'Dispatchs', 'Lists', 'Users', '$modal', function ($scope, Dispatchs, Lists, Users, $modal) {

	// initial filter options
	$scope.filter = {};
	$scope.filter.options = [{name:'Destinatario', key:'destinatary'},
													 {name:'Tracking', key:'tracking'},
													 {name:'Destino', key:'destiny'},
													 {name:'Nro orden', key:'orderNumber'}];

	Dispatchs.getDispatchs('HISTORIC', $scope.filter).then(function(result) {
		$scope.dispatchs = result.data;
	});

  $scope.search = function() {

 		Dispatchs.getDispatchs('HISTORIC', $scope.filter).then(function(result) {
 			$scope.dispatchs = result.data;
  	});
  };

	$scope.restoreDispatch = function(dispatch) {

		Dispatchs.restore(dispatch).then(function(result) {
			if (result.data.successful) {
				$scope.dispatchs = $scope.dispatchs.filter(function(d) {
					return d.id != dispatch.id;
				});

				Utils.showMessage('notify.dispatch_restored');
			}
		});
	};


				$scope.clearFilterOption = function() {
					$scope.filter.invoice = null;
					$scope.filter.selectedCloth = null;
					$scope.filter.selectedUser = null;
					$scope.filter.selectedProvider = null;
					$scope.filter.selectedGroup = null;
				};
}]);
