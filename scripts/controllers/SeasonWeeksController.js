'use strict';

angular.module('vsko.stock').controller('SeasonWeeksCtrl', ['$scope', '$translate', '$cookieStore', 'Utils', 'Stock', 'Production', function ($scope, $translate, $cookieStore, Utils, Stock, Production) {


      Production.getWeeksBySeason().then(function(weeksBySeason) {
      	$scope.seasonWeeks1 = weeksBySeason.data[0].value;
				$scope.seasonWeeks1Orig = $scope.seasonWeeks1;
        $scope.seasonWeeks2 = weeksBySeason.data[1].value;
				$scope.seasonWeeks2Orig = $scope.seasonWeeks2;
      });


    	$scope.save = function() {

        if($scope.seasonWeeks1Orig != $scope.seasonWeeks1) {

					Production.saveSeasonWeeks('seasonWeeks.1', $scope.seasonWeeks1).then(function(result){
            Utils.showMessage('notify.weeks_updated');
	    		});
				}

        if($scope.seasonWeeks2Orig != $scope.seasonWeeks2) {

          Production.saveSeasonWeeks('seasonWeeks.2', $scope.seasonWeeks2).then(function(result){
            Utils.showMessage('notify.weeks_updated');
	    		});
				}
    	}
}]);
