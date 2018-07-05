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

			$scope.showTemporariesDownloadModal = function(file, download) {

				if (download) {
					$scope.download = download;
					$scope.download.mts = +$scope.download.mts;
				} else {
					$scope.download = {
						fileId: file.fileId,
						isNew: download==null
					};
				}
				
				$scope.file = file;

				$scope.modalDownload = $modal({template: 'views/modal/temporariesDownload.html', show: false, scope: $scope, callback: callback});

				$scope.modalDownload.$promise.then($scope.modalDownload.show);
			};

			$scope.saveDownload = function() {

				Temporaries.saveDownload($scope.download, $rootScope.user.name).then(function(result) {
					Utils.showMessage('notify.download_saved');

					$scope.modalDownload.hide();

					if ($scope[callback]) {
						$scope[callback]($scope.download, $scope.file);
					}
				});
			};

		}
	};
});