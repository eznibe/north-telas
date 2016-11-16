'use strict';

angular.module('vsko.stock').controller('OnedesignCtrl', ['$scope', '$rootScope', 'Utils', 'OneDesign', '$modal', 'uuid4', function ($scope, $rootScope, Utils, OneDesign, $modal, uuid4) {

		OneDesign.getBoats().then(function(result){

			$scope.boats = result.data;
		});

        $scope.addSail = function(onedesign) {

        	plotter.cuts.push({plotterId:plotter.id, possibleRolls: plotter.possibleRolls, editable:true, isNew: true, id:uuid4.generate()});
        };

        $scope.deleteOneDesign = function(boat) {

        	OneDesign.deleteBoat(boat).then(function(result){

        		if(result.data.successful) {

        			$scope.boats.remove(boat);

							Utils.showMessage('notify.od_boat_deleted');
        		}
        	});
        };

				$scope.changedName = function(boat) {

					OneDesign.updateBoatName(boat).then(function(result){

						console.log("Changed boat name to "+boat.boat);

						if(!result.data.successful) {
							boat.boat = result.data.oldName;
						}
					});
				};

				$scope.visibleByUserCountry = function(boat) {
					return boat.country == $rootScope.user.storedCountry || $rootScope.user.storedCountry == 'ARG';
				}

}]);
