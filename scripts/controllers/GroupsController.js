'use strict';

angular.module('vsko.stock').controller('GroupsCtrl', ['$scope', '$location', 'Utils', 'Stock', '$modal', function ($scope, $location, Utils, Stock, $modal) {

        // initial list of cloth groups
        Stock.getAllGroups().then(function(result) {
        	$scope.groups = result.data;
        });

//	 Stock.idp().then(function(result) {
//        	console.log(result.data);
//        });

//        Stock.alive();

//        Stock.cors();  // !!


        $scope.showGroupModal= function(group) {

  		  		$scope.group = group ? group : {};


            $scope.modalGroup = $modal({template: 'views/modal/group.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

            $scope.modalGroup.$promise.then($scope.modalGroup.show);
        };

        $scope.saveGroup = function(group) {

        	$scope.modalGroup.hide();

    	  	Stock.saveGroup(group).then(function(result){

    	  		// show feedback message
						if(result.data.isNew) {
              Utils.showMessage('notify.group_created', 'success', {groupName: group.name});
	    	  		$scope.groups.push(result.data.group);
						}
						else {
              Utils.showMessage('notify.group_updated', 'success', {groupName: group.name});
						}
    	  	});
        };

        $scope.openGroup = function(groupId) {

  		  		$location.path('/groups/' + groupId);
        };
}]);
