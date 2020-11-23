'use strict';

angular.module('vsko.stock')

.factory('Files', ['$q', 'DriveAPI', 'Previsions', function ($q, DriveAPI, Previsions) {

    this.createFolders = function(prevision) {
      var d = $q.defer();
      var promises = [];

      var folderTypes = [{type: 'produccion', parentFolderId: productionFilesFolder, column: 'driveIdProduction'}
                      //  , {type: 'diseno', parentFolderId: designFilesFolder, column: 'driveIdDesign'}
                        ];
      DriveAPI.init().then(function() {

        folderTypes.map(function(metadata) {
          // metadata.name = metadata.type + '_' + prevision.id;
          metadata.name = prevision.orderNumber;
          metadata.previsionId = prevision.id;

          if (prevision.line && productionFolders[prevision.line]) {
            metadata.parentFolderId = productionFolders[prevision.line];
          }

          promises.push(DriveAPI.createFolder(metadata));
        });

        $q.all(promises).then(function(results) {

          results.map(function(result) {
            prevision[result.column] = result.driveId;
            //  store new drive id in prevision
            if (result.driveId) {
              Previsions.editField(prevision, result.column);
            }
          })

          d.resolve();
        });
      },
      function() {
        console.log('DriveAPI loaded rejected!');
      });


      return d.promise;
    };

    // deprecated
    this.batchCreateInDrive = function(previsions) {

      var folderTypes = [{type: 'produccion', parentFolderId: productionFilesFolder, column: 'driveIdProduction'}, {type: 'diseno', parentFolderId: designFilesFolder, column: 'driveIdDesign'}];

      DriveAPI.init().then(function() {

        previsions.map(function(prevision) {

          folderTypes.map(function(item) {

            DriveAPI.createFolder(item.type + '_' + prevision.id, item.parentFolderId).then(function(newDriveId) {
              //  store new drive id in prevision
              var prev = {id: prevision.id};
              prev[item.column] = newDriveId;
              Previsions.editField(prev, item.column);
            });
          });
        });
      },
      function() {
        console.log('DriveAPI loaded rejected!');
      });
    };

    return this;
}]);
