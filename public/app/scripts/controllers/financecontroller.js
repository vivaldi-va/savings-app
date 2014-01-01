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
				"interval": null,
				"description": null
			},
			"expense": {
				"name": null,
				"amount": null,
				"date": null,
				"interval": null,
				"description": null
			}
		};
		$scope.showNewExpenseForm = false;



		$financeService.getFinances.then(
			function(success) {
				$scope.finances = success;
			},
			function(reason) {
				$scope.errors.push(reason);
			}
		);



		$scope.doCreateFinance = function(type) {

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
					if(type===0) $scope.finances.income.push(data);
					if(type===1) $scope.finances.expenses.push(data);

				},
				function(reason) {
					$scope.errors.push(reason);
				}
			);
		};

		$scope.doModifyFinanceItem = function(item) {
			$log.info("DEBUG: update finance item", item);
			$financeService.modifyFinance(item).then(
				function(success) {
					$log.info("DEBUG: modifying finance item successful");
				},
				function(reason) {
					$scope.errors.push(reason);
				}
			);
		};

		$scope.doToggleNewIncomeForm = function() {
			$log.info('DEBUG: Toggle income form');
			$scope.showNewIncomeForm = !$scope.showNewIncomeForm;
		};

		$scope.doToggleNewExpenseForm = function() {
			$log.info('DEBUG: Toggle expenses form');
			$scope.showNewExpenseForm = !$scope.showNewExpenseForm;
		};

		$scope.doToggleFinanceForm = function(finance) {
			finance.edit = !finance.edit;
		};
	}]);
