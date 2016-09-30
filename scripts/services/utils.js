/**
 * Created by matthias.snellings on 10/07/2014.
 */
angular.module('vsko.stock').factory('Utils',[ '$translate', '$http', '$timeout', '$rootScope', function ($translate, $http, $timeout, $rootScope) { //eslint-disable-line
  var that = {};
  var baseUrl = telasAPIUrl;

  that.showMessage = function (key, type, params) {
    $translate(key, params ? params : {}).then(function(value) {
      $.notify(value, {className: type ? type : 'success', globalPosition: "bottom right"});
    });
  };

  that.showIntrusiveMessage = function (key, type, params) {
    $translate(key, params ? params : {}).then(function(value) {
      $.notify(value, {className: type ? type : 'success', globalPosition: "bottom right"});
      $timeout(function() {
    		alert(value);
    	}, 200);
    });
  };

  that.translate = function(key, params) {
    return $translate(key, params ? params : {});
  };

  that.logTiming = function (startTime, url, service, method, entity) {
    var payload = {time: (Date.now() - startTime),
                   url: url,
                   service, service,
                   method: method,
                   user: $rootScope.user.name,
                   entity: JSON.stringify(entity)};
    $http.post(baseUrl + 'timing_POST.php', payload);
  };

  that.logFiles = function (fileId, fileName, action, folder, parentId, previsionId) {
    var payload = {fileId: fileId,
                   fileName: fileName,
                   action: action,
                   folder: folder,
                   parentId: parentId,
                   previsionId: previsionId,
                   user: $rootScope.user.name};
    $http.post(baseUrl + 'log_POST.php?files=true', payload);
  };

  // log an error received in UI as response to a POST (!successful)
  that.logUIError = function (type, entity) {
    var log = {type : type, log: JSON.stringify(entity), user: $rootScope.user.name};

    // TODO log to a remote server too (just as backup)
    // $http.post(remoteAPIUrl + 'remotelog_POST.php', log);

    return $http.post(baseUrl + 'log_POST.php', log);
  };

  return that;
}]);
