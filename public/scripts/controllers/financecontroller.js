/**
 * Created by vivaldi on 27/12/13.
 */

angular.module('Savings.Controllers')
	.controller('FinanceCtrl', ['$scope', '$financeService', '$log', function($scope, $financeService, $log) {


		$scope.errors = [];
		$scope.finances = {
			"income": [],
			"expenses": []
		};
		$scope.showNewIncomeForm = false;
		$scope.showNewExpenseForm = false;
		$scope.newFinance = {
			"income": {
				"name": null,
				"amount": null,
				"date": null,
				"interval": 'day',
				"description": ''
			},
			"expense": {
				"name": null,
				"amount": null,
				"date": null,
				"interval": 'day',
				"description": ''
			}
		};

		$scope.creatingNewFinance 	= false;
		$scope.showNewExpenseForm 	= false;
		$scope.openFinance 			= null;



		$financeService.getFinances.then(
			function(success) {
				$scope.finances = success;
			},
			function(reason) {
				$scope.errors.push(reason);
			}
		);



		$scope.doCreateFinance = function(type) {
			$scope.creatingNewFinance = true;



			var data = {
				"type": type,
				"name": type===0 ? $scope.newFinance.income.name : $scope.newFinance.expense.name,
				"amount": type===0 ? $scope.newFinance.income.amount : $scope.newFinance.expense.amount,
				"date":  type===0 ? $scope.newFinance.income.date : $scope.newFinance.expense.date,
				"interval":  type===0 ? $scope.newFinance.income.interval : $scope.newFinance.expense.interval,
				"description":  type===0 ? $scope.newFinance.income.description : $scope.newFinance.expense.description
			};
			$log.info('DEBUG: creating a finance item of type ' + type, data);



			$financeService.createFinance(data).then(
				function(success) {
					// create a new finance item based on the info supplied to the function
					// so as to avoid getting new data to update it
					$scope.creatingNewFinance = false;
					data.id = success.data.insertId;
					if(type===0) $scope.finances.income.push(data);
					if(type===1) $scope.finances.expenses.push(data);
					$log.info("DEBUG: inserting finance item", data);


				},
				function(reason) {
					$scope.creatingNewFinance = false;
					$scope.errors.push(reason);
				}
			);
		};

		$scope.doModifyFinanceItem = function(item) {
			$log.info("DEBUG: update finance item", item);
			item.updating = true;
			$financeService.modifyFinance(item).then(
				function(success) {
					item.updating = false;
					$log.info("DEBUG: modifying finance item successful");
				},
				function(reason) {
					item.updating = false;
					$scope.errors.push(reason);
				}
			);
		};

		$scope.doDisableFinance = function(finance) {


			//$log.info()
			$financeService.disableFinance(finance.id).then(
				function(success) {
					$log.info("DEBUG: disabling finance item successful");
					finance.disabled = true;
				},
				function(reason) {
					$scope.errors.push(reason);
				}
			);
			$log.info("DEBUG: disable finance item", finance);

		};

		$scope.doToggleNewIncomeForm = function() {
			$log.info('DEBUG: Toggle income form');
			$scope.showNewExpenseForm = false;
			$scope.openFinance = null;
			$scope.showNewIncomeForm = !$scope.showNewIncomeForm;
		};

		$scope.doToggleNewExpenseForm = function() {
			$log.info('DEBUG: Toggle expenses form');
			$scope.showNewIncomeForm = false;
			$scope.openFinance = null;
			$scope.showNewExpenseForm = !$scope.showNewExpenseForm;
		};

		$scope.doToggleFinanceForm = function(finance) {
			//finance.edit = !finance.edit;
			if(finance === $scope.openFinance) {
				$scope.openFinance = null;
			} else {
				$scope.openFinance = finance;
			}

			$log.info('DEBUG: Toggle expenses form', finance);
		};
	}]);
