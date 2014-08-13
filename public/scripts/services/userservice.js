/**
 * Created by vivaldi on 23/02/14.
 */


angular.module('Savings.Services')
	.factory('$userService', function($http, $q, $log, $rootScope, ErrorService) {

		function _session() {
			var dfd = $q.defer();
			$http({
				url: '/api/user/session',
				method: 'get'
			})
				.success(function(data) {
					$rootScope.user = data;

					dfd.resolve(data);
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
					$rootScope.user = data;
					dfd.resolve(data);
				})
				.error(function(reason) {
					$log.warn('ERR', "user login failed", reason);

					var errors = reason;
					if(typeof reason === 'object') {
						errors = ErrorService.messages(reason)
					} else if(reason === 'ERR_BAD_PASS') {
						errors = {
							'password': "Incorrect password"
						}
					} else if(reason === 'ERR_NO_USER') {
						errors = {
							'email': "Email not found"
						}
					}
					dfd.reject(errors);
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




		function _requestRecover(email) {
			$log.debug('UserService', 'Recovery request');
			var dfd = $q.defer();
			$http({
				url: '/api/user/passreset',
				method: 'post',
				data: {email: email}
			})
				.success(function(data, status) {
					dfd.resolve();
				})
				.error(function(err, status) {
					dfd.reject(err);
				});

			return dfd.promise;
		}


		function _validatePassResetToken(token) {
			var dfd = $q.defer();
			$http({
				url: '/api/user/passreset/' + token,
				method: 'get'
			})
				.success(function(data, status) {
					dfd.resolve();
				})
				.error(function(err, status) {
					dfd.reject(err);
				});

			return dfd.promise;
		}

		function _resetPass(token, password) {

			var dfd = $q.defer();

			$http({
				url: '/api/user/passreset/' + token,
				method: 'put',
				data: {password: password}
			})
				.success(function(data, status) {
					dfd.resolve();
				})
				.error(function(err, status) {

					if(typeof err === 'object') {
						dfd.reject(ErrorService.messages(err));
					} else {
						dfd.reject(err);
					}
				});

			return dfd.promise;
		}

		function _verifyRequest(token) {
			var dfd = $q.defer();

			$http({
				url: '/api/user/verify/' + token,
				method: 'put'
			})
				.success(function(data, status) {
					dfd.resolve();
				})
				.error(function(err, status) {

					if(typeof err === 'object') {
						dfd.reject(ErrorService.messages(err));
					} else {
						dfd.reject(err);
					}
				});

			return dfd.promise;
		}



		return {
			session: _session,
			login: _login,
			register: _register,
			logout: _logout,
			validateRecoverRequest: _validatePassResetToken,
			requestRecovery: _requestRecover,
			recover: _resetPass,
			verify: _verifyRequest
		};
	});