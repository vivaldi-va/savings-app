'use strict';
angular.module('Savings.Config', []);
angular.module('Savings.Services', []);
angular.module('Savings.Controllers', []);
angular.module('Savings.Filters', []);

angular.module('Savings', [
		'ngRoute',
		'Savings.Config',
		'Savings.Services',
		'Savings.Controllers',
		'Savings.Filters'
	])
	.run(function($rootScope, $location, $log, $userService) {
		$rootScope.logged_in 	= false;
		$rootScope.errors		= [];

		$log.debug('DEBUG:', "check route",$location.path() !== '/login' && $location.path() !== '/register');

		$log.debug('DEBUG:', "check for session");
		$userService.session().then(
			function(success) {
				$log.debug('DEBUG:', "Yey there's a session");
				$location.path('/timeline');
				$rootScope.logged_in = true;

			},
			function(reason) {
				$log.debug('DEBUG:', "No session :c");
				$rootScope.errors.push(reason);
				$location.path('/login');
				$rootScope.logged_in = false;
			});

	})
	.run(function($rootScope, $location, $log) {
		$rootScope.$on('$routeChangeStart', function(e, next, current) {

			if(!$rootScope.logged_in && next.$$route.originalPath != '/login' && next.$$route.originalPath != '/register') {
				$location.path('/login');
			}
		});
	});

