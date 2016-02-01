'use strict';

angular.module('vsko.stock')

.directive('previsionModal', function($modal, $rootScope, $q, Stock, Previsions, Files, OneDesign, Lists) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;


        	  Stock.getAllCloths().then(function(result) {
        		  $scope.cloths = result.data;
          	  });

        	  Stock.getAllSails().then(function(result) {
        		  $scope.sails = result.data;
          	  });

        	  OneDesign.getBoats().then(function(result) {
        		  $scope.boats = result.data;
          	  });

        	  OneDesign.getSails().then(function(result) {
        		  $scope.oneDesignSails = result.data;
          	  });

            $scope.acceptStateChange = function(p) {
              Previsions.acceptStateChange(p).then(function() {
                $.notify("Cambio de estado aceptado.", {className: "success", globalPosition: "bottom right"});
                p.stateAccepted = '1';
              });
            };

        	  $scope.showPrevisionModal = function(prevision, previousModal) {

        		  $scope.prevision = prevision ? prevision : {oneDesign: false, greaterThan44: false};

        		  $scope.origPrevision = prevision ? $.extend(true, {}, prevision) : {}; // used when the user cancel the modifications (close the modal)

              $scope.prevision.startedAsOD = prevision ? prevision.oneDesign : true;

        		  if(!$scope.prevision.cloths || $scope.prevision.cloths.length == 0) {
        			  // init with one cloth empty, useful for creating new prevision
              	  $scope.prevision.cloths = new Array();
              	  $scope.prevision.cloths.push({});
              }

          	  // set current value for each cloth (needed for dropdown)
          	  $scope.prevision.cloths.each(function( cloth ) {
          		  cloth.selectedCloth = $scope.cloths.findAll({id:cloth.id})[0];
          	  });

          	  // set current selected sail
          	  $scope.prevision.selectedSail = $scope.prevision.sailId ? $scope.sails.findAll({id:$scope.prevision.sailId})[0] : {};

          	  // set current selected boat
          	  $scope.prevision.selectedBoat = $scope.prevision.oneDesign ? $scope.boats.findAll({boat:$scope.prevision.boat})[0] : {};

          	  // set current selected one design sail
          	  $scope.prevision.selectedOneDesignSail = $scope.prevision.oneDesign ? $scope.oneDesignSails.findAll({sail:$scope.prevision.sailOneDesign})[0] : {};


          	  $scope.modalPrevision = $modal({template: 'views/modal/prevision.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

              $scope.modalPrevision.$promise.then($scope.modalPrevision.show);


              if(previousModal) {
        			  $scope.previousModal = previousModal;
        			  previousModal.hide();
        		  }
          };

          $scope.addCloth = function() {
        	  $scope.prevision.cloths.push({});
          };

          $scope.removeCloth = function(index) {
        	  $scope.prevision.cloths.splice(index, 1);

          	  if($scope.prevision.cloths.length==0) {
          		  $scope.prevision.cloths.push({});
          	  }
          };

          $scope.save = function() {

        	  // save changes in each cloth (extending current values only if a new cloth was selected)
          	  $scope.prevision.cloths.each(function( item ) {
          		if(item.selectedCloth && item.id != item.selectedCloth.id) {
          			$.extend(item, item.selectedCloth);
          			item.clothId = item.selectedCloth.id;
          			item.previsionId = $scope.prevision.id; // when the cloth is new the previsionid is not set, other cases will have no effect
          		}
          	  });

          	  if($scope.prevision.selectedSail.id) {
          		  $scope.prevision.sailId = $scope.prevision.selectedSail.id;
          	  }

          	  if($scope.prevision.selectedBoat.boat) {
          		  $scope.prevision.boat = $scope.prevision.selectedBoat.boat;
          	  }

          	  if($scope.prevision.selectedOneDesignSail && $scope.prevision.selectedOneDesignSail.sail) {
        		  $scope.prevision.sailOneDesign = $scope.prevision.selectedOneDesignSail.sail;
        	  }

            var waitForPossiblePrevisionStateChange = false;
            var showChangedStateModal = false;

            function newStateClose() {
              $scope.modalPrevision.hide();

              if($scope.previousModal) {
                $scope.previousModal.show();
              }
            }

        	  Previsions.save($scope.prevision, $rootScope.user.name).then(function(result) {

        		  if(result.data.successful && result.data.isNew) {

        			  $scope.previsions.push($scope.prevision);

        			  $.notify("Prevision creada.", {className: "success", globalPosition: "bottom right"});

                waitForPossiblePrevisionStateChange = true;

                updatePrevisionState($scope.prevision).then(function(state) {
                  console.log('Ended update prev state (new):', state);
                  // the prevision is new => show modal with the prev state for the user
                  $scope.state = state;
                  $scope.onClose = newStateClose;
                  var modal = $modal({template: 'views/modal/showNewState.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});
                  modal.$promise.then(modal.show);
                });;
        		  }
        		  else if(result.data.successful && !result.data.isNew) {

        			  $.notify("Prevision modificada.", {className: "success", globalPosition: "bottom right"});

                waitForPossiblePrevisionStateChange = true;

                updatePrevisionState($scope.prevision).then(function(state) {
                  console.log('Ended update prev state:', state);
                  if(state) {
                    // the prevision state was updated => show modal with the new prev state for the user
                    $scope.state = state;
                    $scope.onClose = newStateClose;
                    var modal = $modal({template: 'views/modal/showNewState.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});
                    modal.$promise.then(modal.show);
                  } else {
                    newStateClose();
                  }
                });
        		  }
        		  else if(!result.data.successfulInsert && result.data.insert) {
                Lists.log({type: 'error.insertPrevision', log: result.data.insert}).then(function(result) {});
        			  $.notify("Prevision no pudo ser creada.", {className: "error", globalPosition: "bottom right"});
        		  }
              else if(!result.data.successfulUpdate && result.data.update) {
                Lists.log({type: 'error.updatePrevision', log: result.data.update}).then(function(result) {});
        			  $.notify("Prevision no pudo ser editada.", {className: "error", globalPosition: "bottom right"});
        		  }
              else if(!result.data.successfulCloths && result.data.queryCloths) {
                Lists.log({type: 'error.queryCloths', log: result.data.queryCloths}).then(function(result) {});
        			  $.notify("Prevision, problema guardando las telas.", {className: "error", globalPosition: "bottom right"});
        		  }
              else if(!result.data.successful) {
        			  $.notify("Prevision, error desconocido, ver log.", {className: "error", globalPosition: "bottom right"});
        		  }

              if(!waitForPossiblePrevisionStateChange) {
                $scope.modalPrevision.hide();

                if($scope.previousModal) {
                  $scope.previousModal.show();
                }
              }
        	  });
          };

          $scope.deletePrevision = function(prevision) {

        	  console.log('Deleteing prevision: '+prevision.id);

          	  Previsions.remove($scope.prevision).then(function(result) {
          		  $scope.previsions.remove(prevision);

          		  $scope.modalPrevision.hide();

          		  $.notify("Prevision eliminada.", {className: "success", globalPosition: "bottom right"});

                updatePrevisionState($scope.prevision, true);
          	  });
          };

          $scope.selectedPrevision = function(prevision) {

            if(prevision) {

              $scope.prevision.orderNumber = prevision.originalObject.orderNumber;

              // load the values of the selected prevision in the new one we are creating
              $scope.prevision.client = prevision.originalObject.client;
              $scope.prevision.boat = prevision.originalObject.boat;
              $scope.prevision.deliveryDate = prevision.originalObject.deliveryDate;
              $scope.prevision.type = prevision.originalObject.type;
              $scope.prevision.greaterThan44 = prevision.originalObject.greaterThan44;
              $scope.prevision.oneDesign = prevision.originalObject.oneDesign;
              $scope.prevision.selectedBoat = $scope.prevision.oneDesign ? $scope.boats.findAll({boat:$scope.prevision.boat})[0] : {};

              $scope.prevision.p = prevision.originalObject.p;
              $scope.prevision.e = prevision.originalObject.e;
              $scope.prevision.i = prevision.originalObject.i;
              $scope.prevision.j = prevision.originalObject.j;
              $scope.prevision.area = prevision.originalObject.area;

              /*console.log('Selected prevision: '+prevision.originalObject.orderNumber);
              console.log('Stored in entity: '+$scope.prevision.orderNumber);*/
            }
          };

          $scope.orderNumberChanged = function(str) {
            $scope.prevision.orderNumber = str;
          }

          $scope.close = function() {

        	  $.extend($scope.prevision, $scope.origPrevision);

        	  $scope.modalPrevision.hide();

        	  if($scope.previousModal) {
        		  $scope.previousModal.show();
        	  }
          };

          $scope.calculateMts = function() {

        	  if(!$scope.prevision.oneDesign && $scope.prevision.selectedSail) {

        		  // for sails that split the mts in two cloths (grande y chica) check that there are at least 2 cloths already added
        		  if($scope.prevision.selectedSail.splitF1=='Y' && $scope.prevision.cloths.length < 2) {
        			  $scope.prevision.cloths.push({});
        		  }
        		  else if ((!$scope.prevision.selectedSail.splitF1 || $scope.prevision.selectedSail.splitF1=='N') && $scope.prevision.cloths.length > 1 && !$scope.prevision.cloths[1].selectedCloth) {
        			  // selected sail with NO split in two cloths, if the second cloth is not selected yet remove it and leave only one cloth
        			  var cloth = $scope.prevision.cloths[0];

        			  $scope.prevision.cloths = new Array();
        			  $scope.prevision.cloths.push(cloth);
        		  }


    			  if(!$scope.prevision.greaterThan44) {
    				  $scope.calculateClothMts($scope.prevision.selectedSail.valueF1, $scope.prevision.selectedSail.fieldsF1, $scope.prevision.selectedSail.typeF1, $scope.prevision.selectedSail.splitF1, $scope.prevision.cloths[0], $scope.prevision.cloths[1]);
        		  }
        		  else {
        			  $scope.calculateClothMts($scope.prevision.selectedSail.valueF2, $scope.prevision.selectedSail.fieldsF2, $scope.prevision.selectedSail.typeF2, $scope.prevision.selectedSail.splitF2, $scope.prevision.cloths[0], $scope.prevision.cloths[1]);
        		  }
        	  }
          };

          $scope.calculateClothMts = function(value, fields, type, split, cloth1, cloth2) {

        	  var mts=undefined;

        	  if(fields == 'PE') {
        		  mts = doFormula(type, value, $scope.prevision.p, $scope.prevision.e );
        	  }
        	  else if(fields == 'IJ') {
        		  mts = doFormula(type, value, $scope.prevision.i, $scope.prevision.j );
        	  }
        	  else if(fields == 'SUP') {
        		  mts = doFormula(type, value, $scope.prevision.area );
        	  }

        	  if(mts) {

        		  if(cloth2 && split=='Y') {
        			  cloth1.mts = Math.round((mts * 0.7).toFixed(2));
        			  cloth2.mts = Math.round((mts * 0.3).toFixed(2));
        		  }
        		  else {
        			  cloth1.mts = Math.round(mts.toFixed(2));
        		  }
        	  }
          };

          function doFormula(type, value, op1, op2) {

        	  if(type == 'MULT_DIV' && op1 && op2) {
        		  return ((op1 * op2) / 2) * value;
        	  }
	  	  	    else if(type == 'MULT' && op1) {
	  	  		      return op1 * value;
		        }
  				  else if(type == 'MULT_MULT' && op1 && op2) {
  					  return op1 * op2 * value;
  				  }

        	  return undefined;
          }

          $scope.oneDesignCloths = function() {

        	  if($scope.prevision.oneDesign && $scope.prevision.selectedBoat && $scope.prevision.selectedBoat.boat && $scope.prevision.selectedOneDesignSail && $scope.prevision.selectedOneDesignSail.sail) {

        		  var sail = $scope.prevision.selectedOneDesignSail.description;

        		  $scope.prevision.cloths = new Array();

        		  OneDesign.findCloths($scope.prevision.selectedBoat.boat, $scope.prevision.selectedOneDesignSail.sail).then(function(result) {

        			  	$scope.prevision.cloths = new Array();

    			    	$.each(result.data, function(index){

    			    		var cloth = $scope.cloths.findAll({id:this.clothId})[0];

    			    		$scope.prevision.cloths.push({selectedCloth: cloth, mts: this.mts});
    			    	});

    			    	if($scope.prevision.cloths.length==0) {
              			  	$scope.prevision.cloths.push({});
              		  	}
        		  });

        	  }
          };

          function dbFormat(date) {

        	  if(!date) return;

        	  var dateParts = date.split("-");

          	  return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
          }

          function updatePrevisionState(prevision, skipNotify) {

            var d = $q.defer();

            console.log('Prevision', prevision);

  					var clothsIds = prevision.cloths.map(function(c) { return c.clothId; }).join(',');

  					Previsions.updatePrevisionState(clothsIds).then(function(result) {

              console.log('update prevision state', result);
              if(skipNotify) {
    						$.notify("Estado de previsiones actualizado.", {className: "success", globalPosition: "bottom right"});
              }

              var currentPrevisionUpdated = false;

              // update the state of the modified previsions in the scope
              result.data.modifiedPrevisions.map(function(modifiedPrevision) {

                // if(prevision.id == modifiedPrevision.id &&
                //    prevision.state != modifiedPrevision.state) {
                //      prevision.state = modifiedPrevision.state;
                //      prevision.stateAccepted = "0";
                //
                //      d.resolve(prevision.state);
                //      return;
                // }

                var previsionsToUpdate = $scope.previsions || $scope.cloth.previsions;

                if(previsionsToUpdate) {
                  previsionsToUpdate.map(function(p) {
                    if(modifiedPrevision.id == p.id) {

                      if(p.state != modifiedPrevision.state) {
                        p.state = modifiedPrevision.state;
                        p.stateAccepted = "0";

                        // the prevision of this modal was updated => resolve the promise with the new state
                        if(p.id == prevision.id) {
                          d.resolve(p.state);
                          currentPrevisionUpdated = true;
                        }
                      }
                    }
                  });
                }
              });

              if(!currentPrevisionUpdated) {
                d.resolve(null);
              }
  					});

            return d.promise;
  				}
        }
      };
	}
);
