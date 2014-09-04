/**
 * Created by Vivaldi on 04/08/14.
 */


angular.module('Savings.Filters')
	.filter('interval', function($locale) {
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
					var string = "biweekly";
					if($locale.id === 'en-gb' ||
						$locale.id === 'en-au' ||
						$locale.id === 'en-nz') {

						string = "fortnightly";
					}

					return string;
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