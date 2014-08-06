/**
 * Created by Vivaldi on 04/08/14.
 */


angular.module('Savings.Filters')
	.filter('interval', function() {
		return function(hours) {

			hours = parseInt(hours);

			switch(hours) {
				case 0:
					return "just the once";
					break;
				case 24:
					return "every day";
					break;
				case 168:
					return "each week";
					break;
				case 336:
					return "every other week";
					break;
				case 744:
					return "every month";
					break;
				case 4464:
					return "every 6 months";
					break;
				case 8628:
					return "once a year";
					break;
			}
		}
	});