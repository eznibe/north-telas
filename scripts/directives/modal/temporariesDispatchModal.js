'use strict';

angular.module('vsko.stock')

.directive('temporariesDispatch', function($modal, Utils, Temporaries) {

  return {
		restrict: 'E',
		link: function postLink(scope, element, attrs) {

			var $scope = scope;
			var callback = attrs.callback;
			var params = attrs.params;
			var index = attrs.index;

			$scope.showTemporariesDispatchModal = function(dispatch) {

        $scope.dispatch = dispatch;

				$scope.modalDispatch = $modal({template: 'views/modal/temporariesDispatch.html', show: false, scope: $scope, callback: callback});

				$scope.modalDispatch.$promise.then($scope.modalDispatch.show);
			};

			$scope.saveDispatch = function() {

				Temporaries.saveDispatch($scope.dispatch).then(function(result) {

          if ($scope.dispatch.isNew) {
            // if it's a new dispatch we'll show the new created files too after saving the dispatch
            $scope.temporariesFiles = result.data.temporariesFiles;
  
            if (result.data.temporariesFiles.length > 0) {
  
              $scope.modalDispatch.hide();
  
              // start showing temporaries files associated to the dispatch, to edit them
              var file = $scope.temporariesFiles.pop();
              file.isNew = true;
              $scope.showTemporariesFileModal(file);
            }
          } else {
            $scope.modalDispatch.hide();
          }
				});
			};

			$scope.temporariesFileUpdated = function() {
        
        var nextFile = $scope.temporariesFiles.pop();
        if (nextFile) {
          nextFile.isNew = true;
          console.log('Show next temporaries file modal:', nextFile);

          $scope.showTemporariesFileModal(nextFile);
        }
			}

		}
	};
});