'use strict';

angular.module('vsko.stock')

.directive('designClothsTags', function($modal, $rootScope, Previsions) {

    return {
          restrict: 'E',
          scope: {
            cloths: '=',
            editableByRole: '='
          },
          templateUrl: 'views/directives/designClothsTags.html',
          link: function postLink(scope, element, attrs) {

            var $scope = scope;

            scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

        	  $scope.changed = function(cloth) {

        		  Previsions.updateClothMts(cloth).then(function(result){
        			  console.log("Changed cloth to "+cloth.mts+" mts");

      					Previsions.updatePrevisionState(cloth.id).then(function() {
      						// $.notify("Estado de previsiones actualizado.", {className: "success", globalPosition: "bottom right"});
      					});
        		  });

        		  $scope.clicked(cloth);
        	  };

        	  $scope.clicked = function(cloth) {

                if(!scope.readonly) {

  	      		  	if(cloth.editable) {
  		        		  	$('#badgeEdit-'+cloth.cpId).fadeOut('fast', function() {
  			      			    $('#badgeDisplay-'+cloth.cpId).fadeIn('slow');
  		      				});
  	      		  	}
  	      		  	else {
  	      		  		$('#badgeDisplay-'+cloth.cpId).fadeOut('fast', function() {
  			      			    $('#badgeEdit-'+cloth.cpId).fadeIn('slow');
  		      				});
  	      		  	}

	      		     cloth.editable = !cloth.editable;
                }
	      	  };
          }
        };
	}
);
