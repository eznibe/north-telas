'use strict';

angular.module('vsko.stock').controller('DispatchCtrl', ['$scope', 'Utils', 'OneDesign', '$modal', 'uuid4', function ($scope, Utils, OneDesign, $modal, uuid4) {

		// Dispatch.getBoats().then(function(result){
		//
		// 	$scope.boats = result.data;
		// });

		$scope.dispatchs = [{number: '123-456-789', date: '07-06-2016',
												 orders: [{orderNumber: 'V8112-1', deliveryDate: '05-06-2016', sail: 'Vela1'},
												 					{orderNumber: 'V8112-2', deliveryDate: '07-06-2016', sail: 'Vela2'}]},
												{number: '741-258-963', date: '25-06-2016',
												 orders: [{orderNumber: 'V9558-1', deliveryDate: '22-06-2016', sail: 'Vela3'}]}];

        $scope.addOrder = function(onedesign) {

        	plotter.cuts.push({plotterId:plotter.id, possibleRolls: plotter.possibleRolls, editable:true, isNew: true, id:uuid4.generate()});
        };

        $scope.deleteDispatch = function(boat) {

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

}]);
