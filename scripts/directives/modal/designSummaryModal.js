'use strict';

angular.module('vsko.stock')

.directive('designSummaryModal', function($modal, Utils, Stock, Orders, orderStatus) {

  return {
    restrict: 'E',
    link: function postLink(scope, element, attrs) {

      var summaryMade = false;
      var $scope = scope;

    	$scope.showDesignSummaryModal = function(allDesign) {

        if (!summaryMade) {
          createSummaryList(allDesign);
          summaryMade = true;
        }

        $scope.modalSummary = $modal({template: 'views/modal/designSummary.html', show: false, scope: $scope});

        $scope.modalSummary.$promise.then($scope.modalSummary.show);
  	  };

      $scope.sumDesignerHours = function(designer, weeknr) {

        var sum = 0;

        if ($scope.summary.weeksData) {
          $scope.summary.weeksData.map(function(weekRow) {
            if (weekRow[designer] && +weeknr === +weekRow.week) {
              sum += weekRow[designer];
            }
          });
        }

        return sum;
      };

      $scope.sumCol = function(designer) {

        var sum = 0;

        if ($scope.summary.weeksData) {
          $scope.summary.weeksData.map(function(week) {
            if (week[designer]) {
              sum += week[designer];
            }
          });
        }

        return sum;
      };

      $scope.sumTotals = function() {

        var sum = 0;

        if ($scope.summary.weeksData) {
          $scope.summary.designers.map(function(designer) {
            sum += $scope.sumCol(designer);
          });
        }

        return sum;
      };



      function createSummaryList(allDesign) {
        $scope.summary = {weeksData: [], designers: []};

        // group by week and sum results for each column
        allDesign.map(function(order) {

          var weekData = getByWeek($scope.summary.weeksData, order.designWeek == 0 ? +order.designWeek + 1 : order.designWeek);
          var hasDesignerAlready = order.designer && $scope.summary.designers.indexOf(order.designer) !== -1;

          if (!weekData) {
            weekData = {week: order.designWeek == 0 ? +order.designWeek + 1 : order.designWeek,
                        sumWeekTotal: sumWeekTotal};

            if (order.designer && order.designHours) {
              weekData[order.designer] = +order.designHours;
            }

            $scope.summary.weeksData.push(weekData);
          } else {
            // week already in list -> sum in corresponding columns
            if (order.designer && order.designHours) {
              weekData[order.designer] = weekData[order.designer] ? weekData[order.designer] + +order.designHours : +order.designHours;
            }
          }

          if (order.designer && !hasDesignerAlready) {
            $scope.summary.designers.push(order.designer);
          }
        });

        $scope.summary.weeksData.sort(function(w1, w2) {
          if (!w1.week) {
            return 1;
          }
          if (!w2.week) {
            return -1;
          }
          return +w1.week > +w2.week;
        });

        console.log('Summary:',$scope.summary);
      }


      function sumWeekTotal(weekData) {
        // sum hours of all designers of this week
        var sum = 0;
        for (var key in weekData) {
          if (key !== 'week' && key !== '$$hashKey' && typeof(weekData[key]) !== 'function') {
            sum += weekData[key];
          }
        }
        return sum;
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
