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

		function _calculateFinanceTotals() {

			$log.debug("Savings.Services.FinanceSevice.calculateFinanceTotals()");
			var finances = $rootScope.finances;

			var incomeTotal		= 0;
			var incomeCount		= 0;
			var expensesTotal	= 0;
			var expensesCount	= 0;

			angular.forEach(finances.income, function(finance) {
				if(finance.interval <= 744) {
					var mult = 1;

					if(finance.interval === 24*7) {
						mult = 4;
					} else if(finance.interval === 24*14) {
						mult = 2;
					}

					incomeTotal += finance.amount * mult;
				}
				incomeCount++;
			});

			angular.forEach(finances.expenses, function(finance) {
				if(finance.interval <= 744) {
					var mult = 1;

					if(finance.interval === 24*7) {
						mult = 4;
					} else if(finance.interval === 24*14) {
						mult = 2;
					}

					expensesTotal += finance.amount * mult;
				}
				expensesCount++;
			});

			$rootScope.finances.attrs.income_sum		= incomeTotal;
			$rootScope.finances.attrs.income_count		= incomeCount;
			$rootScope.finances.attrs.expenses_sum		= expensesTotal;
			$rootScope.finances.attrs.expenses_count	= expensesCount;
		}


		function createFinance(data, cb) {

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

		function getFinances() {

			$log.debug('Savings.Services.FinanceService.getFinances()');
			var socket = $rootScope.transport;

			// reset finances object, to avoid having the same finances
			// repeated over and over
			$rootScope.finances = {
				"income": [],
				"expenses": [],
				"attrs": {
					"income_sum": 0,
					"income_count": 0,
					"expenses_sum": 0,
					"expenses_count": 0
				}
			};

			//socket.emit('finances');
			SocketService.send('finances');

		}

		function modifyFinance(item, cb) {
			SocketService.send('finance-modify', {data: item});
			_calculateFinanceTotals();
		}


		function disableFinance(id) {
			SocketService.send('finance-disable', {data: {_id: id}});
			_calculateFinanceTotals();
		}

		// watchers for all finance events
		$rootScope.$watch('transport', function(newTransport) {
			if(newTransport && newTransport.connected) {

				var _transport = $rootScope.transport;

				_transport.on('finance', function(finance) {
					$log.info("got a finance via sockets", finance);

					$rootScope.finances[finance.type === 0 ? 'income' : 'expenses'].push(finance);
					_calculateFinanceTotals();
				});

				_transport.on('finance-modified', function(msg) {
					if(msg.error) {
						$log.error('SOCKET', "Finance failed to be modified", msg.error);

					}

					if(msg.data) {
						$log.debug('SOCKET', msg.data);
						var typeString = msg.data.type === 0 ? 'income' : 'expenses';
						for(var i=0; i<$rootScope.finances[typeString].length; i++) {
							if(msg.data._id === $rootScope.finances[typeString][i]._id) {
								$rootScope.finances[typeString][i] = msg.data;
								_calculateFinanceTotals();
							}
						}
					}
				});

				_transport.on('finance-disabled', function(msg) {
					if(msg.error) {
						$log.error(msg.error);
					} else {
						_removeFromFinancesArray(msg.data._id);
						_calculateFinanceTotals();
					}
				});
			}
		});


		return {
			createFinance: createFinance,
			getFinances: getFinances,
			modifyFinance: modifyFinance,
			disableFinance: disableFinance
		};
	});
