/**
 * Created by vivaldi on 27/12/13.
 */

'use strict';

angular.module('Savings.Services')
	.factory('$financeService', function($rootScope, $http, $q, $log, $cookies, ErrorService, SocketService) {

		function _createFinance(data, cb) {

			$log.debug('Savings.Services.FinanceService.createFinance()');

			SocketService.send('finance-add', {data: data});

			$rootScope.transport.on('finance-add--result', function(result) {

				if(result.error) {
					$log.warn("adding finance failed with error", result.error);

					cb(result.err);
				}

				if(result.data) {
					$log.info("Adding finance successful");
					$log.info(result.data);
					cb(null, result.data);
				}
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

			//socket.emit('finances');
			SocketService.send('finances');

			socket.on('finance', function(finance) {
				$log.info("got a finance via sockets", finance);

				$rootScope.finances[finance.type === 0 ? 'income' : 'expenses'].push(finance);
				$rootScope.$apply();
				$log.debug($rootScope.finances);
			});

		}

		function _modifyFinance(item, cb) {
			SocketService.send('finance-modify', {data: item});

			$rootScope.transport.on('finance-modified', function(msg) {
				if(msg.error) {
					$log.error('SOCKET', "Finance failed to be modified", msg.error);
					cb(msg.error);
				}

				if(msg.data) {
					cb(null, msg.data);
				}
			});
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
