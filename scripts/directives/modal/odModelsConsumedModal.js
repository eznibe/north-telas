'use strict';

angular.module('vsko.stock')

.directive('odModelsConsumedModal', function($modal, $translate, $rootScope, Utils, OneDesign) {

	return {
		restrict: 'E',
		link: function postLink(scope, element, attrs) {

			var $scope = scope;

			$scope.showModelsConsumedModal = async (model, year) => {

				const sail = model.sail.replace(/#/g, '%23');
				const result = await OneDesign.getModelsHistoricData(model.boat, sail, year);

				$scope.year = year;
				$scope.consumedOrders = result.data;

				$scope.modalConsumedModel = $modal({template: 'views/modal/odModelsConsumed.html', show: false, scope: $scope, backdrop:'static'});
				$scope.modalConsumedModel.$promise.then($scope.modalConsumedModel.show);
			};

			$scope.closeModelsConsumedModal = () => {
				$scope.modalConsumedModel.hide();
			};
		}
	}
});
