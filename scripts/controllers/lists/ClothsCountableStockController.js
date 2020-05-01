'use strict';

angular.module('vsko.stock').controller('ClothsCountableStockCtrl', ['$scope', 'Stock', 'Lists', '$modal', function ($scope, Stock, Lists, $modal) {

		Stock.getAllGroups(true).then(function(result) {

			$scope.groups = result.data;
		});

		Stock.getInflation().then(function(result) {
			$scope.inflationData = result.data;
		});

		// Stock.getInflation().then(function(result) {
		// 	$scope.inflationPctYear = result.data[0].value;
		// });

		var d = new Date();
		$scope.filter = { upToDate: (d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear()) };

    	$scope.doFilter = function(selectedGroup) {

			if($scope.filter.selectedGroup && $scope.filter.upToDate) {

				Lists.stockUpToDate($scope.filter.selectedGroup.id, $scope.filter.upToDate, true, true).then(function(result) {
					$scope.cloths = result.data;
					// $scope.cloths = [result.data[0]];
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

						let total = ($scope.price(c)).toFixed(2);
						sum += new Number(total);
					});
				}

				return sum.toFixed(2);
			};

			$scope.sumTotalValuedLocal = function() {

				var sum = 0;

				if($scope.filter.searched) {
					$.each($scope.cloths, function(idx, c){

						let total = ($scope.price(c) * +c.dolarValue).toFixed(2);
						sum += new Number(total);
					});
				}

				return sum.toFixed(2);
			};

			$scope.sumTotalValuedWithInflation = function() {

				var sum = 0;

				if($scope.filter.searched) {
					$.each($scope.cloths, function(idx, c){

						let total = ($scope.inflation(c)).toFixed(2);
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
				// exclude those with stock available 0 but also the pending/transit/plotter should be 0
				return +c.available > 0 //|| $scope.delta(c) !== 0 || $scope.deltaWithTransit(c) !== 0 || $scope.sumTemporary(c) !== 0;
			}

			$scope.price = function(c) {
				// var totalPrice = c.rollsAvailable.reduce(function(acc, roll) {
				// 	return acc + (+roll.mts * (roll.price != '?' ? +roll.price : 0));
				// }, 0);
				// return totalPrice;
				return c && +c.available && +c.price ? +c.available * +c.price : 0;
			}
			

			$scope.priceDelta = function(c) {
				var totalPrice = c.rollsAvailable.reduce(function(acc, roll) {
					return acc + (+roll.mts * +roll.price);
				}, 0);
				return totalPrice;
			}

			$scope.valuedLocal = function(c) {
				return $scope.price(c) * +c.dolarValue;
			}

			$scope.inflation = function(c) {

				$scope.inflationPctYear = 35;

				if (c) {

					// c.formattedArriveDate = '13-07-2018'
					// $scope.filter.upToDate = '15-08-2018'

					let monthsNotFound = [];

					let yearsDiff = moment($scope.filter.upToDate, "DD-MM-YYYY").year() - moment(c.formattedArriveDate, "DD-MM-YYYY").year();
					// let monthsDiff = moment($scope.filter.upToDate, "DD-MM-YYYY").diff(moment(c.formattedArriveDate, "DD-MM-YYYY"), 'months', true).toFixed();
					
					let toYear = moment($scope.filter.upToDate, "DD-MM-YYYY").year();
					let toMonth = moment($scope.filter.upToDate, "DD-MM-YYYY").month() + 1;

					let inflationValues = []
					for (let i=0; i < (+yearsDiff + 1); i++) {
	
						let year = moment(c.formattedArriveDate, "DD-MM-YYYY").year() + i;
						let month = 1;
	
						if (i==0) {
							// first year, initial month is different						
							month = moment(c.formattedArriveDate, "DD-MM-YYYY").month() + 2; // for moment jan = 0 and we need to start calculating since arrive next month
						} 
	
						for (; month <= 12 && (year != toYear || month < toMonth) ; month++) {
							let inflationValue = $scope.inflationData.find(i => +i.month === month && +i.year === year);
							if (inflationValue) {
								inflationValues.push(+inflationValue.value);
							} else {
								monthsNotFound.push({year: year, month: month});
							}
						}
					}

					// console.log('Month not found:',monthsNotFound)
					monthsNotFound.forEach(nf => {
						let inflationValue = $scope.inflationData.find(i => +i.month === 13 && +i.year === nf.year);
						if (inflationValue) {
							inflationValues.push(+inflationValue.value / 12);
						} else {
							inflationValues.push(0);
						}
					})

					let sumInflation = inflationValues.reduce((total, num) => total + num, 0).toFixed(1);
	
					// console.log('A', c.formattedArriveDate, 'C', $scope.filter.upToDate, inflationValues, sumInflation)
	
					// return $scope.price(c) * +c.dolarValue * (1 + ($scope.inflationPctYear / 12 * monthsDiff / 100));
					return $scope.price(c) * +c.dolarValue * (1 + (sumInflation / 100))
				}

				return 0;
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
