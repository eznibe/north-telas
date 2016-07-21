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
)

.filter('carriesByType', function () {

		return function(carries, type) {

			var out = new Array();

			if (carries) {
				for (var i = 0; i < carries.length; i++) {
					if(carries[i].type == type) {
						out.push(carries[i]);
					}
				}
			}

			return out;
	    };
    }
);
