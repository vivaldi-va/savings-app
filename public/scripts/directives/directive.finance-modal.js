/**
 * Created by vivaldi on 15/04/2014.
 */

'use strict';

angular.module('Savings.Directives')
	.directive('financeModal', function($timeout, $log, $timelineService, $document, $rootScope) {
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


			}
		};
	});