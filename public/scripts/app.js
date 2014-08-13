'use strict';
angular.module('Savings.Config', ['ngRoute']);
angular.module('Savings.Services', ['ngCookies']);
angular.module('Savings.Directives', ['ngQuickDate']);
angular.module('Savings.Controllers', []);
angular.module('Savings.Filters', []);

angular.module('Savings', [
		'Savings.Config',
		'Savings.Services',
		'Savings.Directives',
		'Savings.Controllers',
		'Savings.Filters'
	])
	.run(function($rootScope, $location, $log, $userService, $locale, $timeout, $http, $cookies) {
		$log.info('Locale:', $locale.id);


		$rootScope.logged_in	= false;
		$rootScope.errors		= [];
		$rootScope.timeline	= null;
		$rootScope.assistance	= true;
		$rootScope.finances	= {
			"income": [],
			"expenses": []
		};

		$log.debug('DEBUG:', "check route", $location.path() !== '/login' && $location.path() !== '/register');

		$log.debug('DEBUG:', "check for session");

		function _trueLogin() {
			$log.debug('DEBUG:', "Yey there's a session");
			$rootScope.logged_in = true;
			$timeout(function() {
				$log.info('Locale:', $locale.id);
				$location.path('/timeline');
			});
		}


		$userService.session().then(
			function(success) {

				if(!success.attrs.assistance) {
					$rootScope.assistance = false;
				}

				if(!window.localStorage.locale || success.attrs.i18n_code) {
					$http.get('http://ipinfo.io/json')
						.success(function(data) {
							var countryCode = data.country.toLowerCase();
							window.localStorage.setItem('locale', countryCode);

							$log.debug('DEBUG:', "country code", countryCode);
							$log.debug('DEBUG:', "country script", '/bower_components/angular-i18n/angular-locale_' + countryCode + '.js');
							$log.debug('DEBUG:', "Loaded locale script");
							_trueLogin();
						});
				} else {
					$timeout(function() {
						_trueLogin();
					});
				}
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
			if(!$rootScope.logged_in &&
				next.$$route.originalPath !== '/login' &&
				next.$$route.originalPath !== '/register'&&
				!next.$$route.originalPath.match(/\/passreset(\/[a-zA-Z0-9]+)?/) &&
				!next.$$route.originalPath.match(/\/verify(\/[a-zA-Z0-9]+)?/))
			{

				$location.path('/login');
			}
		});
	});

