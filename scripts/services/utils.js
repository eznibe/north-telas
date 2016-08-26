/**
 * Created by matthias.snellings on 10/07/2014.
 */
angular.module('vsko.stock').factory('Utils',[ '$translate', '$http', function ($translate, $http) { //eslint-disable-line
  var that = {};
  var baseUrl = telasAPIUrl;

  that.showMessage = function (key, type, params) {
    $translate(key, params ? params : {}).then(function(value) {
      $.notify(value, {className: type ? type : 'success', globalPosition: "bottom right"});
    });
  };

  that.logTiming = function (startTime, url, service, method, entity) {
    var payload = {time: (Date.now() - startTime),
                   url: url,
                   service, service,
                   method: method,
                   entity: JSON.stringify(entity)};
    $http.post(baseUrl + 'timing_POST.php', payload);
  };

  return that;
}]);
