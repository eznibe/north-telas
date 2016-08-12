'use strict';

angular.module('vsko.stock').controller('PlotterCtrl', ['$scope', '$rootScope', 'Utils', 'Previsions', 'Plotters', 'Stock', 'Lists', 'Rules', 'uuid4', function ($scope, $rootScope, Utils, Previsions, Plotters, Stock, Lists, Rules, uuid4) {

        // initial list of plotters
		loadAllPlotters();

        $scope.cutted = function(plotter) {

        	// value from 0/1 to boolean
        	plotter.cutted = plotter.cutted=='0' ? false : (plotter.cutted=='1' ? true : plotter.cutted);

        	plotter.cutted = plotter.cutted ? !plotter.cutted : true;

        	Plotters.cutted(plotter, $rootScope.user.name).then(function(result){

						if(result.data.successful && result.data.successfulRolls) {
	        		$scope.plotters.remove(plotter);

	        		console.log('Cutted: ', plotter);

							Utils.showMessage('notify.cloth_cutted');

							Previsions.updatePrevisionState(plotter.clothId).then(function() {
								Utils.showMessage('notify.previsions_state_updated');
							});

							if (plotter.previsionId) {
								Previsions.checkAllClothsCutted(plotter.previsionId).then(function(prevision) {
									if (prevision.data.allCutted) {
										Rules.updatePrevisionPercentage(prevision.data, true);
									}
								});
							}
						}
						else if(!result.data.successful) {
							Lists.log({type: 'error.finishPlotter', log: result.data.update}).then(function(result) {});
							Utils.showMessage('notify.plotter_cut_failed', 'error');
						}
						else if(!result.data.successfulRolls) {
							Lists.log({type: 'error.updateRolls', log: result.data.updateRolls}).then(function(result) {});
							Utils.showMessage('notify.plotter_rolls_update_failed', 'error');
						}
        	});
        };

        $scope.addCut = function(plotter) {

        	Plotters.getPossibleRolls(plotter).then(function(possibleRolls){

    			plotter.possibleRolls = possibleRolls.data;

    			var newcut = {plotterId:plotter.id, possibleRolls: plotter.possibleRolls, editable:true, isNew: true, id:uuid4.generate(), mtsPendingToBeCutted: 0};

    			if(plotter.possibleRolls.length==0) {
    	  			plotter.possibleRolls.push({display: 'Sin rollos'});
    	  			newcut.selectedRoll = plotter.possibleRolls[0];
    			}

    			plotter.cuts.push(newcut);
    		});
        };

        $scope.editObservations = function(plotter) {

        	Plotters.editObservations(plotter).then(function(result){

        		console.log('Observation changed to: '+plotter.observations);
    		});
        }

        $scope.filledCuts = function(plotter) {

        	var filled = false;

        	$.each(plotter.cuts, function(idx, c){

        		if(c.selectedRoll && c.mtsCutted && c.mtsCutted > 0 && !c.editable)
        			filled = true;
        	});

        	return filled;
        };

        $scope.search = function() {

        	if($scope.search.order) {
	        	Plotters.search($scope.search.order).then(function(result){

	        		$scope.plotters = result.data;

	        		// load for each cut of each plotter the selected roll and set the possibleRolls corresponding to each plotter&cuts
	    	    	$scope.plotters.each(function( plotter ) {

	    	    		if(plotter.cutted=='1') {
	    	    			// for cutted plotters load info of user and timestamp for tooltip
	    	    			plotter.tooltip = "Cortado por '"+(plotter.cuttedBy ? plotter.cuttedBy : '?')+"' el "+plotter.cuttedTimestamp;
	    	    		}

	    	    		Stock.getClothRolls(plotter.clothId, false).then(function(result) {

	    	    			plotter.possibleRolls = result.data;

	    	    			$scope.loadSelectedRoll(plotter.cuts, result.data);
	    	    		});
	    	    	});
	        	});
        	}
        	else {
        		loadAllPlotters();
        	}
        };

        $scope.restore = function(plotter) {
        	// restore an already cutted plotter
        	plotter.cutted = plotter.cutted ? !plotter.cutted : true;

        	Plotters.restore(plotter).then(function(result){

        		console.log('Restored: '+plotter.id);

        		Plotters.getPossibleRolls(plotter).then(function(possibleRolls){

		    			plotter.possibleRolls = possibleRolls.data;

		    			$scope.loadSelectedRoll(plotter.cuts, possibleRolls.data);
		    		});

						Utils.showMessage('notify.cloth_back_to_plotter');

						Previsions.updatePrevisionState(plotter.clothId).then(function() {
							Utils.showMessage('notify.previsions_state_updated');
						});
        	});
        };

        $scope.deletePlotter = function(plotter) {

        	Plotters.removePlotter(plotter.id).then(function(result){

        		$scope.plotters.remove(plotter);

						Utils.showMessage('notify.plotter_deleted');

						Previsions.checkAllClothsCutted(plotter.previsionId).then(function(prevision) {
							if (prevision.data.allCutted) {
								Rules.updatePrevisionPercentage(prevision.data, true);
							}
						});
        	});
        };

        $scope.restoreToDesign = function(plotter) {

        	console.log('restore plotter');

        	var orderNumber = plotter.orderNumber;

        	Plotters.restoreToDesign(plotter).then(function(result){

        		$scope.plotters.remove(function(p) {
        			  return p.orderNumber == orderNumber;
        		});

						Utils.showMessage('notify.plotter_back_to_design');

						// TODO when a plotter returns to design also all cloths in the original prevision returns => need to send all
						Previsions.updatePrevisionState(plotter.clothId).then(function() {
							Utils.showMessage('notify.previsions_state_updated');
						});
        	});
        };

        $scope.deleteManualPlotter = function(plotter) {

	    	  Plotters.removeManualPlotter(plotter.manualPlotterId).then(function(result) {

	    		  $scope.plotters.remove(plotter);

	    		  if($scope.modalManualPlotter)
	    			  $scope.modalManualPlotter.hide();

						Utils.showMessage('notify.plotter_deleted');
	    	  });
        };


        $scope.loadSelectedRoll = function(cuts, possibleRolls) {
        	// set current value for each cloth (needed for dropdown)
        	cuts.each(function( cut ) {

        		cut.possibleRolls = possibleRolls;

        		cut.selectedRoll = possibleRolls.findAll({id:cut.rollId})[0];
        	});
        };

        $scope.updatePlotterField = function(plotter, value, field) {

        	plotter[field] = value;

        	Plotters.editPlotterPrevision(plotter, field).then(function(result) {

        		console.log('Updated '+field+' of plotter '+plotter.id+' to '+value);
        	});
        }

        function loadAllPlotters() {

        	Previsions.getAllPlotters(false).then(function(result) {
    	    	$scope.plotters = result.data;

    	    	// load for each cut of each plotter the selected roll and set the possibleRolls corresponding to each plotter&cuts
    	    	$scope.plotters.each(function( plotter ) {

    	    		Plotters.getPossibleRolls(plotter).then(function(possibleRolls){

    	    			plotter.possibleRolls = possibleRolls.data;

    	    			$scope.loadSelectedRoll(plotter.cuts, possibleRolls.data);
    	    		});
    	    	});
    	    });
        }
}]);
