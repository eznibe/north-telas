'use strict';

angular.module('vsko.stock')

.directive('odModelDetailsModal', function($modal, $translate, $rootScope, uuid4, Utils, OneDesign) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            function clean(model) {
              // model.nextSequence = +model.calculatedNextModelSerie.serie > 0 ? +model.calculatedNextModelSerie.serie : undefined;
              model.minStock = +model.minStock;
              return model;
            }

            async function loadModelPrevisions(model) {
              const notAssigned = await OneDesign.getModelPrevisions(model.boat, model.sail, true, false);
              const assigned = await OneDesign.getModelPrevisions(model.boat, model.sail, false, true);
              
              $scope.notAssignedOrders = notAssigned.data;
              $scope.assignedOrders = assigned.data;
            }

            async function getModelNextSequence(model) {
              const nextModelSerie = await OneDesign.getNextModelSerie(model.boat, model.sail);
              return nextModelSerie.data.serie;   
            }
            
        	  $scope.showModelDetailsModal = async function(model) {

              loadModelPrevisions(model);

              model.nextSequence = await getModelNextSequence(model);

              let result = await OneDesign.getModelMeasurements(model);
              model.measurements = result.data;

              result = await OneDesign.getModelItems(model);
              model.items = result.data;
              
              $scope.odmodel = clean(model);
              
              $scope.modalModelDetails = $modal({template: 'views/modal/odModelDetails.html', show: false, scope: $scope, backdrop:'static'});

              $scope.modalModelDetails.$promise.then($scope.modalModelDetails.show);
        	  };

        	  $scope.saveModelDetails = function(model) {

        		  OneDesign.saveModel(model, $rootScope.user).then(function(result){

    			  	  if(result.data.successful) {

                  // if (model.nextSequence > 0) {
                  //   model.calculatedNextModelSerie.serie = model.nextSequence;
                  // }
                  Utils.showMessage('notify.odmodel_updated');
    			  	  }
    			  	  else {
                  Utils.showMessage('notify.odmodel_save_error', 'error');
    			  	  }
        		  }, function(err) {
                Utils.showMessage('notify.odmodel_save_error', 'error');
              });
        	  };

            $scope.closeModelDetailsModal = () => {

              $scope.modalModelDetails.hide();
            };

            $scope.previsionClosed = () => {
              loadModelPrevisions($scope.odmodel);
            }

            // Model measurement functions
            $scope.showMeasurementModal = function(carry, type) {

              $scope.measure = {};
              $scope.modalMeasurement = $modal({template: 'views/modal/odModelMeasurement.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

              $scope.modalMeasurement.$promise.then($scope.modalMeasurement.show);
            }

            $scope.saveMeasurement = async (measure) => {
              await OneDesign.saveModelMeasurement(measure, $scope.odmodel.id);
              $scope.odmodel.measurements.push(measure);

              $scope.modalMeasurement.hide();
            }

            $scope.closeMeasurement = () => {
              $scope.modalMeasurement.hide();
            }

            $scope.changedMeasurement = {
              field: function(entity, value, fieldName) {

            		OneDesign.updateModelField(entity, 'measurements', fieldName).then(function() {
            		});
            	},

              numericField: function(entity, value, fieldName) {

            		OneDesign.updateModelField(entity, 'measurements', fieldName, true).then(function() {
            		});
            	}
            };

            $scope.deleteModelMeasurement = async (measure) => {
              await OneDesign.deleteModelMeasurement(measure);
              $scope.odmodel.measurements = $scope.odmodel.measurements.filter(m => m.id !== measure.id);
            }

            // Model items functions
            $scope.showItemModal = function(carry, type) {

              $scope.measure = {};
              $scope.modalItem = $modal({template: 'views/modal/odModelItem.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

              $scope.modalItem.$promise.then($scope.modalItem.show);
            }

            $scope.saveItem = async (item) => {
              await OneDesign.saveModelItem(item, $scope.odmodel.id);
              $scope.odmodel.items.push(item);

              $scope.modalItem.hide();
            }

            $scope.closeItem = () => {
              $scope.modalItem.hide();
            }

            $scope.deleteModelItem = async (item) => {
              await OneDesign.deleteModelItem(item);
              $scope.odmodel.items = $scope.odmodel.items.filter(m => m.id !== item.id);
            }

            $scope.changedItem = {
              field: function(entity, value, fieldName) {

            		OneDesign.updateModelField(entity, 'items', fieldName).then(function() {
            		});
            	},

              numericField: function(entity, value, fieldName) {

            		OneDesign.updateModelField(entity, 'items', fieldName, true).then(function() {
            		});
            	}
            };
          }
        };
	}
);
