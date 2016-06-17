'use strict';

angular.module('vsko.stock')

.directive('editableRollType', function($modal, $rootScope, Stock) {

    return {
          restrict: 'E',
          scope: {
            r: '=roll',
            editableByRole: '='
          },
          templateUrl: 'views/directives/editableRollType.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            scope.readonly = scope.editableByRole && $rootScope.user.role != scope.editableByRole;

        	  $scope.changed = function(roll) {

        		  Stock.updateRollType(roll).then(function(result){

        			  console.log("Changed roll type to "+roll.type);
        		  });

        		  $scope.clicked(roll);
        	  };

        	  $scope.clicked = function(roll) {

                if(!scope.readonly) {

                  if(roll.editable) {
  	        		  	$('#rollEdit-'+roll.id).fadeOut('fast', function() {
  		      			    $('#rollDisplay-'+roll.id).fadeIn('fast');
  	      				});
          		  	}
          		  	else {
          		  		$('#rollDisplay-'+roll.id).fadeOut('fast', function() {
  		      			    $('#rollEdit-'+roll.id).fadeIn('fast');
  	      				});
          		  	}

          		  	roll.editable = !roll.editable;
                }
        	  };
          }
        };
	}
)

.directive('editableRollData', function($modal, $rootScope, Stock) {

    return {
          restrict: 'E',
          scope: {
          	rollField: '=field',
          	r: '=roll',
          	extraLabel: '=',
          	labelWidth: '=',
            editableByRole: '='
          },
          templateUrl: 'views/directives/editableRollData.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  scope.editable = false;

            scope.readonly = scope.editableByRole && $rootScope.user.role != scope.editableByRole;

        	  scope.labelStyle = scope.labelWidth ? {width:scope.labelWidth+"px"} : '';

        	  $scope.changed = function(roll) {

        		  Stock.updateRollField(roll, scope.rollField, scope.r[scope.rollField]).then(function(result){

        			  console.log("Changed roll field '"+scope.rollField+"' to "+scope.r[scope.rollField]);

        			  // always update the roll mts just in case
        			  scope.r.mts = result.data.roll.mts;
        		  });

        		  $scope.clicked(roll);
        	  };

        	  $scope.clicked = function(roll) {

                if(!scope.readonly) {

          		  	if(scope.editable) {
  	        		  	$('#rollEdit-'+roll.id+'-'+scope.rollField).fadeOut('fast', function() {
  		      			    $('#rollDisplay-'+roll.id+'-'+scope.rollField).fadeIn('fast');
  	      				});
          		  	}
          		  	else {
          		  		$('#rollDisplay-'+roll.id+'-'+scope.rollField).fadeOut('fast', function() {
  		      			    $('#rollEdit-'+roll.id+'-'+scope.rollField).fadeIn('fast');
  	      				});
          		  	}

          		  	scope.editable = !scope.editable;
                }
        	  };
          }
        };
	}
)

.directive('editableProviderName', function($modal, Stock) {

    return {
          restrict: 'E',
          templateUrl: 'views/directives/editableProviderName.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  $scope.changed = function(provider) {

        		  Stock.updateProviderName(provider).then(function(result){

        			  console.log("Changed provider name to "+provider.name);

        			  if(!result.data.successful) {
        				  provider.name = result.data.provider.name;
        			  }
        		  });
        	  };

        	  $scope.clicked = function(provider) {

        		  	if(provider.editable) {
	        		  	$('#providerEdit-'+provider.id).fadeOut('fast', function() {
		      			    $('#providerDisplay-'+provider.id).fadeIn('fast');
	      				});
        		  	}
        		  	else {
        		  		$('#providerDisplay-'+provider.id).fadeOut('fast', function() {
		      			    $('#providerEdit-'+provider.id).fadeIn('fast');
	      				});
        		  	}

        		  	provider.editable = !provider.editable;
        	  };
          }
        };
	}
)

.directive('editableSailName', function($modal, OneDesign) {

    return {
          restrict: 'E',
          templateUrl: 'views/directives/editableSailName.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  $scope.changed = function(sail) {

        		  OneDesign.updateSailName(sail).then(function(result){

        			  console.log("Changed sail name to "+sail.sail);

        			  if(!result.data.successful) {
        				  sail.sail = result.data.oldName;
        			  }
        			  else {
        				  $scope.loadSails();
        			  }
        		  });
        	  };

        	  $scope.clicked = function(sail) {

        		  	if(sail.editable) {
	        		  	$('#sailEdit-'+sail.odId).fadeOut('fast', function() {
		      			    $('#sailDisplay-'+sail.odId).fadeIn('fast');
	      				});
        		  	}
        		  	else {
        		  		$('#sailDisplay-'+sail.odId).fadeOut('fast', function() {
		      			    $('#sailEdit-'+sail.odId).fadeIn('fast');
	      				});

        		  		sail.oldName = sail.sail;
        		  	}

        		  	sail.editable = !sail.editable;
        	  };
          }
        };
	}
)

