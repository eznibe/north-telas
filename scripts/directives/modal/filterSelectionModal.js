'use strict';

angular.module('vsko.stock')

.directive('filterSelectionModal', function($modal, Stock) {

  return {
        restrict: 'E',
        link: function postLink(scope, element, attrs) {

      	  var $scope = scope;
      	  // var callback = attrs.callback;
      	  // var params = attrs.params;
          var initialLoad, firstOpenForColumn;

      	  $scope.showFilterSelectionModal = function(column) {

            $scope.column = column;
            $scope.madeChanges = false;

            initialLoad = true;
            firstOpenForColumn = !$scope.selectionObject[$scope.column];

            $scope.modalSelection = $modal({template: 'views/modal/filterSelection.html', show: false, scope: $scope, backdrop:'static'});

            $scope.modalSelection.$promise.then($scope.modalSelection.show);
      	  };


          $scope.selectOptions = function() {

        	  // console.log($scope.selectionObject[$scope.column]);
            if ($scope.madeChanges) {
              $scope.searchByFilter($scope.column);
            }

        	  $scope.modalSelection.hide();
          };

          $scope.clearOptions = function() {

        	  delete $scope.selectionObject[$scope.column];

            $scope.madeChanges = true;

            $scope.selectOptions();
          };

          $scope.getOptionsModal = function(column) {
        		var res = $scope.filterOptions.columns.filter(function(c) {
        			return c.column == column || c.key == column;
        		});
        		return res.length > 0 && res[0].options.length > 0 ? res[0].options : undefined;
        	}

          $scope.selectionChanged = function() {
            if(!initialLoad || firstOpenForColumn) {
              $scope.madeChanges = true;
            }
            initialLoad = false;
            firstOpenForColumn = false;
          }
        }
      };
	}
);
