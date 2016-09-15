'use strict';

angular.module('vsko.stock')

.directive('previsionFilesModal', function($modal, $translate, $rootScope, uuid4, DriveAPI) {

  return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            // $scope.files = [{name: 'File1'}, {name: 'File2'}, {name: 'File3'}];
            $scope.files = [];

            // DriveAPI.init().then(function() {
            //   DriveAPI.listFiles($scope.files);
            // });

            // $scope.files = [];

               $scope.onLoaded = function () {
                 console.log('Google Picker loaded!');
               }

               $scope.onPicked = function (docs) {
                 angular.forEach(docs, function (file, index) {
                   $scope.files.push(file);
                 });
               }

               $scope.onCancel = function () {
                 console.log('Google picker close/cancel!');
               }


        	  $scope.showPrevisionFilesModal = function(prevision) {

              $scope.previsionId = prevision.id;

              $scope.modalPrevisionFiles = $modal({template: 'views/modal/previsionFiles.html', show: false, scope: $scope});

              $scope.modalPrevisionFiles.$promise.then($scope.modalPrevisionFiles.show);
        	  };

        	  $scope.uploadFile = function() {
              DriveAPI.uploadFile($scope.file).then(function() {

              });
        	  };

            $scope.$watch('file.name', function() {
              if ($scope.file && $scope.file.size) {

              }
            });
          }
  };
}
);
