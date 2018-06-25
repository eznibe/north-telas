'use strict';

angular.module('vsko.stock')

.directive('temporariesFile', function($modal, Utils, Temporaries) {

  return {
    restrict: 'E',
    link: function postLink(scope, element, attrs) {

      var $scope = scope;
      var callback = attrs.callback;

      $scope.showTemporariesFileModal = function(temporariesFile) {

        $scope.file = temporariesFile;

        // calculate available
        $scope.file.available = Utils.calculateTemporariesFileAvailable($scope.file);

        // show the file modal
        $scope.modalFile = $modal({template: 'views/modal/temporariesFile.html', show: false, scope: $scope, callback: callback});

        $scope.modalFile.$promise.then($scope.modalFile.show);
      };

      $scope.saveTemporariesFile = function(tFile) {

        console.log('Saving temporaries file:', tFile);

        Temporaries.saveFile(tFile).then(function() {

          $scope.modalFile.hide();
  
          if ($scope[callback]) {
            $scope[callback](tFile);
          }
        })
      };

      $scope.updateFile = function(entity, newValue, field) {
        console.log('Update file field:',field)
        Temporaries.updateFileField($scope.file, field, false);
      };

      $scope.updateDispatch = function(entity, newValue, field) {
        console.log('Update dispatch field:',field)
        var dispatch = {
          id: entity.dispatchId
        };
        dispatch[field] = newValue;

        Temporaries.updateDispatchField(dispatch, field, field === 'dueDate');
      };

      $scope.temporariesDownloadCreated = function(download) {
        console.log('New download created, catched in file modal');

        $scope.file.downloads.push(download);

        $scope.file.available = Utils.calculateTemporariesFileAvailable($scope.file);
      }
    }
  };
});
