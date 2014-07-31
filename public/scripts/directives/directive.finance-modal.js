/**
 * Created by vivaldi on 15/04/2014.
 */

'use strict';

angular.module('Savings.Directives')
	.directive('financeModal', function($timeout, $log, $financeService, $document, $rootScope) {
		return {
			restrict: "EA",
			require: "?ngModel",
			scope: {
				"finance": "=finance",
				"active": "=active"
			},
			replace: true,
			templateUrl: 'views/template.finance-modal.html',
			link: function(scope, element, attrs, ngModelCtrl) {


				element.on('click', function(e) {
					$log.info('dont close when you click the modal');
					e.stopPropagation();
				});

				// Bind to the document click event.

				/*$document.on("click", function (event) {
					$log.info('Is the finance modal active?', scope.finance.active);
					if(scope.finance.active) {
						$log.info("Finance is open, so close it");
						scope.$apply(function() {
							_hideModal();
						});
					}
				});*/




				scope.hideModal = function() {
					_hideModal();
				};

				function _hideModal() {

					scope.finance['active'] = false;
					$log.info("hide modal", scope.finance);
					/*scope.$apply(function() {
					});*/
				}

				scope.submit = function() {
					if(!scope.finance._id) {
						_createNewFinance();
					} else {
						_modifyFinance();
					}
				};

				function _createNewFinance() {
					$financeService.createFinance(data)
						.then(
						function(success) {
							// create a new finance item based on the info supplied to the function
							// so as to avoid getting new data to update it
							scope.creatingNewFinance	= false;
							scope.showNewIncomeForm		= false;
							scope.showNewExpenseForm	= false;
							data.id						= success._id;

							if(type===0) {
								$rootScope.finances.income.push(data);
							}

							if(type===1) {
								$rootScope.finances.expenses.push(data);
							}

							$log.info("DEBUG: inserting finance item", data);

						},
						function(reason) {
							scope.creatingNewFinance = false;
							scope.errors.push(reason);
						}
					);
				}

				function _modifyFinance() {
					scope.updating = true;
					$financeService
						.modifyFinance(scope.finance)
						.then(
							function (success) {
								scope.updating = false;
								$log.info("DEBUG: modifying finance item successful");
							},
							function (reason) {
								scope.updating = false;
								scope.errors.push(reason);
							}
						);
				}


			}
		};
	});