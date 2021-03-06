/**
 * Created by Vivaldi on 04/08/14.
 */


angular.module('Savings.Services')
	.factory('ErrorService', function() {

		return {
			messages: function(array) {
				var formattedErrors = {};
				angular.forEach(array, function(error) {
					if(!formattedErrors[error.param]) {
						formattedErrors[error.param] = error.msg;
					}
				});
				return formattedErrors;
			}
		}

	});