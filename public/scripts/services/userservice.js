/**
 * Created by vivaldi on 23/02/14.
 */


angular.module('Savings.Services')
	.factory('$userService', function($http, $q, $log, $rootScope) {

		function _session() {
			var dfd = $q.defer();
			$http({
				url: '/api/user/session',
				method: 'get'
			})
				.success(function(data) {
					$rootScope.user = data.data;

					dfd.resolve();
				})
				.error(function(reason) {
					$log.warn('ERR:', "Getting user session failed", reason);
					dfd.reject(reason);
				});
			return dfd.promise;
		}

		function _login(email, password) {
			var dfd = $q.defer();

			var data = {
				"email": email,
				"password": password
			};

			$http({
				url: "/api/user/login",
				method: 'POST',
				data: data
			})
				.success(function(data) {
					$rootScope.logged_in = true;
					$rootScope.user = data.data;
					dfd.resolve(data.data);
				})
				.error(function(reason) {
					$log.warn('ERR', "user login failed", reason);
					dfd.reject(reason);
				});
			return dfd.promise;
		}

		function _register(email, password, username) {
			var dfd	= $q.defer();

			$log.debug([email, password, username]);

			// TODO: validate all this shit.
			var data = {
				"email": email,
				"password": password,
				"username": username
			};

			$http({
				url: '/api/user/register',
				method: 'POST',
				data: data
			})
				.success(function(data) {
					if(!data) {
						dfd.reject();
					}

					dfd.resolve(data);
				})
				.error(function(reason) {
					$log.warn('ERR', "user registration failed", reason);
					dfd.reject(reason);
				});

			return dfd.promise;
		}

		function _logout() {
			$http({
				url: '/api/user/logout',
				method: 'get'
			})
				.error(function(err) {
					$log.error('ERR', err);
				});
		}

		function _changeCurrencyFormat(currency) {
			var dfd = $q.defer();

			$http({
				"url": '/api/user/currency/' + currency,
				"method": 'put'
			})
				.success(function(status) {
					if(!status.success) dfd.reject(status.error);
					dfd.resolve();
				})
				.error(function(reason) {
					dfd.reject(reason);
				});

			return dfd.promise;
		}


		return {
			session: _session,
			login: _login,
			register: _register,
			logout: _logout
		}
	});