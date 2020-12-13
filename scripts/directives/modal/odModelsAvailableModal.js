'use strict';

angular.module('vsko.stock')

.directive('odModelsAvailableModal', function($modal, $translate, $rootScope, Utils, OneDesign, Previsions) {

	return {
		restrict: 'E',
		link: function postLink(scope, element, attrs) {

			var $scope = scope;

			$scope.notAsignedOrders = [
				{
					id: 1,
					orderNumber: 'J2HC-15',
					client: '',
					boat: 'J-70',
					sailName: 'J2HC',
					percentage: 6,
					observations: '',
					oneDesign: true,
					odUnassigned: true
				}
			];

			$scope.showModelsAvailableModal = async (prevision, callback) => {

				const result = await OneDesign.getModelPrevisions(prevision.selectedBoat.boat, prevision.selectedOneDesignSail.sail, true, false);
              
				if (!prevision.ownProduction) {
					$scope.notAssignedOrders = result.data;
					$scope.modalModel = $modal({template: 'views/modal/odModelsAvailable.html', show: false, callback, scope: $scope, backdrop:'static'});
					$scope.modalModel.$promise.then($scope.modalModel.show);
				} else {
					// no avaialble own production models => create a new one
					callback({ newOwnProduction: true });
				}
			};

			$scope.closeModelsAvailableModal = () => {
				$scope.modalModel.$options.callback({});
				$scope.modalModel.hide();
			};

			$scope.select = (prevision) => {

				$scope.modalModel.$options.callback({prevision});
				$scope.modalModel.hide();
			};

			$scope.newOwnProduction = () => {
				$scope.modalModel.$options.callback({ newOwnProduction: true });
				$scope.modalModel.hide();
			}
		}
	}
});
