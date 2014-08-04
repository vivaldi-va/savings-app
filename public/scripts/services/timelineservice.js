/**
 * Created by vivaldi on 06/01/14.
 */

angular.module('Savings.Services')
	.factory('$timelineService', function($http, $q, $log, $rootScope) {
		function _getTimelineData(past) {
			$log.info('DEBUG: getTimeline');
			var dfd = $q.defer();
			past = past || null;

			$http({
				url: '/api/timeline',
				method: 'get'
			})
				.success(function(data, status) {
					$log.info('DEBUG: getTimeline HTTP request received');
					if(status === 204) {
						dfd.resolve(null);
					} else {
						dfd.resolve(data);
					}

					$rootScope.timeline = data;
				})
				.error(function(reason) {
					$log.info('DEBUG: getTimeline HTTP request failed', reason);
					dfd.reject(reason);
				});

			return dfd.promise;
		}

		function _updateTimelineItem(finance, date) {

			var data = {
				id: finance._id,
				amount: finance.amount,
				date: date
			};

			return $http({
				url: '/api/timeline/modify',
				method: 'PUT',
				data: data
			});
		}

		return {
			getTimeline: _getTimelineData,
			updateItem: _updateTimelineItem
		}
	});