/**
 * Created by vivaldi on 15/04/2014.
 */

angular.module('Savings.Directives')
	.directive('timelineItem', function($timeout, $log) {
		return {
			restrict: "EA",
			require: "?ngModel",
			scope: {
				dateFilter: '=?',
				onChange: "&",
				required: '@'
			},
			replace: true,
			templateUrl: 'views/timelineitemtemplate.html',
			link: function(scope, element, attrs, ngModelCtrl) {

				if (typeof attrs.initValue === 'string') {
					ngModelCtrl.$setViewValue(attrs.initValue);
				}
				$timeout(function(){
					$log.info('Timeline item directive', "model value", ngModelCtrl.$modelValue);
					$log.info('Timeline item directive', "scope value", scope);
					scope.item = ngModelCtrl.$modelValue;
				});

				var datePickerDrop = new Drop({
					target: angular.element(element)[0],
					content: angular.element(element[0].querySelector(".timelineItem--editForm"))[0],
					position: 'bottom center',
					openOn: 'click',
					classes: 'drop-theme-arrows-bounce',
					tetherOptions: {
						attachment: 'top center',
						targetAttachment: 'bottom center',
						constraints: [
							{
								to: 'scrollParent',
								attachment: 'together none'
							}
						]
					}
				});
			}
		}
	});