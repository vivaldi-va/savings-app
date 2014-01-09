/**
 * Created by vivaldi on 08/01/14.
 */
angular.module('Savings.Filters')
	.filter('hideDeleted', function () {
		return function (items) {
			var filtered = [];
			angular.forEach(items, function(item) {
				if (!item.disabled) {
					filtered.push(item);
				}
			});

			return filtered;
		};
	});