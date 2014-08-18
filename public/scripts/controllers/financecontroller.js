/**
 * Created by vivaldi on 27/12/13.
 */

angular.module('Savings.Controllers')
	.controller('FinanceCtrl', ['$scope', '$rootScope', '$financeService', '$log', '$timeout', '$locale', 'AssistanceService', function($scope, $rootScope, $financeService, $log, $timeout, $locale, AssistanceService) {


		$scope.errors = [];

		$scope.showNewIncomeForm	= false;
		$scope.showNewExpenseForm	= false;
		$scope.creatingNewFinance 	= false;
		$scope.openFinance 			= null;

		$scope.newFinance = {
			"income": {
				"name": null,
				"amount": null,
				"date": null,
				"interval": 0,
				"description": ''
			},
			"expense": {
				"name": null,
				"amount": null,
				"date": null,
				"interval": 0,
				"description": ''
			}
		};

		$scope.activeFinance = {
			"active": false,
			"type": 0,
			"name": null,
			"amount": null,
			"date": null,
			"interval": 0,
			"description": ''
		};

		$scope.financeModalActive = false;

		$scope.currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
		$log.info('Currency Symbol', $locale.NUMBER_FORMATS.CURRENCY_SYM);



		$financeService.getFinances
			.then(
				function(success) {
					$rootScope.finances = success;
				},
				function(reason) {
					$scope.errors.push(reason);
				}
			);




		$scope.doOpenEditFinanceModal = function(finance) {
			$log.info('Open edit finance modal', finance);
			$scope.activeFinance = finance;
			$scope.activeFinance.active = true;
			$log.info("is modal active?", $scope.activeFinance.active);

		};

		$scope.doToggleNewFinanceModal = function(type) {

			if($scope.activeFinance.active) {
				$scope.activeFinance.active = false;
			} else {
				$scope.activeFinance = {
					"active": true,
					"type": type,
					"name": null,
					"amount": null,
					"date": null,
					"interval": 0,
					"description": ''
				};
			}
		};

		$scope.$on('$viewContentLoaded', function() {
		});


		var columnsLoaded = 0;
		$scope.$on('$includeContentLoaded', function(event) {
			console.log(event);
			columnsLoaded++;
			if(columnsLoaded === 2) {
				$timeout(function() {
					AssistanceService.start();
				});
			}
		});


		$scope.$watch('activeFinance', function(oldVal, newVal) {
			$log.info('FinanceCtrl', "is modal active?", oldVal, newVal);
		});

	}]);
