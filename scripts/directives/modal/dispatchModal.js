'use strict';

angular.module('vsko.stock')

.directive('dispatchModal', function($modal, $translate, $rootScope, uuid4, Utils, Dispatchs, Previsions) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
            var initialLoad;

            Previsions.getAll(true, 'NONE').then(function(result) {
              $scope.previsionOptions = result.data;
            });

            $scope.carryTypes = [{type: 'BOX'}, {type: 'TUBE'}];
            $scope.carryTypes.map(function(c) {
              $translate(c.type).then(function(value) {
                c.translation = value;
              })
            });

            Dispatchs.getDispatchDestinataries().then(function(result) {
              $scope.destinataries = result.data;
            });


        	  $scope.showDispatchModal = function(dispatch) {

        		  $scope.dispatch = dispatch ? dispatch : {isNew: true, id: uuid4.generate(), previsions: [], carries: [], allCarries: []};

              // clear possible previously chosen autocmolte destinatary
              delete $scope.acDestinatary;

              if (!$scope.dispatch.isNew) {
                Dispatchs.getDispatchCarries($scope.dispatch.id).then(function(result) {

                  $scope.dispatch.allCarries = result.data;

                  // load dispatch info including assigned previsions and carries
                  Dispatchs.getDispatch($scope.dispatch.id).then(function(result) {
                    // merging properties -> TODO see $.extend(..)
                    for (var attrname in result.data) { $scope.dispatch[attrname] = result.data[attrname]; }

                    $scope.dispatch.carries = result.data.boxes.concat(result.data.tubes);

                    // fill destinatary autocomplete with dispatch info if present
                    if (result.data.destinatary) {
                      initialLoad = true;
                      $scope.acDestinatary = $scope.destinataries.filter(function(d) {
                        return result.data.destinatary.toLowerCase() == d.name.toLowerCase();
                      })[0];
                    }
                  });
                });
              } else {
                Dispatchs.getNextDispatchNumber().then(function(result) {
                  $scope.dispatch.number = result.data;
                });
              }

              $scope.modalDispatch = $modal({template: 'views/modal/dispatchDetails.html', show: false, scope: $scope, backdrop:'static'});

              $scope.modalDispatch.$promise.then($scope.modalDispatch.show);
        	  };

        	  $scope.saveDispatch = function(dispatch) {

        		  Dispatchs.save(dispatch, $rootScope.user).then(function(result){

    			  	  if(result.data.successful) {

    			  		  if(result.data.isNew) {
                    $scope.dispatchs.push($scope.dispatch);

                    delete $scope.dispatch.isNew;

                    Utils.showMessage('notify.dispatch_added');
                  } else {
                    Utils.showMessage('notify.dispatch_updated');
                  }
    			  	  }
    			  	  else {
                  Utils.showMessage('notify.dispatch_save_error', 'error');
    			  	  }
        		  }, function(err) {
                Utils.showMessage('notify.dispatch_save_error', 'error');
              });
        	  };

            $scope.closeDispatch = function() {

              if ($scope.dispatch.isNew) {
                // details closed but dispatch was not created -> remove possible previsions assignations
                Dispatchs.remove($scope.dispatch).then(function(result) {
          				if (result.data.successful) {

          				}
          			});
              }

              $scope.modalDispatch.hide();
            };

            $scope.printDispatch = function(dispatch) {

              $('#d_number').html($scope.dispatch.number);
              $('#d_dispatchDate').html($scope.dispatch.dispatchDate);
              $('#d_value').html($scope.dispatch.value);
              $('#d_destinatary').html($scope.dispatch.destinatary);

              $('#d_address').html($scope.dispatch.address);
              $('#d_destiny').html($scope.dispatch.destiny);
              $('#d_transport').html($scope.dispatch.transport);
              $('#d_deliveryType').html($scope.dispatch.deliveryType);
              $('#d_tracking').html($scope.dispatch.tracking);
              $('#d_notes').html($scope.dispatch.notes);

              $('#printDispatch').printThis();
            }

            // Dispatch prevision functions

            $scope.addPrevision = function(prevision) {

              if (prevision) {
                // first check if it's not added in some dispatch already
                Previsions.isInSomeDispatch(prevision.originalObject.id).then(function(result) {

                  if (!result.data) {

                    prevision.originalObject.previsionId = prevision.originalObject.id;
                    prevision.originalObject.dispatchId = $scope.dispatch.id;
                    Dispatchs.addPrevision(prevision.originalObject, $scope.dispatch.id).then(function(result) {

                      if(result.data.successful) {
                        $scope.dispatch.previsions.push(prevision.originalObject);

                        delete $scope.acPrevision;
                      } else {
                        Utils.showMessage('Error', 'error');
                      }
                    });
                  } else {
                    // show error message
                    Utils.showMessage('notify.prevision_assign_error', 'error');
                  }

                  // clear order selection
                  // $scope.selectedACPrevision = null;
                  $scope.$broadcast('angucomplete-alt:clearInput', 'acOrder')
                  delete $scope.orderNumberText;
                });
              } else if (!prevision && $scope.orderNumberText) {
                prevision = {orderNumber: $scope.orderNumberText};
                Dispatchs.addPrevision(prevision, $scope.dispatch.id).then(function(result) {

                  if(result.data.successful) {
                    $scope.dispatch.previsions.push(prevision);
        						prevision.id = prevision.dpId;
                  } else {
                    Utils.showMessage('Error', 'error');
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
                } else {
                  Utils.showMessage('Error', 'error');
                }
              });
            };

            $scope.changedDispatch = {
              field: function(entity, value, fieldName) {

            		Dispatchs.updatePrevisionField(entity, fieldName).then(function() {
            		});
            	},

              numericField: function(entity, value, fieldName) {

            		Dispatchs.updatePrevisionField(entity, fieldName, true).then(function() {
            		});
            	}
            };


            // Carries modal and action functions
            $scope.showCarryModal = function(carry, type) {

              $scope.carry = carry ? carry : {isNew: true, type: type, dispatchId: $scope.dispatch.id};
              $scope.origCarry = carry ? $.extend(true, {}, carry) : {}; // used when the user cancel the modifications (close the modal)

              $scope.modalCarry = $modal({template: 'views/modal/carry.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

              $scope.modalCarry.$promise.then($scope.modalCarry.show);
            }

            $scope.saveCarry = function(carry) {

              Dispatchs.saveCarry(carry).then(function(result) {

                if (result.data.successful) {

                  if(carry.isNew) {
                    $scope.dispatch.carries.push(carry);
                    delete carry.isNew;
                  }

                  $scope.modalCarry.hide();

                  Utils.showMessage('notify.saved_carry');

                  $.extend($scope.origCarry, carry);

                } else {
                  Utils.showIntrusiveMessage('notify.save_carry_error', 'error');
                }
              }, function(err) {
                Utils.showIntrusiveMessage('notify.save_carry_error', 'error');
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

            $scope.closeCarry = function() {

          	  $.extend($scope.carry, $scope.origCarry);

          	  $scope.modalCarry.hide();
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
              Dispatchs.updatePrevisionCarry(prevision).then(function(result) {

                if (result.data.successful) {
                  Utils.showMessage('notify.dispatch_assigned');
                } else {
                  prevision.carryId = null;
                  scope.$broadcast('$$rebind::refreshLinkValue');
                  Utils.showMessage('notify.dispatch_assign_error', 'error');
                }
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
              return result ? result.toFixed(2) : 0;
            }

            $scope.sumTubesWeights = function(dispatch) {
              var result = 0;
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
              return result != 0 ? result.toFixed(2) : 0;
            };

            $scope.sumAllWeights = function(dispatch) {
              var result = $scope.sumBoxesWeight(dispatch);
              if (dispatch) {
                result = +$scope.sumPrevisionsWeight() + +$scope.sumTubesWeights(dispatch) + +$scope.sumBoxesWeight(dispatch);
              }
              return result ? result.toFixed(2) : 0;
            };

            // -- Automcomplete  -- //

            $scope.selectedACPrevision = function(prevision) {
              // autocomplete option selected
              if(prevision) {
                // console.log('Selected prevision:',prevision)
                $scope.acPrevision = prevision;
              }
            };

            $scope.orderNumberChanged = function(value) {
              $scope.orderNumberText = value;
            }

            $scope.selectedDestinatary = function(destinatary) {
              // autocomplete option selected
              if(destinatary) {
                $scope.dispatch.destinatary = destinatary.originalObject.name;

                if (!initialLoad) {
                  // update address, destiny and notes fields
                  $scope.dispatch.address = destinatary.originalObject.address;
                  $scope.dispatch.destiny = destinatary.originalObject.destiny;
                  // $scope.dispatch.notes = destinatary.originalObject.notes;
                  $scope.dispatch.transport = destinatary.originalObject.transport;
                  $scope.dispatch.deliveryType = destinatary.originalObject.deliveryType;
                } else {
                  initialLoad = false;
                }
              }
            };

            $scope.destinataryChanged = function(value) {
              $scope.dispatch.destinatary = value;
            }

          }
        };
	}
);
