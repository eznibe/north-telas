/**
 *
 */
angular.module('vsko.stock').factory('DriveAPI',[ '$q', 'Utils', function ($q, Utils) { //eslint-disable-line
  var that = {};

  var SCOPES = ['https://www.googleapis.com/auth/drive'];
  var loadedFiles = [];
  var defer;

  function loadDriveApi() {
    gapi.client.load('drive', 'v3', loadedFn);
  }

  function loadedFn() {
    console.log('Loaded drive api')
    defer.resolve();
  }

  function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
          loaded = true;
          loadDriveApi();
        } else {
          console.log(authResult);
        }
      }

  that.findPrevisionFolder = function(previsionId) {
    var d = $q.defer();
    console.log('Search prevId', previsionId)
    var request = gapi.client.drive.files.list({
        'pageSize': 10,
        'q': "name = '"+previsionId+"'", // works fine
        // 'q': "'"+previsionId+"' in parents",
        'fields': "nextPageToken, files(id, name)"
      });

      request.execute(function(resp) {
        console.log('Files:');
        var files = resp.files;
        if (files && files.length == 1) {
          var file = files[0];
          console.log(file.name + ' (' + file.id + ')');
          d.resolve(file);
        } else {
          console.log('No prevision folder found.');
          d.reject();
        }
      });

      return d.promise;
  };

  that.listFiles = function(parentId) {
    var d = $q.defer();
    var params = {
      'pageSize': 10,
      // 'q': "name contains 'V8888'", // works fine
      // 'q': "'0B85OZZCDsYWNWDhqWkF0djU2R2c' in parents", // Previsions
      // 'q': "'0B85OZZCDsYWNMnEyNTBfZUZpUTg' in parents",  // V8888
      'fields': "nextPageToken, files(id, name)"
    };
    if (parentId) {
      params.q = "'" + parentId + "' in parents";
    }
    if (gapi.client && gapi.client.drive) {
      var request = gapi.client.drive.files.list(params);

      request.execute(function(resp) {
        console.log('Files:');
        var files = resp.files;
        if (files && files.length > 0) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            console.log(file.name + ' (' + file.id + ')');
          }
          d.resolve(files);
        } else {
          console.log('No files found.');
          d.resolve([]);
        }
      });
    } else {
      d.reject();
    }
    return d.promise;
  };

  that.downloadFile = function(file) {
    // var dest = fs.createWriteStream('/tmp/photo.jpg');
    gapi.client.drive.files.get({
       fileId: file.id,
       alt: 'media'
    }).execute(function(res, file) {
      if(res) {
        console.log(res, file);

      } else {

      }
    });
  };

  that.deleteFile = function(file, metadata) {
    var d = $q.defer();
    gapi.client.drive.files.delete({
       fileId: file.id
    }).execute(function(res, resfile) {
      if(res) {
        console.log(res, resfile);
        Utils.logFiles(file.id, file.name, 'delete', metadata.folder, metadata.parentId, metadata.previsionId);
        d.resolve(file);
      } else {
        d.reject();
      }
    });
    return d.promise;
  };

  that.createFolder = function(metadata) {
    var d = $q.defer();
    var fileMetadata = {
      name : metadata.name,
      parents: [  metadata.parentFolderId ],
      mimeType : 'application/vnd.google-apps.folder'
    };
    var request = gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      }).execute(function(res, file) {
        if(res) {
          console.log(res);
          metadata.driveId = res.id;

          Utils.logFiles(metadata.driveId, metadata.name, 'create', metadata.type, metadata.parentFolderId, metadata.previsionId);
          d.resolve(metadata);
        } else {
          d.reject();
        }
      });

    return d.promise;
  };

  that.init = function() {
    defer = $q.defer();
    if (gapi.auth) {

      if (gapi.client && gapi.client.drive && gapi.client.drive.kB.servicePath.indexOf('v2') != -1) {
        // patch to fix problem when opening first the google picker then the gapi version loaded is v2
        gapi.client.drive.kB.servicePath = 'drive/v3/';
      }

      gapi.auth.authorize(
          {
            'client_id': drive_client_id,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, handleAuthResult);
    } else {
      console.log('Rejected init, no gapi.auth');
      defer.reject(false);
    }

    return defer.promise;
  };

  that.uploadFile = function() {
        var request = gapi.client.storage.objects.insert(
      {

      'bucket': bucket,

      'name': "test.uploadFile",

      'body': {

      "media": {

      "contentType": "application/json",

      "data": $.base64.encode( "{id:1, name: 'content file'}" )

      }

      }
      });
      request.execute( function(res) {
        console.log(res);
      } );
  }

  that.uploadFilezz = function (input) {
    var defer = $q.defer();

    var fd = new FormData();
    fd.append('attachment', input.file, input.file.name);
    fd.append('type', input.type);

    $http.post('',
      fd, {
        transformRequest: angular.identity, //eslint-disable-line
        headers: {'Content-Type': undefined} //eslint-disable-line
      })
    .success(function(data, status) {
      var resp = {
        status: status
      };
      defer.resolve(resp);

    }).error(function(resp, status) {

      defer.resolve(resp);
    });

    return defer.promise;
  };

  return that;
}]);
