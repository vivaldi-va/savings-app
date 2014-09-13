/**
 * Created by vivaldi on 27/12/13.
 */

'use strict';

angular.module('Savings.Services')
	.factory('$financeService', function($rootScope, $http, $q, $log, $cookies, ErrorService, SocketService) {

		function _createFinance(data, cb) {

			$log.debug('Savings.Services.FinanceService.createFinance()');

			$rootScope.transport.emit('add-finance', data);

			$rootScope.transport.on('add-finance--success', function(result) {

				if(!!result._id) {
					$log.info("Adding finance successful");
					$log.info(result);
					cb(null, result);
				}
			});

			$rootScope.transport.on('add-finance--error', function(err) {
				$log.warn("adding finance failed with error", err);
				cb(err);
			});
		}

		function _getFinances() {

			$log.debug('Savings.Services.FinanceService.getFinances()');
			var socket = $rootScope.transport;

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