.directive('editableBoatName', function($modal, OneDesign) {

    return {
          restrict: 'E',
          templateUrl: 'views/directives/editableBoatName.html',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  $scope.changedName = function(boat) {

        		  OneDesign.updateBoatName(boat).then(function(result){

        			  console.log("Changed boat name to "+boat.boat);

        			  if(!result.data.successful) {
        				  boat.boat = result.data.oldName;
        			  }
        		  });
        	  };

        	  $scope.clickedName = function(boat) {

        		  	if(boat.editable) {
	        		  	$('#boatEdit-'+boat.uiId).fadeOut('fast', function() {
		      			    $('#boatDisplay-'+boat.uiId).fadeIn('fast');
	      				});
        		  	}
        		  	else {
        		  		$('#boatDisplay-'+boat.uiId).fadeOut('fast', function() {
		      			    $('#boatEdit-'+boat.uiId).fadeIn('fast');
	      				});

        		  		boat.oldName = boat.boat;
        		  	}

        		  	boat.editable = !boat.editable;
        	  };
          }
        };
	}
)

.directive('editableInput', function($modal, $rootScope) {

	return {
        restrict: 'E',
        scope: {
        	field: '=',
        	entity: '=',
        	callback: '=',
          editableByRole: '=',
          tooltipText: '=',
          width: '=',
          extraLabel: "="
        },
        templateUrl: 'views/directives/editableInput.html',
        link: function postLink(scope, element, attrs) {

      	  scope.editable = false;

          scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

          scope.$watch('entity.id', function(value){
            if(scope.tooltipText && scope.entity.id)
              $('#entityDisplay-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
          });


      	  /*scope.value = scope.entity[scope.field];*/

      	  scope.changed = function(entity) {

            if(entity[scope.field]) {
        		  scope.callback(entity, entity[scope.field], scope.field);

        		  scope.clicked(entity);
            }
      	  };

      	  scope.clicked = function(entity) {

            if(!scope.readonly) {

      		  	if(scope.editable) {
	        		  	$('#entityEdit-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
		      			    $('#entityDisplay-'+entity.id+'-'+scope.field).fadeIn('fast');
	      				  });

                  if(scope.tooltipText)
                    $('#value-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
      		  	}
      		  	else {
      		  		$('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
		      			    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
	      				});
      		  	}

      		  	scope.editable = !scope.editable;
            }
      	  };
        }
      };
	}
)

.directive('editableDate', function($modal, $rootScope) {

	return {
        restrict: 'E',
        scope: {
        	field: '=',
        	entity: '=',
        	callback: '=',
          editableByRole: '=',
          tooltipText: '=',
          width: '=',
          required: '@',
          extraLabel: "="
        },
        templateUrl: 'views/directives/editableDate.html',
        link: function postLink(scope, element, attrs) {

      	  scope.editable = false;
          if (scope.required === undefined) {
            scope.required = false;
          }

          scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

          scope.$watch('entity.id', function(value){
            if(scope.tooltipText && scope.entity.id)
              $('#entityDisplay-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
          });


      	  /*scope.value = scope.entity[scope.field];*/

      	  scope.changed = function(entity) {

            if(!scope.required || entity[scope.field]) {
        		  scope.callback(entity, entity[scope.field], scope.field);

        		  scope.clicked(entity);
            }
      	  };

      	  scope.clicked = function(entity) {

            if(!scope.readonly) {

      		  	if(scope.editable) {
	        		  	// $('#entityEdit-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
		      			  //   $('#entityDisplay-'+entity.id+'-'+scope.field).fadeIn('fast');
                  //   $('#entityPencil-'+entity.id+'-'+scope.field).fadeIn('fast');
	      				  // });
                  $('#entityEdit-'+entity.id+'-'+scope.field).hide();
		      			  $('#entityDisplay-'+entity.id+'-'+scope.field).fadeIn('fast');
                  $('#entityPencil-'+entity.id+'-'+scope.field).fadeIn('fast');


                  if(scope.tooltipText)
                    $('#value-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
      		  	}
      		  	else {
      		  		$('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
		      			    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
                    $('#entityPencil-'+entity.id+'-'+scope.field).fadeOut('fast');
	      				});
      		  	}

      		  	scope.editable = !scope.editable;
            }
      	  };
        }
      };
	})
  ;
