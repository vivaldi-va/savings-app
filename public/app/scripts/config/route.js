/**
 * Created by vivaldi on 24/12/13.
 */


angular.module('Savings.Config')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/timeline', {
				"controller": "FinanceCtrl",
				"templateUrl": "views/timeline.html"
			})
			.otherwise({
				"redirectTo": '/timeline'
			});
	}]);