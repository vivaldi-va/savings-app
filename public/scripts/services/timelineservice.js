/**
 * Created by vivaldi on 06/01/14.
 */

angular.module('Savings.Services')
	.factory('$timelineService', function($http, $q, $log) {
		function _getTimelineData(past) {
			$log.info('DEBUG: getTimeline');
			var dfd = $q.defer();
			var past = past || null;

			$http({
				url: '/api/timeline',
				method: 'get'
			})
				.success(function(data) {
					$log.info('DEBUG: getTimeline HTTP request received');

					if(!data.success) dfd.reject(data.error);
					if(!!data.success) dfd.resolve(data.data);
				})
				.error(function(reason) {
					$log.info('DEBUG: getTimeline HTTP request failed', reason);
					dfd.reject(reason);
				});

			return dfd.promise;
		}

		return {
			getTimeline: _getTimelineData
		}
	});