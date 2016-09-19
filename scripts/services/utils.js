/**
 * Created by matthias.snellings on 10/07/2014.
 */
angular.module('vsko.stock').factory('Utils',[ '$translate', '$http', '$rootScope', function ($translate, $http, $rootScope) { //eslint-disable-line
  var that = {};
  var baseUrl = telasAPIUrl;

  that.showMessage = function (key, type, params) {
    $translate(key, params ? params : {}).then(function(value) {
      $.notify(value, {className: type ? type : 'success', globalPosition: "bottom right"});
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

  return that;
}]);
