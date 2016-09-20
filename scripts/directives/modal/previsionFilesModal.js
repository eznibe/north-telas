'use strict';

angular.module('vsko.stock')

.directive('previsionFilesModal', function($modal, Utils, DriveAPI) {

  return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

            // weird, to add this directive functions to the modal windows that it's calling it we should seek in 2 parents
        	  var $scope = scope.$parent.$parent;

            $scope.showPrevisionFilesModal = function(files) {

              $scope.selectedFiles = files;

              $scope.modalPrevisionFiles = $modal({template: 'views/modal/previsionFiles.html', show: false, scope: $scope});

              $scope.modalPrevisionFiles.$promise.then($scope.modalPrevisionFiles.show);
            };

        	  $scope.download = function() {

              angular.forEach($scope.selectedFiles, function (file, index) {
                window.open('https://drive.google.com/uc?export=download&id='+file.id);
              });
              $scope.modalPrevisionFiles.hide();
        	  };

            $scope.delete = function() {

              angular.forEach($scope.selectedFiles, function (file, index) {
                DriveAPI.deleteFile(file, {folder: 'production', parentId: $scope.prevision.driveIdProduction, previsionId: $scope.prevision.id}).then(function() {
                  Utils.showMessage('notify.file_deleted');
                  // refersh count of files in folder
                  DriveAPI.listFiles($scope.prevision.driveIdProduction).then(function(files) {
                    Utils.translate('Files count', {count: files.length}).then(function(value) {
                      $scope.filesLbl = value;
                    });
                  });
                }, function(code) {
                  // delete file rejected, possible because not permission to do it
                  Utils.showMessage('notify.file_delete_error', 'error', {fileName: file.name});
                });
              });
              $scope.modalPrevisionFiles.hide();
        	  };
          }
  };
}
);
