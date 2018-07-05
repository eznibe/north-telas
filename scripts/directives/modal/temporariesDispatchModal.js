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

        $scope.dispatch.description = $scope.dispatch.description === '<completar>' ? '' : $scope.dispatch.description;
        $scope.dispatch.shortName = $scope.dispatch.shortName === '<completar>' ? '' : $scope.dispatch.shortName;

        Temporaries.getAllDispatchs().then(function(result) {
          $scope.allDispatchs = result.data;
        });

				$scope.modalDispatch = $modal({template: 'views/modal/temporariesDispatch.html', show: false, scope: $scope, callback: callback});

				$scope.modalDispatch.$promise.then($scope.modalDispatch.show);
			};

			$scope.saveDispatch = function() {

        Temporaries.getDispatchByDescription($scope.dispatch.description).then(function(result) {

          if (result.data.length > 0 && $scope.dispatch.id !== result.data[0].id) {
            // if a dispatch already exists with same number the files will be linked to it
            $scope.dispatch.joinToDispatchId = result.data[0].id;
          }

          Temporaries.saveDispatch($scope.dispatch).then(function(result) {
  
            if (result.data.successful) {

              $scope.dispatch.id = result.data.dispatchId;
  
              if ($scope.dispatch.showFiles) {
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
              
              if ($scope[callback]) {
                $scope[callback]($scope.dispatch);
              }
            } else {
              // TODO show error message saving dipatch
            }
          });
        });
      };
      
      $scope.descriptionChanged = function(str) {
        $scope.dispatch.description = str;
      }

      $scope.selectedDispatch = function(dispatch) {
        
        if (dispatch) {
          console.log('selected dispatch:',dispatch)
          $scope.dispatch.shortName = dispatch.originalObject.shortName;
          $scope.dispatch.dueDate = dispatch.originalObject.dueDate;
        }
      }

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