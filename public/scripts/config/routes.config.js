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
			.when('/passreset/:token', {
				"controller": "RecoverCtrl",
				"templateUrl": "views/passreset.partial.html"
			})
			.when('/passreset', {
				"controller": "RecoverCtrl",
				"templateUrl": "views/passreset.partial.html"
			})
			.when('/verify/:token', {
				"controller": "VerifyCtrl",
				"templateUrl": "views/verify.partial.html"
			})

			.when('/verify', {
				"controller": "VerifyCtrl",
				"templateUrl": "views/verify.partial.html"
			})

			.when('/timeline', {
				"controller": "FinanceCtrl",
				"templateUrl": "views/timeline.html"
			})
			.otherwise({
				"redirectTo": '/timeline'
			});
	}]);