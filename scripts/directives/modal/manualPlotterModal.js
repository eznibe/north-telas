'use strict';

angular.module('vsko.stock')

.directive('manualPlotterModal', function($modal, Stock, Previsions, Plotters) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  Stock.getAllCloths().then(function(result) {
        		  $scope.cloths = result.data;
          	  });

        	  $scope.showManualPlotterModal = function(plotter, previousModal) {

        		  $scope.plotter = plotter ? plotter : {};

        		  $scope.origPlotter = plotter ? $.extend(true, {}, plotter) : {}; // used when the user cancel the modifications (close the modal)

        		  if(!$scope.plotter.cloths || $scope.plotter.cloths.length == 0) {
        			  // init with one cloth empty, useful for creating new plotter
                  	  $scope.plotter.cloths = new Array();
                  	  $scope.plotter.cloths.push({});
                  }

              	  // set current value for each cloth (needed for dropdown)
           		  $scope.plotter.selectedCloth = $scope.cloths.findAll({id:$scope.plotter.clothId})[0];


              	  $scope.modalManualPlotter = $modal({template: 'views/modal/manualPlotter.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

                  $scope.modalManualPlotter.$promise.then($scope.modalManualPlotter.show);


                  if(previousModal) {
        			  $scope.previousModal = previousModal;
        			  previousModal.hide();
        		  }
              };

              $scope.saveManualPlotter = function() {

              	  Previsions.saveManualPlotter($scope.plotter).then(function(result) {

              		  if(result.data.successful && result.data.isNew) {

              			  $scope.plotter.clothName = $scope.plotter.selectedCloth.name;
              			  $scope.plotter.clothId = $scope.plotter.selectedCloth.id;
              			  $scope.plotter.cuts = new Array();
              			  $scope.plotter.cutted = '0';

              			  Plotters.getPossibleRolls($scope.plotter).then(function(possibleRolls){

              				  $scope.plotter.possibleRolls = possibleRolls.data;
              			  });

              			  $scope.plotters.push($scope.plotter);

              			  $.notify("Plotter creado.", {className: "success", globalPosition: "bottom right"});
              		  }
              		  else if(result.data.successful && !result.data.isNew) {
              			  $.notify("Plotter modificado.", {className: "success", globalPosition: "bottom right"});
              		  }
              	  });

              	  $scope.modalManualPlotter.hide();

              	  if($scope.previousModal) {
              		  $scope.previousModal.show();
              	  }
              };


              $scope.closeManualPlotter = function() {

            	  $.extend($scope.plotter, $scope.origPlotter);

              	  $scope.modalManualPlotter.hide();

              	  if($scope.previousModal) {
              		  $scope.previousModal.show();
            	  }
              };
          }
        };
	}
);
