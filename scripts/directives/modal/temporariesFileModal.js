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
        $scope.file.availableHeader = ($scope.file.available * 1.05).toFixed(2);

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

      $scope.temporariesDownloadUpdated = function(download) {
        console.log('Download updated, catched in file modal');

        if (download.isNew) {

          $scope.file.downloads.push(download);

          $scope.file.fileAvailable = +$scope.file.fileAvailable - download.mts;
          $scope.file.dispatchAvailable = +$scope.file.dispatchAvailable - download.mts;
        }

        $scope.file.available = Utils.calculateTemporariesFileAvailable($scope.file);
        $scope.file.availableHeader = ($scope.file.available * 1.05).toFixed(2);
      }

      $scope.deleteDownload = function(download) {

        Temporaries.deleteDownload(download).then(function(result) {

          if (result.data.successful) {
            
            Utils.showMessage('notify.download_deleted');

            $scope.file.downloads = $scope.file.downloads.filter(function(d) {
              return d.id != download.id;
            });
            
            $scope.file.fileAvailable = +$scope.file.fileAvailable + download.mts;
            $scope.file.dispatchAvailable = +$scope.file.dispatchAvailable + download.mts;
    
            $scope.file.available = Utils.calculateTemporariesFileAvailable($scope.file);
            $scope.file.availableHeader = ($scope.file.available * 1.05).toFixed(2);
          }
        });
      }

      $scope.printFile = function(file) {

        $('#d_dispatch').html(file.shortName);
        $('#d_description').html(file.cloth);
        $('#d_duedate').html(file.dueDate);
        $('#d_clothtype').html(file.clothType);
        $('#d_available').html(file.availableHeader);
        $('#d_arancelary').html(file.arancelary);
        $('#d_rollwidth').html(file.rollWidth + "''");
        $('#d_cif').html(file.cif + " usd");
        $('#d_code').html(file.code);

        $('#printFile').printThis();
      }

      $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
      };
    }
  };
});
