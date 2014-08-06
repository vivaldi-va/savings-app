/**
 * Created by vivaldi on 15/04/2014.
 */

'use strict';

angular.module('Savings.Directives')
	.directive('financeModal', function($timeout, $log, $financeService, $document, $rootScope, $timelineService) {
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

				scope.errors = false;

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

					$log.debug('Finances', $rootScope.finances);
				};

				function _hideModal() {

					scope.finance['active'] = false;
					$log.info("hide modal", scope.finance);
					/*scope.$apply(function() {
					});*/
				}

				scope.submit = function() {
					scope.errors = false; // reset errors on each try

					if(!scope.finance._id) {
						_createNewFinance();
					} else {
						_modifyFinance();
					}

						/*.then(function(success) {
							$rootScope.timeline = success;
						});*/

				};


				function _createNewFinance() {
					$financeService.createFinance(scope.finance)
						.then(
						function(success) {
							// create a new finance item based on the info supplied to the function
							// so as to avoid getting new data to update it
							scope.creatingNewFinance	= false;
							scope.showNewIncomeForm		= false;
							scope.showNewExpenseForm	= false;
							scope.finance['_id']		= success._id;

							if(success.type===0) {
								$rootScope.finances.income.push(scope.finance);
							}

							if(success.type===1) {
								$rootScope.finances.expenses.push(scope.finance);
							}

							_hideModal();

							$timelineService.getTimeline();
							$log.info("DEBUG: inserting finance item", scope.finance);

						},
						function(reason) {
							scope.creatingNewFinance = false;
							scope.errors = reason;
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
								_hideModal();

								$timelineService.getTimeline();
								$log.info("DEBUG: modifying finance item successful");
							},
							function (reason) {
								scope.updating = false;
								scope.errors.push(reason);
							}
						);
				}


				scope.doDisableFinance = function(finance) {


					//$log.info()
					$financeService.disableFinance(finance._id)
						.then(
						function(success) {
							$log.info("DEBUG: disabling finance item successful");
							finance.disabled = true;
							_hideModal();
						},
						function(reason) {
							scope.errors.push(reason);
						}
					);
					$log.debug("DEBUG: disable finance item", finance);

				};


			}
		};
	});