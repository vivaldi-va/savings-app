/**
 * Created by vivaldi on 24/12/13.
 */


angular.module('Savings.Config')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/register', {
				"controller": "RegisterCtrl",
				"templateUrl": "views/register.html"
			})
			.when('/login', {
				"controller": "LoginCtrl",
				"templateUrl": "views/login.html"
			})
			.when('/timeline', {
				"controller": "FinanceCtrl",
				"templateUrl": "views/timeline.html"
			})
			.otherwise({
				"redirectTo": '/timeline'
			});
	}]);