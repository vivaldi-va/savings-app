/**
 * Created by vivaldi on 01/01/14.
 */

module.exports.set = function(app, db) {

	var log		= require('npmlog');
	var q		= require('q');
	var moment	= require('moment');
	moment.lang('en-gb');


	/**
	 * Return the number of days in the specified month of the year
	 * Including calculating a leapyear hopefully
	 *
	 * @param month
	 * @returns number of days
	 * @private
	 */
	function _getDaysInMonth(month) {

		function _getFebDays() {
			var days = 28;
			var year = new Date().getFullYear();

			if(year % 4 === 0 && year % 100 !== 0) {
				days = 29;
			}

			return days;
		}

		var months = {
			"1": 31,
			"2": _getFebDays(),
			"3": 31,
			"4": 30,
			"5": 31,
			"6": 30,
			"7": 31,
			"8": 31,
			"9": 30,
			"10": 31,
			"11": 30,
			"12": 31
		};


		return months.month;
	}


	/**
	 * Get finance data from database and return it using
	 * deferred promises
	 *
	 * TODO: integrate user accounts
	 *
	 * @returns {promise} database result
	 * @private
	 */
	function _getFinances() {
		var dfd = q.defer();

		db.query('SELECT `id`, `name`, `amount`, `duedate`, `type`, `interval`, `description` FROM finances WHERE userid = 1 AND active = 1',
			function(err, result) {
				if(err) {
					dfd.reject(err);
				}

				if(!result) {
					dfd.reject("no finances found");
				} else {
					log.info('QUERY', "getting finances successful");

					dfd.resolve(result);
				}
			});

		return dfd.promise;
	}


	/**
	 * parse the timeline data and parse it into a usable json string
	 * for use in formatting the timeline
	 *
	 * @param data
	 * @returns {Array}
	 * @private
	 */
	function _createTimelineData(data, past) {

		var timeline = [];
		var d = new Date();
		//var day = d.getDate();

		var past = past || 2;
		var future = 2;


		var start = moment().subtract('months', past);
		var end = moment().add('months', future);

		log.info('Debug', "moment.js 2 months ago", start.calendar());
		log.info('Debug', "moment.js 2 months in the future", end.calendar());
		log.info('Debug', "time looping, past is before future", start < end);
		log.info('Debug', "date comparison", moment('02/01/2014').isSame(moment('02/01/2014')));
		// for each month
		// get number of days
		// 	- for each day
		//		+ loop through finances
		//		+ check the interval
		//		+ if there's no interval or if interval < 30 and duedate matches -> push item to array
		//		+ if interval(days)%30 = 0, add finance to the due date closest to previous date + interval



		var _calcFirstDate = function(finance, interval, intervalCount) {
			var firstDate = null;
			log.info('Debug', "finance due date", moment(finance.duedate).format('L'));
			log.info('Debug', "finance start date", start.format('L'));
			for(var due = moment(finance.duedate); due.isAfter(start); due.subtract(interval, intervalCount)) {
				log.info('Debug', "iterating to find first date", due.format('L'));
				firstDate = due;
			}

			return firstDate;
		};

		var _calcFinanceDates = function(startDate, interval, intervalCount) {
			var financeDates = [];
			for(startDate;startDate.isBefore(end);startDate.add(interval, intervalCount)) {
				financeDates.push(startDate.format('L'));
			}
			return financeDates;
		};

		for(var f in data) {

			log.info('Debug', "calculating intervals");
			data[f].interval_dates = [];

			switch(data[f].interval) {
				case 'day':

					var firstDate = _calcFirstDate(data[f], 'days', 1);

					log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates.push(_calcFinanceDates(firstDate, 'days', 1));

					break;
				case 'week':

					break;
				case 'biweekly':

					break;
				case 'month':
					var firstDate = _calcFirstDate(data[f], 'months', 1);

					log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates.push(_calcFinanceDates(firstDate, 'months', 1));

					break;
				case 'sixmonths':

					break;
				case 'year':

					break;
			}

		}

		//for(var i = 0; i<)

		for(start; moment(start).isBefore(end); start.add('days', 1)) {
			log.info('Debug', "current date in iteration", start.calendar());
			var timelineItemModel = {
				"attrs": {
					"date": start.calendar(),
					"finances_count": 0
				},
				"finances": {
					"income": [],
					"expenses": []
				}
			};

			// loop through finances, if the due date matches the current date
			// in the dates iteration, add it.
			for(var f in data) {
				/*log.info('Debug', "checking finances for date", data[f]);
				log.info('Debug', "date for finance", data[f].duedate);*/
				log.info('Debug', "date for finance", moment(data[f].duedate).format('L'));
				log.info('Debug', "date for finance", start.format('L'));
				log.info('Debug', "date for finance", start.format('L') === moment(data[f].duedate).format('L'));
				if(start.format('L') === moment(data[f].duedate).format('L')) {
					if(data[f].type === 0) timelineItemModel.finances.income.push(data[f]);
					if(data[f].type === 1) timelineItemModel.finances.expenses.push(data[f]);

					timelineItemModel.attrs.finances_count++;

					log.info('Debug', "found a finance", data[f]);
				}

			}

			timeline.push(timelineItemModel);
		}

		//log.info('Debug', "Data", timeline);
		return timeline;
	}


	app.get('/api/timeline', function(req, res) {

		var model = {
			"success": false,
			"error": null,
			"message": null,
			"data": null
		};

		var past = req.params.past,
			future = req.params.future;



		_getFinances().then(
			function(success) {
				res.send(_createTimelineData(success));

			},
			function(reason) {
				log.warn('Error', "Getting finances failed", reason);
				model.error = reason;
				res.send(model);
			}
		);
	});

	app.get('/api/timeline/:past', function(req, res) {
		var model = {
			"success": false,
			"error": null,
			"message": null,
			"data": null
		};

		var past = req.params.past;

		_getFinances().then(
			function(success) {
				res.send(_createTimelineData(success, past));

			},
			function(reason) {
				log.warn('Error', "Getting finances failed", reason);
				model.error = reason;
				res.send(model);
			}
		);
	});




};
