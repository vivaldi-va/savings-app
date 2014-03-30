'use strict';

angular.module('Savings.Controllers')
	.controller('TimelineCtrl', ['$scope', '$rootScope', '$log', '$location', '$anchorScroll', '$timeout', '$timelineService', function ($scope, $rootScope, $log, $location, $anchorScroll, $timeout, $timelineService) {
		$log.info("DEBUG: Timeline controller");

		// reset errors and successes
		$rootScope.errors		= [];
		$rootScope.successes	= [];
		$scope.timeline			= null;
		$scope.timelineBalance = false;

		$timelineService.getTimeline.then(
			function(success) {
				$rootScope.successes.push("timeline synced");
				$log.info("DEBUG: Timeline data received");

				$scope.timeline = success;
				$scope.timelineBalance = Math.abs(success.attrs.finance_sums.income - success.attrs.finance_sums.expense);
				$timeout(function(){
					$location.hash('today');
					$anchorScroll();

				});

			},
			function(reason) {
				$log.info("DEBUG: error getting timeline data", reason);
				$rootScope.errors.push(reason);
			}
		);

	}]);


