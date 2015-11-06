'use strict';

angular.module('vsko.stock')

//.filter('translate', [ 'localize', function (localize) {
//        return function (input) {
//            return localize.getLocalizedString(input);
//        };
//    }]
//)

.filter('previsionsByType', function () {
	
		return function(previsions, type) {
	      
			var out = new Array();
			
			for (var i = 0; i < previsions.length; i++) {
				if(previsions[i].type == type) {
					out.push(previsions[i]);
				}
			}
			
			return out;
	    };
    }
);
