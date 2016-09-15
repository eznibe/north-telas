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

.directive('editableInput', function($modal, $rootScope, $timeout) {

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
            if(scope.tooltipText && scope.entity.id) {
              $timeout(function() {
          			$('#entityDisplay-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
          		}, 500);
            }
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
                    $('#entityDisplay-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
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

.directive('editableProductionInput', function($modal, $rootScope) {

	return {
        restrict: 'E',
        scope: {
        	field: '=',
        	entity: '=',
        	callback: '=',
          editableByRole: '=',
          width: '='
        },
        templateUrl: 'views/directives/editableProductionInput.html',
        link: function postLink(scope, element, attrs) {

          scope.editable = false;
          scope.over = false;
          if (scope.required === undefined) {
            scope.required = false;
          }

          scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

          scope.oneTimeBindings = {
            mouseOver: function(entity) {
              scope.over = true;
              scope.$broadcast('$$rebind::refreshPencil');
            },
            mouseLeave: function(entity) {
              scope.over = false;
              scope.$broadcast('$$rebind::refreshPencil');
            },
            showPencil: function() {
              return !scope.entity[scope.field] && scope.over && !scope.editable && !scope.readonly;
            },

            getExtraLabel: function() {
              if (!scope.extraLabel) {
                return '';
              }
              return scope.extraLabel;
            },
            getFieldValue: function() {
              if (!scope.entity[scope.field]) {
                return '';
              }
              return scope.entity[scope.field];
            },
            textareaStyle: function() {
              return {'width': scope.width ? scope.width+'px' : '100px', height: '20px', 'font-size': '10px'};
            },
            boxStyle: function() {
              return {'width': scope.width ? (+scope.width+5)+'px' : '100px', 'height': '20px', display: 'inline'};
            }
          };

      	  scope.changed = function(entity) {

            if(!scope.required || entity[scope.field]) {
              scope.callback(entity, entity[scope.field], scope.field);

              scope.clicked(entity);

              scope.$broadcast('$$rebind::refreshLinkValue');
            }
      	  };

      	  scope.clicked = function(entity) {

            if(!scope.readonly) {

              if(scope.editable) {
                $('#entityEdit-'+entity.id+'-'+scope.field).hide();
                $('#entityDisplay-'+entity.id+'-'+scope.field).fadeIn('fast');
                $('#entityPencil-'+entity.id+'-'+scope.field).fadeIn('fast');

                if(scope.tooltipText) {
                  $('#value-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
                }
              }
      		  	else {

                if (scope.entity[scope.field]) {
                  $('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
                    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
                    $('#entityPencil-'+entity.id+'-'+scope.field).fadeOut('fast');
                  });
                } else {
                  $('#entityPencil-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
                    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
                    $('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast');
                  });
                }

                scope.$broadcast('$$rebind::refreshDateInput');
      		  	}

      		  	scope.editable = !scope.editable;
            }
      	  };
        }
      };
	}
)

.directive('editableProductionTextarea', function($modal, $rootScope) {

	return {
        restrict: 'E',
        scope: {
        	field: '=',
        	entity: '=',
        	callback: '=',
          editableByRole: '=',
          width: '='
        },
        templateUrl: 'views/directives/editableProductionTextarea.html',
        link: function postLink(scope, element, attrs) {

          scope.editable = false;
          scope.over = false;
          if (scope.required === undefined) {
            scope.required = false;
          }

          scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

          // scope.$watch('entity.id', function(value){
          //   if(scope.tooltipText && scope.entity.id)
          //     $('#entityDisplay-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
          // });

      	  /*scope.value = scope.entity[scope.field];*/

          scope.oneTimeBindings = {
            mouseOver: function(entity) {
              scope.over = true;
              scope.$broadcast('$$rebind::refreshPencil');
            },
            mouseLeave: function(entity) {
              scope.over = false;
              scope.$broadcast('$$rebind::refreshPencil');
            },
            showPencil: function() {
              return !scope.entity[scope.field] && scope.over && !scope.editable && !scope.readonly;
            },

            getExtraLabel: function() {
              if (!scope.extraLabel) {
                return '';
              }
              return scope.extraLabel;
            },
            getFieldValue: function() {
              if (!scope.entity[scope.field]) {
                return '';
              }
              return scope.entity[scope.field];
              // return 'n';
            },
            textareaStyle: function() {
              return {'width': scope.width ? scope.width+'px' : '100px', 'font-size': '10px'};
            },
            boxStyle: function() {
              return {'width': scope.width ? (+scope.width+5)+'px' : '100px', 'height': '20px'};
            }
          };

      	  scope.changed = function(entity) {

            if(!scope.required || entity[scope.field]) {
              scope.callback(entity, entity[scope.field], scope.field);

              scope.clicked(entity);

              scope.$broadcast('$$rebind::refreshLinkValue');
            }
      	  };

      	  scope.clicked = function(entity) {

            if(!scope.readonly) {

              if(scope.editable) {
                $('#entityEdit-'+entity.id+'-'+scope.field).hide();
                $('#entityDisplay-'+entity.id+'-'+scope.field).fadeIn('fast');
                $('#entityPencil-'+entity.id+'-'+scope.field).fadeIn('fast');

                if(scope.tooltipText) {
                  $('#value-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
                }
              }
      		  	else {

                if (scope.entity[scope.field]) {
                  $('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
                    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
                    $('#entityPencil-'+entity.id+'-'+scope.field).fadeOut('fast');
                  });
                } else {
                  $('#entityPencil-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
                    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
                    $('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast');
                  });
                }

                scope.$broadcast('$$rebind::refreshDateInput');
      		  	}

      		  	scope.editable = !scope.editable;
            }
      	  };
        }
      };
	}
)

.directive('editableProductionDropdown', function($modal, $rootScope) {

	return {
        restrict: 'E',
        scope: {
        	field: '=',
        	entity: '=',
          options: '=',
          display: '=',
        	callback: '=',
          editableByRole: '=',
          tooltipText: '=',
          width: '=',
          extraLabel: "="
        },
        templateUrl: 'views/directives/editableProductionDropdown.html',
        link: function postLink(scope, element, attrs) {

          scope.editable = false;
          scope.over = false;
          if (scope.required === undefined) {
            scope.required = false;
          }

          scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

          // scope.$watch('entity.id', function(value){
          //   if(scope.tooltipText && scope.entity.id)
          //     $('#entityDisplay-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
          // });

      	  /*scope.value = scope.entity[scope.field];*/

          scope.oneTimeBindings = {
            mouseOver: function(entity) {
              scope.over = true;
              scope.$broadcast('$$rebind::refreshPencil');
            },
            mouseLeave: function(entity) {
              scope.over = false;
              scope.$broadcast('$$rebind::refreshPencil');
            },
            showPencil: function() {
              return !scope.entity[scope.field] && scope.over && !scope.editable && !scope.readonly;
            },

            getExtraLabel: function() {
              if (!scope.extraLabel) {
                return '';
              }
              return scope.extraLabel;
            },
            getFieldValue: function() {
              if (!scope.entity[scope.field] || !scope.options) {
                return '';
              }
              return scope.display(scope.options.filter(function(o) {
                return o.id == scope.entity[scope.field];
              })[0]);
            }
          };

      	  scope.changed = function(entity) {

            entity[scope.field] = entity.selectedOption ? entity.selectedOption.id : null;

            if(!scope.required || entity[scope.field]) {
              scope.callback(entity, entity[scope.field], scope.field);

              scope.clicked(entity);

              scope.$broadcast('$$rebind::refreshLinkValue');
            }
      	  };

      	  scope.clicked = function(entity) {

            if(!scope.readonly) {

              if(scope.editable) {
                $('#entityEdit-'+entity.id+'-'+scope.field).hide();
                $('#entityDisplay-'+entity.id+'-'+scope.field).fadeIn('fast');
                $('#entityPencil-'+entity.id+'-'+scope.field).fadeIn('fast');

                if(scope.tooltipText) {
                  $('#value-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
                }
              }
      		  	else {
                // set dropdown editable

                if (scope.entity[scope.field]) {
                  scope.entity.selectedOption = scope.options.filter(function(o) {
                    return o.id == scope.entity[scope.field];
                  })[0];

                  $('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
                    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
                    $('#entityEdit-'+entity.id+'-'+scope.field).css('display', 'inline-table');
                    $('#entityPencil-'+entity.id+'-'+scope.field).fadeOut('fast');
                  });
                } else {
                  $('#entityPencil-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
                    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
                    $('#entityEdit-'+entity.id+'-'+scope.field).css('display', 'inline-table');
                    $('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast');
                  });
                }

                scope.$broadcast('$$rebind::refreshDateInput');
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
        	field: '@',
        	entity: '=',
        	callback: '=',
          editableByRole: '=',
          tooltipText: '@',
          width: '@',
          required: '@',
          extraLabel: "@"
        },
        templateUrl: 'views/directives/editableDate.html',
        link: function postLink(scope, element, attrs) {

      	  scope.editable = false;
          scope.over = false;
          if (scope.required === undefined) {
            scope.required = false;
          }

          scope.readonly = scope.editableByRole && scope.editableByRole.split(',').lastIndexOf($rootScope.user.role) == -1;

          // scope.$watch('entity.id', function(value){
          //   if(scope.tooltipText && scope.entity.id)
          //     $('#entityDisplay-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
          // });

      	  /*scope.value = scope.entity[scope.field];*/

          scope.oneTimeBindings = {
            mouseOver: function(entity) {
              scope.over = true;
              scope.$broadcast('$$rebind::refreshPencil');
            },
            mouseLeave: function(entity) {
              scope.over = false;
              scope.$broadcast('$$rebind::refreshPencil');
            },
            showPencil: function() {
              return !scope.entity[scope.field] && scope.over && !scope.editable && !scope.readonly;
            },

            getExtraLabel: function() {
              if (!scope.extraLabel) {
                return '';
              }
              return scope.extraLabel;
            },
            getFieldValue: function() {
              if (!scope.entity[scope.field]) {
                return '';
              }
              return scope.entity[scope.field];
              // return 'n';
            }
          };

      	  scope.changed = function(entity) {

            if(!scope.required || entity[scope.field]) {
              scope.callback(entity, entity[scope.field], scope.field);

              scope.clicked(entity);

              scope.$broadcast('$$rebind::refreshLinkValue');
            }
      	  };

      	  scope.clicked = function(entity) {

            if(!scope.readonly) {

              if(scope.editable) {
                $('#entityEdit-'+entity.id+'-'+scope.field).hide();
                $('#entityDisplay-'+entity.id+'-'+scope.field).fadeIn('fast');
                $('#entityPencil-'+entity.id+'-'+scope.field).fadeIn('fast');

                if(scope.tooltipText) {
                  $('#value-'+scope.entity.id+'-'+scope.field).tooltip({title: scope.tooltipText });
                }
              }
      		  	else {
                // create datepicker if needed
                var dateInputElem = $('#entityEdit-'+entity.id+'-'+scope.field + ' input');
                if(!scope.datepickerCreated) {
                  dateInputElem.datepicker({
                    format: "dd-mm-yyyy",
                    autoclose: true,
                    todayHighlight: true,
                    language: "en",
                    // clearBtn: true,
                    forceParse: false
                	});
                  scope.datepickerCreated = true;
                }


                if (scope.entity[scope.field]) {
                  $('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
                    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
                    $('#entityPencil-'+entity.id+'-'+scope.field).fadeOut('fast');
                  });
                } else {
                  $('#entityPencil-'+entity.id+'-'+scope.field).fadeOut('fast', function() {
                    $('#entityEdit-'+entity.id+'-'+scope.field).fadeIn('fast');
                    $('#entityDisplay-'+entity.id+'-'+scope.field).fadeOut('fast');
                  });
                }

                scope.$broadcast('$$rebind::refreshDateInput');
      		  	}

      		  	scope.editable = !scope.editable;
            }
      	  };
        }
      };
	})
  ;
