/**
 * Created by vivaldi on 06/01/14.
 */

'use strict';

angular.module('Savings.Services')
	.factory('$timelineService', function($http, $q, $log, $rootScope, $cookies, $timeout, SocketService) {


		var _itemCache = [];

		function _addItemToTimeline(item) {

			var typeString = item.type === 0 ? 'income' : 'expenses';

			angular.forEach($rootScope.timeline.items, function(timelineSegment, key) {
				var segmentDate	= new Date(timelineSegment.attrs.date);
				var itemDate	= new Date(item.timeline_date);


				var dayMatches	=
					segmentDate.getDate() === itemDate.getDate() &&
					segmentDate.getMonth() === itemDate.getMonth() &&
					segmentDate.getYear() === itemDate.getYear();


				if(dayMatches) {
					for(var i = 0; i < timelineSegment.finances[typeString].length; i++) {
						if(timelineSegment.finances[typeString][i]._id === item._id) {
							$log.debug('cleaning item from timeline segment', timelineSegment.finances[typeString][i]._id, item._id);
							$rootScope.timeline.items[key].finances[typeString].splice(i, 1);
						}
					}
					// remove the timeline item from this segment if it exists
					// to account for the possibility it has been removed
					$log.debug('adding timeline item to segment');
					$rootScope.timeline.items[key].finances[typeString].push(item);
				}
			});

		}

		function _removeItemsFromTimeline(item) {
			var typeString = item.type === 0 ? 'income' : 'expenses';

			angular.forEach($rootScope.timeline.items, function(timelineSegment, key) {

				for(var i = 0; i < timelineSegment.finances[typeString].length; i++) {
					if(timelineSegment.finances[typeString][i]._id === item._id) {
						$log.debug('cleaning item from timeline segment', timelineSegment.finances[typeString][i]._id, item._id);
						$rootScope.timeline.items[key].finances[typeString].splice(i, 1);
					}
				}


			});
		}

		function _calcTimelineTotals() {
			var timeline		= $rootScope.timeline;
			var incomeTotal		= 0;
			var expenseTotal	= 0;
			var itemCount		= 0;
			var calculatedTotal	= 0;

			angular.forEach(timeline.items, function(segment) {
				var segmentDate = new Date(segment.attrs.date);
				if(segmentDate.getMonth() === new Date().getMonth()) {

					angular.forEach(segment.finances.income, function(item) {
						incomeTotal += item.amount;
						itemCount++;
					});

					angular.forEach(segment.finances.expenses, function(item) {
						expenseTotal += item.amount;
						itemCount++;
					});
				}
			});

			calculatedTotal = Math.abs(incomeTotal - expenseTotal);

			$rootScope.timeline.attrs.finance_sums.income = incomeTotal;
			$rootScope.timeline.attrs.finance_sums.expense = expenseTotal;
			$rootScope.timeline.attrs.finances_count = itemCount;
			$rootScope.timeline.attrs.timeline_balance.month = calculatedTotal;

		}

		function getEmptyTimeline(past) {
			$log.info('DEBUG: getTimeline');
			var dfd = $q.defer();
			var token = $rootScope.token || $cookies.saToken || null;
			past = past || null;

			if(!token) {
				dfd.reject('ERR_NOAUTH');
			} else {

				$http({
					url: '/api/timeline',
					method: 'get',
					headers: {'Authorization': token}
				})
					.success(function(data, status) {
						$log.info('DEBUG: getTimeline HTTP request received');
						if(status === 204) {
							dfd.resolve(null);
						} else {
							dfd.resolve(data);
						}

						$rootScope.timeline = data;

						SocketService.send('timeline');
					})
					.error(function(reason) {
						$log.info('DEBUG: getTimeline HTTP request failed', reason);
						dfd.reject(reason);
					});
			}

			return dfd.promise;
		}




		function updateTimelineItem(finance, date) {

			var data = {
				id: finance._id,
				amount: finance.amount,
				date: date
			};

			/*return $http({
				url: '/api/timeline/modify',
				method: 'PUT',
				data: data,
				headers: {'Authorization': $cookies.saToken}
			});*/

			SocketService.send('timeline-modify-item', {data: data});
		}




		// watchers for all finance events
		$rootScope.$watch('transport', function(newTransport) {
			if(newTransport && newTransport.connected) {

				var _transport = $rootScope.transport;

				_transport.on('timeline-item', function(msg) {
					$log.debug('SOCKET', "Got timeline item", msg.data);
					_addItemToTimeline(msg.data);
					_calcTimelineTotals();
				});

				_transport.on('timeline-complete', function() {
					$timeout(function(){
						$log.debug("Got timeline data");
						document.getElementById('timeline-scroll').scrollTop = document.getElementById('today').offsetTop-(window.innerHeight/2);
					});
				});

				_transport.on('finance-disabled', function(msg) {
					$log.debug('SOCKET', "Services.TimelineService:listeners", "finance-disabled")
					_removeItemsFromTimeline(msg.data);
				});
			}
		});

		return {
			getTimeline: getEmptyTimeline,
			updateItem: updateTimelineItem
		};
	});