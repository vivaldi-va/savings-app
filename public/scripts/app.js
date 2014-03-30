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
	.run(function($rootScope, $location, $log, $userService, $locale, $http) {
		$log.info('Locale:', $locale.id);


		$rootScope.logged_in 	= false;
		$rootScope.errors		= [];

		$log.debug('DEBUG:', "check route",$location.path() !== '/login' && $location.path() !== '/register');

		$log.debug('DEBUG:', "check for session");
		$userService.session().then(
			function(success) {

				$http.get('http://ipinfo.io/json')
					.success(function(data) {
						var countryCode = data.country.toLowerCase();

						$script('/bower_components/angular-i18n/angular-locale_' + countryCode, function() {
							$log.debug('DEBUG:', "Yey there's a session");
							$rootScope.logged_in = true;
							$location.path('/timeline');
						});
					});


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
			$log.info('ROUTE:', "Changing route to", next.$$route.originalPath);
			if(!$rootScope.logged_in && next.$$route.originalPath != '/login' && next.$$route.originalPath != '/register') {
				$location.path('/login');
			}
		});
	});

