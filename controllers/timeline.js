/**
 * Created by vivaldi on 01/01/14.
 */

module.exports.set = function(app, db) {

	var log		= require('npmlog');
	var q		= require('q');
	var moment	= require('moment');
	var os		= require('os');
	var load	= os.loadavg();
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
					data[f].interval_dates = _calcFinanceDates(firstDate, 'days', 1);

					break;
				case 'week':
					var firstDate = _calcFirstDate(data[f], 'weeks', 1);

					log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, 'weeks', 1);
					break;
				case 'biweekly':
					var firstDate = _calcFirstDate(data[f], 'weeks', 2);

					log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, 'weeks', 2);
					break;
				case 'month':
					var firstDate = _calcFirstDate(data[f], 'months', 1);

					log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, 'months', 1);

					break;
				case 'sixmonths':
					var firstDate = _calcFirstDate(data[f], 'months', 6);

					log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, 'months', 6);
					break;
				case 'year':
					var firstDate = _calcFirstDate(data[f], 'years', 1);

					log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, 'years', 1);
					break;
			}

		}

		//for(var i = 0; i<)

		// create timeline objects for 2 months +- current date
		for(start; moment(start).isBefore(end); start.add('days', 1)) {
			//log.info('Debug', "current date in iteration", start.calendar());
			var timelineItemModel = {
				"attrs": {
					"date": start.format('L'),
					"finances_count": 0
				},
				"finances": {
					"income": [],
					"expenses": []
				}
			};

			timeline.push(timelineItemModel);
		}


		// loop through generated timeline objects
		// then loop through finances
		// if there's a corresponding date in generated interval dates
		// add it to the timeline object's relevant array
		for(var i = 0; i<timeline.length; i++) {
			var date = timeline[i].attrs.date;
			//log.info('Debug', "looping timeline date objects", date);

			for(var f in data) {
				var calculatedDates = data[f].interval_dates;
				//delete data[f].interval_dates;
				//log.info('Debug', "finding finances and getting interval date info", calculatedDates);

				if (!!calculatedDates.length) {
					//log.info('Debug', "looping dates", calculatedDates);
					for(var d in calculatedDates) {
						//log.info('Debug', "current interval date", calculatedDates[d]);

						//log.info('Debug', "moment date formatting", moment(date));
						//log.info('Debug', "does date match current timeline item date?", date, calculatedDates[d]);
						if (date === calculatedDates[d]) {
							timeline[i].attrs.finances_count++;
							if(data[f].type === 0) timeline[i].finances.income.push(data[f]);
							if(data[f].type === 1) timeline[i].finances.expenses.push(data[f]);
						}
					}
				}
				//if(timeline[i].finances.income.length)log.info('Debug', "Data", timeline[i]);

			}
		}

		//log.info('Debug', "Data", timeline);
		log.info('Debug', "Recent system load", os.freemem()/(1024*1024));
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
				model.success = true;
				model.data = _createTimelineData(success);
				res.send(model);

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
