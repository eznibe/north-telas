'use strict';

angular.module('vsko.stock').controller('ClothsValuedStockCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

			Stock.getAllGroups().then(function(result) {

				$scope.groups = result.data;
			});

			var d = new Date();
			$scope.filter = { upToDate: (d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear()) };

    	$scope.doFilter = function(selectedGroup) {

				if($scope.filter.selectedGroup && $scope.filter.upToDate) {

					Lists.stockUpToDate($scope.filter.selectedGroup.id, $scope.filter.upToDate, true).then(function(result) {
						$scope.cloths = result.data;
						$scope.filter.searched = true;
					});
				}
    	};

    	$scope.sumStock = function(cloth) {

				var providers = cloth.providers;

				if(!cloth.providers)
					return 0;

      	var sum = 0;

      	$.each(providers, function(idx, p){
      		sum += new Number(p.stock);
      	});

      	return sum;
      };

			$scope.sumPrevision = function(cloth) {

				var sum = 0;

				$.each(cloth.previsions, function(idx, p){
					sum += new Number(p.mts);
				});

				return sum;
			};

			$scope.sumPending = function(cloth) {

				var sum = 0;

				if(!cloth || !cloth.previsions || !cloth.plotters)
					return sum;

				$.each(cloth.plotters, function(idx, pl){
					var res = cloth.previsions.findAll({id:pl.previsionId});
					if(res && res.length==0) {
						sum += new Number(pl.mtsDesign);
					}
				});

				return sum;
			};

			$scope.sumTemporary = function(cloth) {

				var sum = 0;

				$.each(cloth.rollsAvailable, function(idx, r){
						if(r.type == 'TEMP')
							sum += new Number(r.mts);
				});

				return sum;
			};

			$scope.sumInTransit = function(cloth) {

				var sum = 0;

				if(!cloth || !cloth.ordersInTransit || cloth.ordersInTransit.length==0)
					return sum;

				$.each(cloth.ordersInTransit, function(idx, o){

					$.each(o.products, function(idx, p){
						if(p.clothId == cloth.clothId)
							sum += new Number(p.amount);
					});
				});

				return sum;
			};

			$scope.delta = function(c) {
				return c.sumAvailable - $scope.sumPrevision(c) - $scope.sumPending(c);
			};

			$scope.deltaRoll = function(r) {
				return r.mts - $scope.sumPrevision(r) - $scope.sumPending(r);
			};

			$scope.deltaWithTransit = function(c) {
				return c.sumAvailable - $scope.sumPrevision(c) - $scope.sumPending(c) + $scope.sumInTransit(c);
			};

			$scope.sumTotalValued = function() {

				var sum = 0;

				if($scope.filter.searched) {
					$.each($scope.cloths, function(idx, c){

						var total = ($scope.price(c)).toFixed(2);
						sum += new Number(total);
					});
				}

				return sum.toFixed(2);
			};

			$scope.sumDeltaValued = function(positives) {

				var sum = 0;

				if($scope.filter.searched) {
					$.each($scope.cloths, function(idx, c){

						if(positives && $scope.delta(c) > 0) {
							sum += new Number($scope.delta(c) * c.price);
						}
						else if(!positives && $scope.delta(c) < 0) {
							sum += new Number($scope.delta(c) * c.price);
						}
					});
				}

				if(!positives) {
					sum = sum * -1;
				}

				return sum.toFixed(2);
			};

			$scope.sumDeltaWithTransitValued = function() {

				var sum = 0;

				if($scope.filter.searched) {
					$.each($scope.cloths, function(idx, c){
							sum += new Number($scope.deltaWithTransit(c) * c.price);
					});
				}

				return sum.toFixed(2);
			};

			$scope.stock0 = function(c) {
				// exclude thos with stock available 0 but also the pending/transit/plotter should be 0
				return c.sumAvailable > 0 || $scope.delta(c) !== 0 || $scope.deltaWithTransit(c) !== 0 || $scope.sumTemporary(c) !== 0;
			}

			$scope.price = function(c) {
				var totalPrice = c.rollsAvailable.reduce(function(acc, roll) {
					return acc + (+roll.mts * (roll.price != '?' ? +roll.price : 0));
				}, 0);
				return totalPrice;
			}

			$scope.priceDelta = function(c) {
				var totalPrice = c.rollsAvailable.reduce(function(acc, roll) {
					return acc + (+roll.mts * +roll.price);
				}, 0);
				return totalPrice;
			}

      function divideRollsByState(cloths) {

					if(!cloths)
						return;

    			$.each(cloths, function(idx, c){

	    			c.rollsAvailable = new Array();
	    			c.rollsInTransit = new Array();

	    			$.each(c.rolls, function(idx, r){

	    				r.incoming == '1' ? c.rollsInTransit.push(r) : c.rollsAvailable.push(r);
	    			});
        	});
      }
}]);
