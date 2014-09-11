/**
 * Created by vivaldi on 27/12/13.
 */

'use strict';

angular.module('Savings.Services')
	.factory('$financeService', function($rootScope, $http, $q, $log, $cookies, ErrorService) {

		function _createFinance(data) {
			var dfd = $q.defer();

			$http({
				url: '/api/finances',
				method: 'post',
				data: data,
				headers: {'Authorization': $cookies.saToken}
			})
				.success(function(status) {
					$log.info("DEBUG: create finance ", status);
					dfd.resolve(status);
				})
				.error(function(reason, status) {

					if(status===400) {
						dfd.reject(ErrorService.messages(reason));
					} else {
						dfd.reject(reason);
					}
				});
			return dfd.promise;
		}

		function _getFinances() {
			$log.debug('get finances');


			var socket = io('/finances');

			// reset finances object, to avoid having the same finances
			// repeated over and over
			$rootScope.finances = {
				"income": [],
				"expenses": []
			};



			socket.emit('finances');

			socket.on('finance', function(finance) {
				$log.info("got a finance via sockets", finance);

				$rootScope.finances[finance.type === 0 ? 'income' : 'expenses'].push(finance);
				$rootScope.$apply();
				$log.debug($rootScope.finances);
			});

		}

		function _modifyFinance(item) {
			var dfd = $q.defer();

			$http({
				url: '/api/finances/' + item._id,
				method: 'put',
				data: item,
				headers: {'Authorization': $cookies.saToken}
			})
				.success(function(status) {
					$log.info('DEBUG: finance item modified');
					dfd.resolve();
				})
				.error(
					function(reason) {
						$log.warn('ERROR: finance item modification failed ', reason);
						dfd.reject(reason);
					}
				);

			return dfd.promise;
		}
		function _disableFinance(id) {
			var dfd = $q.defer();

			$http({
				url: '/api/finances/' + id,
				method: 'delete',
				headers: {'Authorization': $cookies.saToken}
			})
				.success(function(status) {
					$log.info('DEBUG: finance item disabled');
				})
				.error(
					function(reason) {
						$log.warn('ERROR: finance item failed to be disabled ', reason);
						dfd.reject(reason);
					}
				);

			return dfd.promise;
		}

		return {
			createFinance: _createFinance,
			getFinances: _getFinances,
			modifyFinance: _modifyFinance,
			disableFinance: _disableFinance
		};
	});
