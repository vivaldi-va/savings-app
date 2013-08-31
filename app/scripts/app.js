var savingsApp = angular.module('ostosNero', [])
	.config( function($routeProvider) {
		$routeProvider
			.when('/timeline', {
				templateUrl: 'views/timeline.html',
				controller: 'TimelineCtrl'
			})
			.when('/login', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.when('/register', {
				templateUrl: 'views/register.html',
				controller: 'RegisterCtrl'
			})
			.otherwise({
				redirectTo: '/timeline'
			})
	});
