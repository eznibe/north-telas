'use strict';

angular.module('vsko.stock')

.directive('manualRollModal', ['$modal', 'Stock', function($modal, Stock) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;
        	  var callback = attrs.callback;


        	  $scope.showManualRollModal = function() {

        		  $scope.roll = {type: 'DEF'};

              $scope.modalManualRoll = $modal({template: 'views/modal/manualRoll.html', show: false, scope: $scope, callback: callback, backdrop: 'static'});

              $scope.modalManualRoll.$promise.then($scope.modalManualRoll.show);
        	  };

              $scope.saveRoll = function(roll) {

            	  roll.clothId = $scope.cloth.id;
            	  roll.mtsOriginal = roll.mts;

            	  Stock.saveManualRoll(roll).then(function(result){

            		  if(result.data.successful) {

            			  $scope.rolls.push(roll);

            			  $scope.availableRolls.push(roll);

            			  $.notify("Rollo creado.", {className: "success", globalPosition: "bottom right"});

            			  $scope.modalManualRoll.hide();
            		  }
            		  else {
            			  $.notify("Error creando rollo.", {className: "error", globalPosition: "bottom right"});
            		  }
            	  });
              };

          }
        };
	}
]);
