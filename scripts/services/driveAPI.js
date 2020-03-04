/**
 *
 */
angular.module('vsko.stock').factory('DriveAPI',[ '$q', 'Utils', function ($q, Utils) { //eslint-disable-line
  var that = {};

  // var SCOPES = ['https://www.googleapis.com/auth/drive'];
  var SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
  var loadedFiles = [];
  var defer;
  var auth;
  var authorized;

  function loadDriveApi() {
    gapi.client.load('drive', 'v3', loadedFn);
  }

  function loadedFn() {
    console.log('Loaded drive api')
    defer.resolve(auth);
  }

  function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
      console.log('Success auth:');
      console.log(authResult);
      auth = authResult;
      loaded = true;
      loadDriveApi();
    } else {
      console.log('Failed auth:');
      console.log(authResult);
      defer.reject(authResult);
    }
  }

  function updateApiVersion() {
    if (gapi.client && gapi.client.drive && gapi.client.drive.WF.servicePath.indexOf('v2') != -1) {
      // patch to fix problem when opening first the google picker then the gapi version loaded is v2
      gapi.client.drive.WF.servicePath = 'drive/v3/';
    }
  }

  // ---- Interface functions ---- //

  that.listFiles = function(parentId, config) {
    var d = $q.defer();
    config = config || {};
    var params = {
      'pageSize': 100,
      // 'q': "name contains 'Ordenes'", // works fine
      // 'q': "'0B85OZZCDsYWNWDhqWkF0djU2R2c' in parents", // Previsions
      // 'q': "'0B85OZZCDsYWNMnEyNTBfZUZpUTg' in parents",  // V8888
      'fields': "nextPageToken, files" + (config.fileProperties ? ("(" + config.fileProperties + ")") : "(id, name, parents)")
    };
    if (parentId) {
      params.q = "'" + parentId + "' in parents";
    }
    if (config.q) {
      var textQuery = "fullText contains '" + config.q + "'";
      params.q = params.q ? params.q + " and " + textQuery : textQuery;
    }
    if (config.orderBy) {
      params.orderBy = config.orderBy;
    }

    // console.log('Search params',params)

    if (typeof gapi != 'undefined') { // check of not gapi defined needed for offline or problems loading client

      if (gapi && gapi.client && gapi.client.drive) {

        updateApiVersion();

        var request = gapi.client.drive.files.list(params);

        request.execute(function(resp) {
          // console.log('Files:');
          var files = resp.files;
          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              // console.log(file.name + ' (' + file.id + ')');
            }
            d.resolve(files);
          } else {
            console.log('No files found.');
            d.resolve([]);
          }
        });
      } else {
        d.reject();
        loadDriveApi();
      }
    } else {
      console.log('No gapi var.');
      d.reject();
    }
    return d.promise;
  };

  that.hasPermissions = function(parentId) {
    var d = $q.defer();
    var params = {
      'fileId': parentId,
    };
    if (typeof gapi != 'undefined') { // check of not gapi defined needed for offline or problems loading client

      if (gapi && gapi.client && gapi.client.drive) {
        var request = gapi.client.drive.files.get(params);

        request.execute(function(resp) {
          console.log('Permissions', resp);
          if (resp.code > 400) {
            d.resolve(false);
          } else {
            d.resolve(true);
          }
        });
      } else {
        d.reject(500);
      }
    } else {
      console.log('No gapi var.');
      d.reject(500);
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
      if(res.code > 400) {
        console.log('Rejected:', res);
        d.reject(res.code);
      } else if(res) {
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
        if(res && res.code != 404) {
          console.log(res);
          metadata.driveId = res.id;

          Utils.logFiles(metadata.driveId, metadata.name, 'create', metadata.type, metadata.parentFolderId, metadata.previsionId);
          d.resolve(metadata);
        } else if (res && res.code == 404) {
          // not found folder mean it doesn exists or dont have permissions to see it
          console.log('Error 404, no possible to create folder', metadata);
          d.reject(404);
        } else {
          d.reject(500);
        }
      });

    return d.promise;
  };

  that.init = function() {
    defer = $q.defer();
    if (typeof gapi != 'undefined') { // check of not gapi defined needed for offline or problems loading client
      if (gapi.auth) {

        updateApiVersion();

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
    } else {
      defer.reject(false);
    }

    return defer.promise;
  };

  that.init2 = function() {
    defer = $q.defer();
    if (typeof gapi != 'undefined') { // check of not gapi defined needed for offline or problems loading client
      if (gapi.auth2) {

        updateApiVersion();

        // TODO: possible optimization: use 'prompt: none' in case of error 'immediate_failed' try again with 'prompt: select_account'
        // this will avoid the promt for user that already gave consent to the app automatically
        gapi.auth2.authorize(
            {
              'client_id': drive_client_id,
              'scope': SCOPES.join(' ')
              // TODO use to avoid selecting the email every time (get from profile): 'login_hint': 'enbertran@gmail.com'
            }, handleAuthResult);
      } else {
        console.log('Rejected init, no gapi.auth');
        defer.reject(false);
      }
    } else {
      defer.reject(false);
    }

    return defer.promise;
  };

  that.initNoAuth = function() {
    defer = $q.defer();
    if (typeof gapi != 'undefined') { // check of not gapi defined needed for offline or problems loading client
      gapi.client.init({
        'apiKey': drive_api_key,
        'clientId': drive_client_id,
        'scope': 'https://www.googleapis.com/auth/drive.readonly',
      }).then(function() {
        handleAuthResult({initNoAuth: true});
      });
    }

    return defer.promise;
  };

  that.setAuthorized = function(value) {
    authorized = value;
  }

  that.isAuthorized = function() {
    return authorized;
  }

  return that;
}]);
