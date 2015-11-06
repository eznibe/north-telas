'use strict';

angular.module('vsko.stock')

.directive('plotterCutsTags', function($modal, $rootScope, Previsions, Plotters) {

    return {
          restrict: 'E',
          scope: {
            cuts: '=',
            p: '=plotter',
            editableByRole: '='
          },
          templateUrl: 'views/directives/plotterCutsTags.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

        	  $scope.changed = function(cut) {

        		  if(!cut.mtsCutted || !cut.selectedRoll) {
        			  // TODO show msg on invalid save of cut
        			  return;
        		  }

        		  cut.rollId = cut.selectedRoll.id;

        		  Previsions.savePlotterCut(cut).then(function(result){
        			  console.log("Changed cut to "+cut.mtsCutted+" mts");

        			  $.notify("Corte asignado.", {className: "success", globalPosition: "bottom right"});
        		  });

        		  $scope.clicked(cut);
        	  };

        	  $scope.selectedRoll = function(cut, roll) {
        		  // update tooltip with available mts
        		  $('#mts-'+cut.id).tooltip('destroy');
        		  $('#mts-'+cut.id).tooltip({title: 'Disponible '+(roll.mts - roll.mtsPendingToBeCutted)+' mts'});
        	  };

        	  $scope.deleted = function(cut) {

        		  if(cut.id) {
        			  // call api to delete cut
	        		  Previsions.removePlotterCut(cut).then(function(result){
	        			  $scope.cuts.remove(cut);
	        		  });
        		  }
        		  else {
        			  // just remove from list, it is a new created cut withut values saved yet
        			  $scope.cuts.remove(cut);
        		  }

        		  $scope.clicked(cut);
        	  };

        	  $scope.clicked = function(cut) {

                if(!scope.readonly) {

          		  	if(cut.editable) {
  	        		  	$('#badgeEdit-'+cut.id).fadeOut('fast', function() {
  		      			    $('#badgeDisplay-'+cut.id).fadeIn('slow');
  	      				});
          		  	}
          		  	else {
          		  		// need to get possiblerolls again because of possible changes in other plotter cuts mts while this was closed
          		  		Plotters.getPossibleRolls($scope.p).then(function(possibleRolls){

          		  			$('#badgeDisplay-'+cut.id).fadeOut('fast', function() {
      		      			    $('#badgeEdit-'+cut.id).fadeIn('slow');
      	      				});

          		  			$scope.p.possibleRolls = possibleRolls.data;

      		  				  $scope.loadSelectedRoll($scope.cuts, possibleRolls.data);

  	        		  		$('#mts-'+cut.id).tooltip('destroy');
  	        		  		$('#mts-'+cut.id).tooltip({title: 'Disponible '+(cut.selectedRoll.mts - cut.selectedRoll.mtsPendingToBeCutted)+' mts'});

          	    		});
          		  	}

          		  	cut.editable = !cut.editable;
                }
        	  };
          }
        };
	}
);
