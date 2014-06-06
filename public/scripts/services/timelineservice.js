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
				.success(function(data, status) {
					$log.info('DEBUG: getTimeline HTTP request received');
					if(status === 204) {
						dfd.reject('ERR_NO_TIMELINE');
					} else {
						dfd.resolve(data);
					}
				})
				.error(function(reason) {
					$log.info('DEBUG: getTimeline HTTP request failed', reason);
					dfd.reject(reason);
				});

			return dfd.promise;
		}

		function _updateTimelineItem(finance, date) {

			var data = {
				id: finance.id,
				name: finance.name,
				amount: finance.amount,
				type: finance.type,
				interval: finance.interval,
				duedate: finance.duedate,
				description: finance.description,
				disabled: finance.disabled,
				interval_dates: finance.interval_dates,
				date: date
			};

			return $http({
				url: '/api/timeline/update',
				method: 'post',
				data: data
			});
		}

		return {
			getTimeline: _getTimelineData(),
			updateItem: _updateTimelineItem
		}
	});