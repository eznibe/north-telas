'use strict';

angular.module('vsko.stock')

.directive('dispatchOrders', function($modal, $rootScope, Previsions) {

    return {
          restrict: 'E',
          scope: {
            dispatch: "=",
            open: "=",
            editableByRole: "="
          },
          templateUrl: 'views/directives/dispatchOrders.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

        	  $scope.changed = function(cut) {

        		  if(!cut.mtsCutted || !cut.selectedRoll) {
        			  // TODO show msg on invalid save of cut
        			  return;
        		  }

        		  cut.rollId = cut.selectedRoll.id;

        		  // Previsions.savePlotterCut(cut).then(function(result){
        			//   console.log("Changed cut to "+cut.mtsCutted+" mts");
        		  // });
        	  };



        	  $scope.clicked = function(cut) {

              if(!scope.readonly) {

        		  	if(cut.editable) {
	        		  	$('#badgeEdit-'+cut.id).fadeOut('fast', function() {
		      			    $('#badgeDisplay-'+cut.id).fadeIn('slow');
	      				});
        		  	}
        		  	else {
        		  		$('#badgeDisplay-'+cut.id).fadeOut('fast', function() {
		      			    $('#badgeEdit-'+cut.id).fadeIn('slow');
	      				});
        		  	}

        		  	cut.editable = !cut.editable;
              }
        	  };
          }
        };
	}
);
