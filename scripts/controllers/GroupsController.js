'use strict';

angular.module('vsko.stock').controller('GroupsCtrl', ['$scope', 'Stock', '$modal', function ($scope, Stock, $modal) {

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
	    	  		$.notify("Grupo '"+group.name+ "' creado.", {className: "success", globalPosition: "bottom right"});
	    	  		$scope.groups.push(result.data.group);
						}
						else {
							$.notify("Grupo '"+group.name+ "' actualizado.", {className: "success", globalPosition: "bottom right"});
						}
    	  	});
        };
}]);
