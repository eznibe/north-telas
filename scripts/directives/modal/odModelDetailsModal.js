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
          }
        };
	}
);
