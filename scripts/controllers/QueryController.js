'use strict';

angular.module('vsko.stock').controller('QueryCtrl', ['$scope', 'Lists', function ($scope, Lists) {

	$scope.doQuery = function() {

		Lists.executeQuery($scope.query).then(function(result){
			$scope.result = result;
		});
	};

	$scope.doUpdate = function() {

		Lists.executePostUpdate($scope.query).then(function(result){
			$scope.result = result;
		});
	};

}]);
