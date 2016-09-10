'use strict';

angular.module('vsko.stock')

.directive('productionSummaryModal', function($modal, Utils, Stock, Orders, orderStatus) {

  return {
    restrict: 'E',
    link: function postLink(scope, element, attrs) {

      var summaryMade = false;
      var $scope = scope;

    	$scope.showProductionSummaryModal = function(allProduction) {

        if (!summaryMade) {
          createSummaryList(allProduction);
          summaryMade = true;
        }

        $scope.modalSummary = $modal({template: 'views/modal/productionSummary.html', show: false, scope: $scope});

        $scope.modalSummary.$promise.then($scope.modalSummary.show);
  	  };

      $scope.sumCol = function(column) {

        var sum = 0;

        if ($scope.summary.weeksData) {
          $scope.summary.weeksData.map(function(week) {
            if (week[column] && week[column]!='-') {
              sum += typeof(week[column]) === 'function' ? week[column](week) : week[column];
            }
          });
        }

        return sum;
      };

      $scope.sumOkDis = 0;



      function createSummaryList(allProduction) {
        $scope.summary = {weeksData: [], okdis: 0};

        // group by week and sum results for each column
        allProduction.map(function(order) {

          var weekData = getByWeek($scope.summary.weeksData, order.week == 0 ? +order.week + 1 : order.week);
          if (!weekData) {
            weekData = {week: order.week == 0 ? +order.week + 1 : order.week,
                        nmo: nmoFn,
                        sumWeekTotal: sumWeekTotal};

            if (order.line) {
              weekData[order.line] = 1;
            }

            $scope.summary.weeksData.push(weekData);
          } else {
            // week already in list -> sum in corresponding columns
            if (order.line) {
              weekData[order.line] = weekData[order.line] ? weekData[order.line] + 1 : 1;
            }
          }

          sumAccordingToPercentage(weekData, order);

          if (order.percentage && (order.percentage == 4 || order.percentage == 5)) {
            $scope.sumOkDis++; 
          }
        });

      }

      function nmoFn(weekData) {
        return (weekData.DA ? weekData.DA : 0) + (weekData.RA ? weekData.RA : 0) + (weekData.NY ? weekData.NY : 0);
      }

      function sumWeekTotal(weekData) {
        return nmoFn(weekData) + (weekData.OD ? weekData.OD : 0) + (weekData.REP ? weekData.REP : 0) + (weekData.CA ? weekData.CA : 0) + (weekData.LO ? weekData.LO : 0);
      }

      function sumAccordingToPercentage(weekData, order) {

        if (!order.percentage) {
          order.percentage = 0;
        }

        if (+order.percentage <= 5) {
          weekData.pend = weekData.pend ? weekData.pend + 1 : 1;
        }

        if (+order.percentage >= 6) {
          weekData.perc6 = weekData.perc6 ? weekData.perc6 + 1 : 1;
        }

        if (+order.percentage <= 6) {
          weekData.prog = weekData.prog ? weekData.prog + 1 : 1;
        }

        if (+order.percentage >= 25) {
          weekData.perc25 = weekData.perc25 ? weekData.perc25 + 1 : 1;
        }

        if (+order.percentage <= 25) {
          weekData.stick = weekData.stick ? weekData.stick + 1 : 1;
        }
      }

      function getByWeek(list, week) {
        var res = list.filter(function(obj) {
          return obj.week == week;
        });

        return res.length > 0 ? res[0] : null;
      }

    }
  };
}
);
