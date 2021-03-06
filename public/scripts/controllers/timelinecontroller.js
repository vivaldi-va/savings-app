'use strict';

angular.module('Savings.Controllers')
	.controller('TimelineCtrl', ['$scope', '$rootScope', '$log', '$location', '$anchorScroll', '$timeout', '$timelineService', function ($scope, $rootScope, $log, $location, $anchorScroll, $timeout, $timelineService) {
		$log.info("DEBUG: Timeline controller");

		// reset errors and successes
		$rootScope.errors		= [];
		$rootScope.successes	= [];
		$scope.timelineBalance	= false;



		$timelineService.getTimeline()
			.then(
				function(success) {
					$rootScope.successes.push("timeline synced");
					$log.info("DEBUG: Timeline data received");

					//$scope.timeline = success;
					//$scope.timelineBalance = Math.abs(success.attrs.finance_sums.income - success.attrs.finance_sums.expense);
					//$scope.timelineBalance = Math.abs($scope.timeline.attrs.finance_sums.income - $scope.timeline.attrs.finance_sums.expense);


				},
				function(reason) {
					$log.info("DEBUG: error getting timeline data", reason);
					$rootScope.errors.push(reason);
				}
			);


		$rootScope.$watch('timeline', function() {
			$log.debug("timeline changed");
			if(!!$rootScope.timeline) {
				$scope.timelineBalance = Math.abs($scope.timeline.attrs.finance_sums.income - $scope.timeline.attrs.finance_sums.expense);
			}
		});


	}]);


