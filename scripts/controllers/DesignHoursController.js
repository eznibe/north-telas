'use strict';

angular.module('vsko.stock').controller('DesignHoursCtrl', ['$scope', '$translate', 'Utils', 'Stock', 'OneDesign', function ($scope, $translate, Utils, Stock, OneDesign) {

			
			Stock.getAllSailGroups().then(function(result) {
				$scope.sailGroups = result.data;
				translateSailGroups();
			});

			OneDesign.getProperties('line').then(function(result) {
				$scope.lines = result.data.map(function(line) {
					return {
						name: line.name.split('.')[1],
						value: line.value
					};
				});
			});

			$scope.updateSails = function() {
				if ($scope.selectedSailGroup) {
					Stock.getSails($scope.selectedSailGroup.id).then(function(result) {
						// do not show old sails if creating a new prevision or created after date of new sails released
						$scope.sails = result.data.filter(function(s) {
							return s.designMinutes;
						});
						translateSails();
					});
				} else {
					$scope.sails = [];
				}
			}

			$scope.updateSailValue = function() {
				if ($scope.selectedSail) {
					$scope.sailValue = +$scope.selectedSail.designMinutes;
				}
			}

			$scope.updateLineValue = function() {
				$scope.lineValue = +$scope.selectedLine.value;
			}

    	$scope.save = function() {
				
					if ($scope.selectedLine && $scope.lineValue) {
						OneDesign.updateProperties('line.' + $scope.selectedLine.name, $scope.lineValue).then(function(result){
							Utils.showMessage('notify.line_updated');
						});
					}

					if ($scope.selectedSail && $scope.sailValue) {
						$scope.selectedSail.designMinutes = $scope.sailValue;
						Stock.updateSailDesignMinutes($scope.selectedSail).then(function() {
							Utils.showMessage('notify.sail_updated');
						});
					}
			}
			
			function translateSails() {
				$scope.sails.map(function(s) {
					var translation = $translate.instant('sails.'+s.id);
					s.description = translation != 'sails.'+s.id ? translation : s.description;
				});
			}

			function translateSailGroups() {
				$scope.sailGroups.map(function(s) {
					var translation = $translate.instant('sailGroups.'+s.id);
					s.name = translation != 'sailGroups.'+s.id ? translation : s.name;
				});
			}
}]);
