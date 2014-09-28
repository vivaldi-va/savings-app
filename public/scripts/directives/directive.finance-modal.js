/**
 * Created by vivaldi on 15/04/2014.
 */

'use strict';

angular.module('Savings.Directives')
	.directive('financeModal', function($timeout, $log, $financeService, $document, $rootScope, $timelineService) {
		return {
			restrict: "EA",
			/*scope: {
				"finance": "="
			},*/
			replace: true,
			templateUrl: 'views/finance-modal.template.html',
			link: function(scope, element, attrs, ngModelCtrl) {

				var originalFinanceState = {};



				function _saveState() {
					angular.forEach(scope.activeFinance, function(val, param) {
						originalFinanceState[param] = scope.activeFinance[param];
					});
				}

				function _resetToOriginalState() {
					$log.debug('modified', scope.activeFinance);
					$log.debug('original state', originalFinanceState);


					angular.forEach(scope.activeFinance, function (val, property) {
						scope.activeFinance[property] = originalFinanceState[property];

					});

				}


				function _hideModal() {

					scope.activeFinance['active'] = false;
				}

				function _createNewFinance() {
					$log.debug('Savings.Directives.FinanceModal.createNewFinance()');

					$log.debug(scope.activeFinance);
					$financeService.createFinance(scope.activeFinance, function(err, result) {



						if(err) {
							scope.creatingNewFinance = false;
							scope.errors = err;
						} /*else {


							// create a new finance item based on the info supplied to the function
							// so as to avoid getting new data to update it
							scope.creatingNewFinance	= false;
							scope.showNewIncomeForm		= false;
							scope.showNewExpenseForm	= false;
							scope.activeFinance['_id']	= result._id;

							// create the finances object in rootscope if it
							// doesnt exist already
							if(!$rootScope.finances) {
								$rootScope.finances	= {
									"income": [],
									"expenses": []
								};
							}

							if(result.type===0) {
								$rootScope.finances.income.push(scope.activeFinance);
							}

							if(result.type===1) {
								$rootScope.finances.expenses.push(scope.activeFinance);
							}
							//$timelineService.getTimeline();
							$log.info("DEBUG: inserting finance item", scope.activeFinance);
						}*/
					});
					_hideModal();
					//var typeString = msg.data.type === 0 ? 'income' : 'expenses';
					//$rootScope.finances[typeString].push(scope.)
				}

				function _modifyFinance() {
					scope.updating = true;
					$financeService
						.modifyFinance(scope.activeFinance, function(err, finance) {
							if(err) {
								scope.updating = false;
								scope.errors.push(err);
							}
							/*
							if(finance) {
								scope.updating = false;

								$timelineService.getTimeline();
								$log.info("DEBUG: modifying finance item successful");
							}*/
						});
						_saveState();
						_hideModal();

				}


				scope.$watch('activeFinance', function(newVal, oldVal) {

					// save finance state when opening fresh modal
					if(newVal && newVal.active && newVal!==oldVal) {

						_saveState();
					}
				});

				scope.errors = false;

				element.on('click', function(e) {
					$log.info('dont close when you click the modal');
					e.stopPropagation();
				});

				$document.on('click', function(e) {
					$log.info('Clicked outside the modal');

				});

				// TODO: close modal on clicking outside of it.




				scope.hideModal = function(cancel) {
					cancel = cancel || false;

					if(cancel) {
						_resetToOriginalState();
					}

					_hideModal();

				};

				scope.submit = function() {
					scope.errors = false; // reset errors on each try

					if(!scope.activeFinance._id) {
						mixpanel.track("Created a new finance", {
							"interval": scope.activeFinance.interval,
							"created": new Date(),
							"type": scope.activeFinance.type === 0 ? "income" : "expense",
							"has_description": !!scope.activeFinance.description

						});
						_createNewFinance();
					} else {
						mixpanel.track("Modified a finance",
							{
								"id": scope.activeFinance._id,
								"timestamp": new Date()
							});
						_modifyFinance();
					}

				};


				scope.doDisableFinance = function(finance) {

					mixpanel.track("Disabled a finance",
						{
							"id": scope.activeFinance._id,
							"timestamp": new Date()
						});


					$financeService.disableFinance(finance._id);

					_hideModal();

					$log.debug("DEBUG: disable finance item", finance);

				};


			}
		};
	});