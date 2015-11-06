'use strict';

angular.module('vsko.stock').controller('OnedesignCtrl', ['$scope', 'OneDesign', '$modal', 'uuid4', function ($scope, OneDesign, $modal, uuid4) {

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

        			$.notify("Barco eliminado como OD.", {className: "success", globalPosition: "bottom right"});
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

}]);
