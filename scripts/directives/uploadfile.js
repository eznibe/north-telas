angular.module('vsko.stock') //eslint-disable-line
.directive('file', function () {
  'use strict';
  return {
    scope: {
      file: '='
    },
    link: function (scope, el) {
      el.bind('change', function (event) {
          var file = event.target.files[0];
          scope.file = file ? file : null;
          scope.$apply();
        });
    }
  };
});
