/**
 * Created by vivaldi on 15/04/2014.
 */

'use strict';

angular.module('Savings.Directives')
	.directive('financeModal', function($timeout, $log, $timelineService, $document) {
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


				scope.hideModal = function() {
					scope.active = false;
					$log.info(scope.active);
				};





				//scope.finance = ngModelCtrl.$modelValue;


				$log.info('Finance Modal', scope.finance);
				$timeout(function(){

				});
			}
		};
	});