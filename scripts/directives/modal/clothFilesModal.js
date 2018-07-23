'use strict';

angular.module('vsko.stock')

.directive('clothFilesModal', function($modal, Temporaries) {

    return {
        restrict: 'E',
        link: function postLink(scope, element, attrs) {

          var $scope = scope;

          $scope.showClothFilesModal = function(cloth) {

            $scope.cloth = cloth;

            var filter = {
              clothId: cloth.id
            };

            Temporaries.getFilesList(filter).then(function(result) {
              $scope.clothfiles = result.data.filter(function(f) {
                return +f.available > 0;
              });
            });

            $scope.modalFiles = $modal({template: 'views/modal/clothFiles.html', show: false, scope: $scope});

            $scope.modalFiles.$promise.then($scope.modalFiles.show);
          };

          $scope.setModalCtrl = function(modalCtrl) {

            $scope.modalCtrl = modalCtrl;
          };
        }
      };
	}
);
