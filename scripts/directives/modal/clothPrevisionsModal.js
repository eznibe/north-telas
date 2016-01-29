'use strict';

angular.module('vsko.stock')

.directive('clothPrevisionsModal', function($modal, Previsions) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;


        	  $scope.showClothPrevisionsModal = function(cloth) {

        		  $scope.cloth = cloth;

          	  Previsions.getPrevisions(cloth.id).then(function(result) {
          		  $scope.cloth.previsions = result.data;
          	  });

              $scope.modalPrevisions = $modal({template: 'views/modal/clothPrevisions.html', show: false, scope: $scope});

              $scope.modalPrevisions.$promise.then($scope.modalPrevisions.show);
        	  };

            $scope.acceptStateChange = function(p) {
              Previsions.acceptStateChange(p).then(function() {
                $.notify("Cambio de estado aceptado.", {className: "success", globalPosition: "bottom right"});
                p.stateAccepted = '1';
              });
            };
          }
    };
	}
);
