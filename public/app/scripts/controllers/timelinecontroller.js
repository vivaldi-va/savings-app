'use strict';

angular.module('Savings.Controllers')
	.controller('TimelineCtrl', ['$scope', '$rootScope', '$log', '$timelineService', function ($scope, $rootScope, $log, $timelineService) {
		$log.info("DEBUG: Timeline controller");

		// reset errors and successes
		$rootScope.errors = [];
		$rootScope.successes = [];

		$scope.timeline = null;

		$timelineService.getTimeline.then(
			function(success) {
				$rootScope.successes.push("timeline synced");
				$log.info("DEBUG: Timeline data received");
				$scope.timeline = success;
			},
			function(reason) {
				$log.info("DEBUG: error getting timeline data", reason);
				$rootScope.errors.push(reason);
			}
		);

	}]);


