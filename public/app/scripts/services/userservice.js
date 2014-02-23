/**
 * Created by vivaldi on 23/02/14.
 */


angular.module('Savings.Services')
	.factory('$userService', function($http, $q, $log) {

		function _session() {
			var dfd = $q.defer();
			$http({
				url: '/api/user/session',
				method: 'get'
			})
				.success(function(data) {
					if(!data.success) {
						dfd.reject(data.error);
					}

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
			return dfd.promise;
		}

		function _register(email, password, username) {
			var dfd 	= $q.defer();

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
					if(!data.success) {
						dfd.reject(data.error);
					}

					dfd.resolve(data.data);
				})
				.error(function(reason) {
					$log.warn('ERR', "user registration failed", reason);
					dfd.reject(reason);
				});

			return dfd.promise;
		}


		return {
			session: _session,
			login: _login,
			register: _register
		}
	});