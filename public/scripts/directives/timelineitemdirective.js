/**
 * Created by vivaldi on 15/04/2014.
 */

angular.module('Savings.Directives')
	.directive('timelineItem', function($timeout, $log, $timelineService) {
		return {
			restrict: "EA",
			require: "?ngModel",
			scope: {
				date: '@'
			},
			replace: true,
			templateUrl: 'views/timelineitemtemplate.html',
			link: function(scope, element, attrs, ngModelCtrl) {

				if (typeof attrs.initValue === 'string') {
					ngModelCtrl.$setViewValue(attrs.initValue);
				}

				$timeout(function(){
					scope.item = ngModelCtrl.$modelValue;
				});
				scope.updateItem = function() {
					$timelineService.updateItem(scope.item, attrs.date)
						.then(
						function(response) {
							$log.info('HTTP', "Update timeline item", response.data, response.status);
						},
						function(err) {
							$log.warn('HTTP', "Update timeline item failed", err.data, err.status);
						});
				};


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