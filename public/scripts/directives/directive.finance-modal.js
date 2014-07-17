/**
 * Created by vivaldi on 15/04/2014.
 */

'use strict';

angular.module('Savings.Directives')
	.directive('financeModal', function($timeout, $log, $timelineService) {
		return {
			restrict: "EA",
			require: "?ngModel",
			replace: true,
			templateUrl: 'views/template.finance-modal.html',
			link: function(scope, element, attrs, ngModelCtrl) {

				if (typeof attrs.initValue === 'string') {
					ngModelCtrl.$setViewValue(attrs.initValue);
				}

				$timeout(function(){
					scope.finance = ngModelCtrl.$modelValue;

				});
			}
		}
	});