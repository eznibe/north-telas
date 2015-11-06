'use strict';

angular.module('vsko.stock')

/*.directive('autocomplete', function factory($parse) {

    return {
          restrict: 'A',
          link: function postLink(scope, element, attrs, controller) {

            var key=attrs.key;
            var source=attrs.source;
            var minLength=attrs.minlength;

            element.typeahead({
                source: function (query, process) {

                    var getter = $parse(source);
//                    var setter = getter.assign;
                    var value = getter(scope);

                    if(!minLength || query.length >= minLength)
                    	value(query, process);
                },
                minLength: attrs.minlength || 1,
                items: attrs.items,
                updater: function (item) {
                    var getter = $parse(key), setter = getter.assign;

                    scope.$apply(function () {
                        setter(scope, map[item].uuid);
                    });
                    return item;
                },
                matcher: function (item) {
                    if (item.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
                        return true;
                    }
                },
                sorter: function (items) {
                    return items.sort();
                },
                highlighter: function (item) {
                    var regex = new RegExp( '(' + this.query + ')', 'gi' );
                    return item.replace( regex, "<strong>$1</strong>" );
                }
            });
          }
        };
})*/

.directive('datePicker', function() {

	return {
        restrict: 'A',

        link: function(scope, elem, attr) {

        	elem.datepicker( {
        		format: "dd-mm-yyyy",
                autoclose: true,
                todayHighlight: true,
        		language: "en"
        	} );
        }
    };
})

.directive('accessLevel', ['$rootScope', 'userRoles', 'accessLevels' , function($rootScope, userRoles, accessLevels) {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {
            // show/hide element depending on the accesslevel set for it, watching the role of the logged user
        	$rootScope.$watch('user.role', function(role){

        		var elemAccessLevel = attrs.accessLevel;

        		if(userRoles[role] && userRoles[role][0] & accessLevels[elemAccessLevel]) { // eg. 100 (4/admin) & 110 (6/design) = true
        			$(elem).show();
        		}
        		else {
        			$(elem).hide();
        		}
        	});
        }
    };
}])

.directive('accessRestricted', ['$rootScope', 'userRoles', 'accessLevels' , function($rootScope, userRoles, accessLevels) {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {
            // show/hide element depending on the accesslevel set for it, watching the role of the logged user
        	$rootScope.$watch('user.role', function(role){

        		var elemsAccessRestricted = attrs.accessRestricted.split(',');

        		if(elemsAccessRestricted.lastIndexOf(role) != -1) { // contains
        			$(elem).hide();
        		}
        		else {
        			$(elem).show();
        		}
        	});
        }
    };
}])

.directive('accessAllowed', ['$rootScope', 'userRoles', 'accessLevels' , function($rootScope, userRoles, accessLevels) {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {
            // show/hide element depending on the accesslevel set for it, watching the role of the logged user
        	$rootScope.$watch('user.role', function(role){

        		var elemsAccessAllowed = attrs.accessAllowed.split(',');

        		if(elemsAccessAllowed.lastIndexOf(role) != -1) { // contains
        			$(elem).show();
        		}
        		else {
        			$(elem).hide();
        		}
        	});
        }
    };
}])

.directive('focusMe', [function() {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {

        	$(elem).focus();
        }
    };
}])

.directive('stopPropagation', function() {

	return {
        restrict: 'A',

        link: function(scope, elem, attrs) {

        	$(elem).click(function (e) {
        	    e.stopPropagation();
        	});
        }
    };
})

// Bootstrap tooltips -> http://getbootstrap.com/javascript/#tooltips
.directive('myTooltip', function() {

	return {
        restrict: 'A',

        scope: { message: '=myTooltip' },
        link: function(scope, elem) {

        	$(elem).tooltip({title: scope.message });
        }
    };

})

.directive('stockTooltip', function() {

	return {
        restrict: 'A',

        scope: { cloth: '=stockTooltip' },
        link: function(scope, elem) {

        	$(elem).tooltip({title: sumStockDef(scope.cloth.providers) + ' Def. / ' + sumStockTemp(scope.cloth.providers) + ' Temp.' });
        }
    };

    function sumStockDef(providers) {

    	var sum = 0;
			if(!providers)
				return sum;

    	$.each(providers, function(idx, p){ sum += new Number(p.stockDef); });
    	return sum;
    };

    function sumStockTemp(providers) {

    	var sum = 0;

			if(!providers)
				return sum;

    	$.each(providers, function(idx, p){ sum += new Number(p.stockTemp); });
    	return sum;
    };
})

.directive('priceTooltip', function() {

	return {
        restrict: 'AC',

        scope: { price: '=priceTooltip' },
        link: function(scope, elem) {

        	$(elem).tooltip({title: scope.price + ' / yds' });
        }
    };

})

.directive('googleAnalytics', function ( $location, $window ) {
  return {
	  restrict: 'A',
    scope: true,
    link: function (scope) {
      scope.$on( '$routeChangeSuccess', function () {
    	  if($window.ga)
    		  $window.ga('send', 'pageview', {'page': $location.path()});
      });
    }
  };
});
