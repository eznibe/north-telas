'use strict';

angular.module('vsko.stock')

.directive('dispatchModal', function($modal, $translate, Utils, Dispatchs, Previsions) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            Previsions.getAll(true, 'NONE').then(function(result) {
                $scope.previsions = result.data;
            });

            $scope.carryTypes = [{type: 'BOX'}, {type: 'TUBE'}];
            $scope.carryTypes.map(function(c) {
              $translate(c.type).then(function(value) {
                c.translation = value;
              })
            });

            $scope.selectedPrevision = function(prevision) {
              // autocomplete option selected
              if(prevision) {
                $scope.prevision = prevision;
              }
            };


        	  $scope.showDispatchModal = function(dispatch) {

        		  $scope.dispatch = dispatch ? dispatch : {isNew: true, previsions: [], carries: [], allCarries: []};

              if (!$scope.dispatch.isNew) {
                Dispatchs.getDispatchCarries(scope.dispatch.id).then(function(result) {

                  $scope.dispatch.allCarries = result.data;

                  // load dispatch info including assigned previsions
                  Dispatchs.getDispatch($scope.dispatch.id).then(function(result) {
                    $scope.dispatch.previsions = result.data.previsions;
                    $scope.dispatch.carries = result.data.boxes.concat(result.data.tubes);
                    // $scope.dispatch.tubes = ;
                  });
                });
              }

              $scope.modalDispatch = $modal({template: 'views/modal/dispatchDetails.html', show: false, scope: $scope});

              $scope.modalDispatch.$promise.then($scope.modalDispatch.show);
        	  };

        	  $scope.save = function(dispatch) {

        		  Dispatchs.save(dispatch).then(function(result){

    			  	  if(result.data.successful) {

    			  		  if(result.data.isNew) {
                    $scope.dispatchs.push($scope.dispatch);

                    Utils.showMessage('notify.dispatch_added');
                  } else {
                    Utils.showMessage('notify.dispatch_updated');
                  }
    			  	  }
    			  	  else {
                  Utils.showMessage('Error');
    			  	  }

         			 //  $scope.modalDispatch.hide();

        		  });
        	  };

            // Dispatch prevision functions

            $scope.addPrevision = function(prevision) {

              if (prevision) {
                Dispatchs.addPrevision(prevision.originalObject, $scope.dispatch.id).then(function(result) {

                  if(result.data.successful) {
                    $scope.dispatch.previsions.push(prevision.originalObject);

                    delete $scope.prevision;
                  }
                });
              }
            };

            $scope.deleteDispatchPrevision = function(prevision) {

              Dispatchs.removePrevision(prevision).then(function(result) {
                if (result.data.successful) {
                  $scope.dispatch.previsions = $scope.dispatch.previsions.filter(function(p) {
                    return p.dpId != prevision.dpId;
                  });
                }
              });
            };

            $scope.changedField = function(entity, value, fieldName) {

          		Dispatchs.updatePrevisionField(entity, fieldName).then(function() {
          		});
          	};

            $scope.changedNumericField = function(entity, value, fieldName) {

          		Dispatchs.updatePrevisionField(entity, fieldName, true).then(function() {
          		});
          	};


            // Carries modal and action functions
            $scope.showCarryModal = function(carry, type) {

              $scope.carry = carry ? carry : {isNew: true, type: type, dispatchId: $scope.dispatch.id};

              $scope.modalCarry = $modal({template: 'views/modal/carry.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

              $scope.modalCarry.$promise.then($scope.modalCarry.show);
            }

            $scope.saveCarry = function(carry) {

              Dispatchs.saveCarry(carry).then(function() {

                if(carry.isNew) {
                  $scope.dispatch.carries.push(carry);
                  delete carry.isNew;
                }

                $scope.modalCarry.hide();
              });
            }

            $scope.deleteDispatchCarry = function(carry) {

              Dispatchs.removeCarry(carry).then(function(result) {
                if (result.data.successful) {
                  $scope.dispatch.carries = $scope.dispatch.carries.filter(function(c) {
                    return c.id != carry.id;
                  });
                }
              });
            };

            $scope.carryDisplayFn = function(c) {
              if (!c) {
                return '';
              }

              var type = $scope.carryTypes.filter(function(fc) {
                return fc.type == c.type;
              })[0].translation;

              return type + ' ' + c.number;
            };

            $scope.changedCarry = function(prevision) {
              Dispatchs.updatePrevisionCarry(prevision).then(function() {

                console.log('new carry selection: '+ prevision.carryId);
              });
            };

            // Utils functions

            $scope.sumBoxesWeight = function(dispatch) {
              var result = 0;
              if (dispatch && dispatch.carries) {
                for(var i=0; i < dispatch.carries.length; i++) {
                  if (dispatch.carries[i].type == 'BOX') {
                    result += +dispatch.carries[i].weight;
                  }
                }
              }
              return result;
            }

            $scope.sumAllWeights = function(dispatch) {
              var result = $scope.sumBoxesWeight(dispatch);
              if (dispatch && dispatch.carries) {
                for(var i=0; i < dispatch.carries.length; i++) {
                  if (dispatch.carries[i].type == 'TUBE') {
                    result += +dispatch.carries[i].weight;
                  }
                }
              }
              return result;
            };

            $scope.sumPrevisionsWeight = function() {
              var result = 0;
              if ($scope.dispatch && $scope.dispatch.previsions) {
                for(var i=0; i < $scope.dispatch.previsions.length; i++) {
                  result += $scope.dispatch.previsions[i].weight ? +$scope.dispatch.previsions[i].weight : 0;
                }
              }
              return result != 0 ? result : '';
            }

          }
        };
	}
);
