'use strict';

angular.module('vsko.stock')

.constant('userRoles', {
	admin: [4, '/groups'], // 100
	ordenes: [2, '/previsions'], // 010
	plotter: [1, '/plotter'], // 001
	'velas-od': [1, '/groups'], // 001
	'read-only': [1, '/groups'], // 001
	vendedor: [1, '/production'], // 001
	produccion: [2, '/production'] // 100
})

.constant('accessLevels', {
	admin: 4, // 100
	design: 6, // 110
	plotter: 5, // 101
	user: 7, // 111
	public: 7 // 111
})

.constant('orderStatus', {
	to_buy: 'TO_BUY',
	to_confirm: 'TO_CONFIRM',
	in_transit: 'IN_TRANSIT',
	finished: 'FINISHED',
	deleted: 'DELETED'
})

.constant('countries', {
		list: ['ARG', 'BRA'],
		designOnly: 'OTRO'
})

.constant('temporariesPassword', 'admin.temporarias'
);
