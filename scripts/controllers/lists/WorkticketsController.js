'use strict';

angular.module('vsko.stock').controller('WorkticketsCtrl', ['$scope', '$rootScope', 'Utils', 'DriveAPI', 'uuid4', function ($scope, $rootScope, Utils, DriveAPI, uuid4) {

	var apiLoaded = false;

	$scope.loading = false;

	$scope.files = [];

	$scope.test = function() {

		DriveAPI.init().then(function() {
			DriveAPI.listFiles('1lrbWyaWAdxZxzw3rVLZYSVGIJUU090l_', {fileProperties: 'id, name, parents, modifiedTime'}).then(function(files) {
				console.log('Files:',files);
			});
			apiLoaded = true;
		},
		function(error) {
			console.log('Loaded rejected!');
			if (error.google_logged_in === false) {
				Utils.showMessage('notify.auth_google_drive_failed', 'error');
			}
		});
	}

	function listFiles() {

		$scope.files = [];

		var config = {orderBy: 'modifiedTime desc', q: $scope.searchText, fileProperties: 'contentHints/thumbnail/image,hasThumbnail,id,modifiedTime,name,size,thumbnailLink,webContentLink,webViewLink'};

		DriveAPI.listFiles(workticketsFolder, config).then(function(files) {
			$scope.files = files.map(function(file) {
				file.size = (file.size / 1024 / 1024).toFixed(2); //mb
				file.modifiedOn = moment(file.modifiedTime).format('DD/MM/YYYY (h:mm a)');
				return file;
			});
			$scope.loading = false;
		});

		$scope.loading = true;
	}

  $scope.search = function() {

		if (!apiLoaded) {
			DriveAPI.init().then(function() {
				listFiles();
				apiLoaded = true;
			},
			function(error) {
				console.log('Loaded rejected!');
				if (error.google_logged_in === false) {
					Utils.showMessage('notify.auth_google_drive_failed', 'error');
				}
			});
		} else {
			listFiles();
		}

  };

	$scope.keypress = function($event) {
		var keyCode = $event.which || $event.keyCode;
		if (keyCode === 13) {
			$scope.search();
		}
	};

}]);
