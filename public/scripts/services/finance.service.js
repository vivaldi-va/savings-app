/**
 * Created by vivaldi on 27/12/13.
 */

'use strict';

angular.module('Savings.Services')
	.factory('$financeService', function($rootScope, $http, $q, $log, $cookies, ErrorService, SocketService) {


		/**
		 * Splice an item from the relevant array in the finances object
		 * which is in the rootScope
		 *
		 * @param id - ID of the finance
		 * @private
		 */
		function _removeFromFinancesArray(id) {
			var i = 0;
			var hasRemoved = false;

			for(i = 0; i <= $rootScope.finances.income.length; i++) {
				if($rootScope.finances.income[i]._id === id) {
					$rootScope.finances.income.splice(i, 1);
					hasRemoved = true;
				}
			}

			if(!hasRemoved) {
				for(i = 0; i <= $rootScope.finances.income.expenses; i++) {
					if($rootScope.finances.expenses[i]._id === id) {
						$rootScope.finances.expenses.splice(i, 1);
					}
				}
			}
		}


		function _createFinance(data, cb) {

			$log.debug('Savings.Services.FinanceService.createFinance()');

			SocketService.send('finance-add', {data: data});

			$rootScope.transport.on('finance-added', function(result) {

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

		}

		function _modifyFinance(item, cb) {
			SocketService.send('finance-modify', {data: item});

		}


		function _disableFinance(id) {
			SocketService.send('finance-disable', {data: {_id: id}});
		}

		// watchers for all finance events
		$rootScope.$watch('transport', function(newTransport) {
			if(newTransport && newTransport.connected) {

				var _transport = $rootScope.transport;

				_transport.on('finance', function(finance) {
					$log.info("got a finance via sockets", finance);

					$rootScope.finances[finance.type === 0 ? 'income' : 'expenses'].push(finance);
					//$rootScope.$apply();
					$log.debug($rootScope.finances);
				});

				_transport.on('finance-modified', function(msg) {
					if(msg.error) {
						$log.error('SOCKET', "Finance failed to be modified", msg.error);
						// TODO: global error
					}

					if(msg.data) {
						$log.debug('SOCKET', msg.data);
						var typeString = msg.data.type === 0 ? 'income' : 'expenses';
						for(var i=0; i<$rootScope.finances[typeString].length; i++) {
							if(msg.data._id === $rootScope.finances[typeString][i]._id) {

								$rootScope.finances[typeString][i] = msg.data;
							}
						}
					}
				});

				_transport.on('finance-disabled', function(msg) {
					if(msg.error) {
						$log.error(msg.error);
					} else {
						_removeFromFinancesArray(msg.data._id);
					}
				});
			}
		});


		return {
			createFinance: _createFinance,
			getFinances: _getFinances,
			modifyFinance: _modifyFinance,
			disableFinance: _disableFinance
		};
	});
