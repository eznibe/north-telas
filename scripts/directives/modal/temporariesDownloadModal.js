'use strict';

angular.module('vsko.stock')

.directive('temporariesDownload', function($modal, $rootScope, Utils, Temporaries) {

  return {
		restrict: 'E',
		link: function postLink(scope, element, attrs) {

			var $scope = scope;
			var callback = attrs.callback;
			var params = attrs.params;
			var index = attrs.index;

			$scope.showTemporariesDownloadModal = function(file, isNew) {

        $scope.download = {
          fileId: file.fileId,
          isNew: isNew
        };

				$scope.modalDownload = $modal({template: 'views/modal/temporariesDownload.html', show: false, scope: $scope, callback: callback});

				$scope.modalDownload.$promise.then($scope.modalDownload.show);
			};

			$scope.addDownload = function() {

				Temporaries.addDownload($scope.download, $rootScope.user.name).then(function(result) {
            $scope.modalDownload.hide();

            if ($scope[callback]) {
              $scope[callback]($scope.download);
            }
				});
			};

		}
	};
});