'use strict';

angular.module('vsko.stock').controller('BetweenDatesCtrl', ['$scope', 'Stock', 'Lists', 'Users', '$modal', function ($scope, Stock, Lists, Users, $modal) {

				Stock.getAllCloths().then(function(result) {
					$scope.cloths = result.data;
				});

				Users.getPlotterUsers().then(function(result) {
					$scope.users = result.data;
				});

				Stock.getAllProviders().then(function(result) {
					$scope.providers = result.data;
				});

				Stock.getAllGroups().then(function(result) {
					$scope.groups = result.data;
				});

    		// initial filter options
        $scope.filter = {};
        $scope.filter.types = [{name:'Consumos', type: 'plotters', id:'TYPE_PLOTTERS'},
                               {name:'Ingresos', type: 'orders', id:'TYPE_ORDERS'},
                               {name:'Todos', type: 'all', id:'TYPE_BOTH'}];
        $scope.filter.selectedType = $scope.filter.types[0];
        $scope.filter.type = $scope.filter.types[0].id;

				var optionsPlotters = [{name:'Tela', id:'OPTION_CLOTH'},
															 {name:'Grupo', id:'OPTION_GROUP'},
															 {name:'Proveedor', id:'OPTION_PROVIDER'},
															 {name:'Usuario', id:'OPTION_USER'}];
			 	var optionsOrders = [{name:'Tela', id:'OPTION_CLOTH'},
														 {name:'Grupo', id:'OPTION_GROUP'},
														 {name:'Proveedor', id:'OPTION_PROVIDER'},
														 {name:'Nr. factura', id:'OPTION_INVOICE'}];
				var optionsBoth = [{name:'Tela', id:'OPTION_CLOTH'}];

        $scope.filter.options = optionsPlotters;
        $scope.filter.selectedOption = $scope.filter.options[0];

				$scope.filter.groupByOptions = [{name:'Tela', id:'GROUP_BY_CLOTH'}];
        //$scope.filter.selectedGroupByOption = $scope.filter.groupByOptions[0];


        $scope.search = function() {

        	$scope.filter.type = $scope.filter.selectedType.id;
					var groupBy = ($scope.filter.selectedGroupBy && $scope.filter.selectedGroupBy.id) ? $scope.filter.selectedGroupBy.id : null;

					$scope.filter.searchedWithGroupBy = groupBy;

       		Lists.betweenDates($scope.filter, $scope.filter.selectedType.type, groupBy).then(function(result) {
       			$scope[$scope.filter.selectedType.type] = result.data;
        	});
        };

        $scope.showRolls = function(rolls) {

	    		var toStringRolls = "";

	    		$.each(rolls, function(idx, r){
	    			toStringRolls += "("+r.number+" / "+r.lote+") ";
	        	});

	    		return toStringRolls;
	    	};

				$scope.clearFilterOption = function() {
					$scope.filter.invoice = null;
					$scope.filter.selectedCloth = null;
					$scope.filter.selectedUser = null;
					$scope.filter.selectedProvider = null;
					$scope.filter.selectedGroup = null;
				};

				$scope.updateFilterOptions = function() {
					$scope.clearFilterOption();
					if ($scope.filter.selectedType.id === 'TYPE_PLOTTERS') {
						$scope.filter.options = optionsPlotters;
					} else if ($scope.filter.selectedType.id === 'TYPE_ORDERS') {
						$scope.filter.options = optionsOrders;
					} else {
						$scope.filter.options = optionsBoth;
					}
	        $scope.filter.selectedOption = $scope.filter.options[0];
				}
}]);
