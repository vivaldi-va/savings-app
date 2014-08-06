/**
 * Created by Vivaldi on 06/08/14.
 */


angular.module('Savings.Filters')
	.filter('charsLeft', function() {
		return function(limit, string) {
			if(string && string.length) {
				var count = limit - string.length;

				return count;
			} else {
				return limit;
			}
		}
	});