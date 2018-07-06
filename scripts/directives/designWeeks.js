'use strict';

angular.module('vsko.stock')

.directive('designWeeks', function() {

    return {
          restrict: 'E',
          replace: true,
          templateUrl: 'views/directives/designWeeks.html',
          link: function postLink(scope, element, attrs) {

            scope.nextWeeks = calculateNextWeeks(8);

            scope.designWeeks = [{number: 1, startDay: scope.nextWeeks[0].start, endDay: scope.nextWeeks[0].end, month: 'Month.'+scope.nextWeeks[0].month, backgroundColor: '#ddee99'},
                           {number: 2, startDay: scope.nextWeeks[1].start, endDay: scope.nextWeeks[1].end, month: 'Month.'+scope.nextWeeks[1].month, backgroundColor: '#ffff99'},
                           {number: 3, startDay: scope.nextWeeks[2].start, endDay: scope.nextWeeks[2].end, month: 'Month.'+scope.nextWeeks[2].month, backgroundColor: '#a3d3ac'},
                           {number: 4, startDay: scope.nextWeeks[3].start, endDay: scope.nextWeeks[3].end, month: 'Month.'+scope.nextWeeks[3].month, backgroundColor: '#ffdab9'},
                           {number: 5, startDay: scope.nextWeeks[4].start, endDay: scope.nextWeeks[4].end, month: 'Month.'+scope.nextWeeks[4].month, backgroundColor: '#ffee99'},
                           {number: 6, startDay: scope.nextWeeks[5].start, endDay: scope.nextWeeks[5].end, month: 'Month.'+scope.nextWeeks[5].month, backgroundColor: '#aaee99'},
                           {number: 7, startDay: scope.nextWeeks[6].start, endDay: scope.nextWeeks[6].end, month: 'Month.'+scope.nextWeeks[6].month, backgroundColor: '#849FE8'},
                           {number: 8, startDay: scope.nextWeeks[7].start, endDay: scope.nextWeeks[7].end, month: 'Month.'+scope.nextWeeks[7].month, backgroundColor: '#A9B67E'}
                         ];

             function calculateNextWeeks(nr) {
               var result = [];
               var weekStart = moment().day(0);
               var weekEnd = moment().day(6);
               result.push({start: weekStart.format('D'), end: weekEnd.format('D'), month: weekEnd.format('M')});

               for(var i=1; i < nr; i++) {
                 weekStart = weekStart.add(7, 'days');
                 weekEnd = weekEnd.add(7, 'days');

                 result.push({start: weekStart.format('D'), end: weekEnd.format('D'), month: weekEnd.format('M')});
               }

               return result;
             }
          }
        };
	}
);
