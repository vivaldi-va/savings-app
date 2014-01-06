/**
 * Created by vivaldi on 06/01/14.
 */

angular.module('Savings.Filters')
	.filter('reverse', function () {
		return function (items) {
			return items.slice().reverse();
		};
	});