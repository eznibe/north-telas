'use strict';

angular.module('vsko.stock')

.directive('temporariesFile', function($modal, Utils, Temporaries) {

  return {
    restrict: 'E',
    link: function postLink(scope, element, attrs) {

      var $scope = scope;
      var callback = attrs.callback;

      $scope.listTypes = ['Dacron', 'Dacron 36', 'Laminados', 'Nylon'];

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
        return Temporaries.updateFileField($scope.file, field, false);
      };

      $scope.updateDispatch = function(entity, newValue, field) {
        console.log('Update dispatch field:',field)
        var dispatch = {
          id: entity.dispatchId
        };
        dispatch[field] = newValue;

        Temporaries.updateDispatchField(dispatch, field, field === 'dueDate');
      };

      $scope.updateMtsInitial = function(entity, newValue, field) {
        
        $scope.updateFile(entity, newValue, field).then(function(result) {
          if (result.data.successful) {
            // update the file available and downloads available
            $scope.file.available = Utils.calculateTemporariesFileAvailable($scope.file);
          }
        });
      };

      $scope.temporariesDownloadUpdated = function(download) {
        console.log('Download updated, catched in file modal');

        if (download.isNew) {

          $scope.file.downloads.push(download);

          // not used??
          $scope.file.fileAvailable = +$scope.file.fileAvailable - download.mts;
          $scope.file.dispatchAvailable = +$scope.file.dispatchAvailable - download.mts;
        }

        $scope.file.available = Utils.calculateTemporariesFileAvailable($scope.file);
      }

      $scope.deleteDownload = function(download) {

        Temporaries.deleteDownload(download).then(function(result) {

          if (result.data.successful) {
            
            Utils.showMessage('notify.download_deleted');

            $scope.file.downloads = $scope.file.downloads.filter(function(d) {
              return d.id != download.id;
            });
            
            // not used anymore ??
            $scope.file.fileAvailable = +$scope.file.fileAvailable + download.mts;
            $scope.file.dispatchAvailable = +$scope.file.dispatchAvailable + download.mts;
    
            $scope.file.available = Utils.calculateTemporariesFileAvailable($scope.file);
          }
        });
      }

      $scope.printFile = function(file) {

        $('#d_dispatch').html(file.shortName);
        $('#d_description').html(file.cloth);
        $('#d_duedate').html(file.dueDate);
        $('#d_clothtype').html(file.clothType);
        $('#d_available').html(file.available);
        $('#d_arancelary').html(file.arancelary);
        $('#d_rollwidth').html(file.rollWidth ? (file.rollWidth + "''") : '');
        $('#d_cif').html(file.cif ? (file.cif + " usd") : '');
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

      $scope.clothTypeDisplayFn = function(t) {
        // console.log('cloth type display:',t)
        return t;
      }
    }
  };
});
