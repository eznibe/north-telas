'use strict';

angular.module('vsko.stock').controller('WorkticketsCtrl', ['$scope', '$rootScope', 'Utils', 'DriveAPI', 'Lists', 'uuid4', 'lkGoogleSettings', function ($scope, $rootScope, Utils, DriveAPI, Lists, uuid4, lkGoogleSettings) {

	var apiLoaded = false;

	$scope.loading = false;

	$scope.files = [];

	$scope.test = function() {
		DriveAPI.initNoAuth().then(function(authResult) {
			DriveAPI.listFiles('1bknFUHd6yiYsn0hp1PeakW513BRK315N', {fileProperties: 'id, name,owners(displayName,emailAddress),parents'}).then(function(files) {
				console.log('Files:',files);
			});
		});
	}

	function listFiles() {

		$scope.files = [];

		var config = {orderBy: 'modifiedTime desc', q: $scope.searchText, fileProperties: 'contentHints/thumbnail/image,hasThumbnail,id,modifiedTime,name,size,thumbnailLink,webContentLink,webViewLink'};
		var startTime = Date.now();

		DriveAPI.listFiles(workticketsFolder, config).then(function(files) {

			var log = {q: $scope.searchText, time: (Date.now() - startTime)};
			Lists.log({type: 'info.search.googleDrive', log: JSON.stringify(log)});

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
			DriveAPI.initNoAuth().then(function(authResult) {
				Lists.log({type: 'info.auth.googleDrive', log: JSON.stringify(authResult)});
				listFiles();
				apiLoaded = true;
			},
			function(authResult) {
				console.log('Loaded rejected!');
				if (authResult.status.google_logged_in === false) {
					Utils.showMessage('notify.auth_google_drive_failed', 'error');
				}
				Lists.log({type: 'error.auth.googleDrive', log: JSON.stringify(authResult)});
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


	lkGoogleSettings.views = ["DocsView().setParent('"+workticketsFolder+"').setSelectFolderEnabled(true).setIncludeFolders(true)"] ;

	$scope.onBeforePickerOpen = function(elementInfo) {
		// TODO change the drive folder id (prod/design) according to clicked button -> check elementInfo.id == 'productionPicker' / 'designPicker'
		// Note: google-picker module was modified to include this extra call
		console.log('Google Picker before open!', elementInfo);
	}

	$scope.onLoaded = function () {
	 console.log('Google Picker loaded!');
	}

	$scope.onPicked = function (docs) {

	}

	$scope.onCancel = function () {
		// console.log('Google picker close/cancel!');
	}

}]);
