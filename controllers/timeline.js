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

		db.query('SELECT `id`, `name`, `amount`, `duedate`, `type`, `interval`, `description`, `created`, `disabled` FROM finances WHERE userid = 1',
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
	 * @param past
	 * @param future
	 * @returns {Array}
	 * @private
	 */
	function _createTimelineData(data, past, future) {

		var timeline = [];
		var today = moment(new Date());
		var tomorrow = today.add('days', 1);
		//var day = d.getDate();

		var past = past || 2;
		var future = future || 1;


		var start = moment().subtract('months', past);
		var end = moment().add('months', future);


		// for each month
		// get number of days
		// 	- for each day
		//		+ loop through finances
		//		+ check the interval
		//		+ if there's no interval or if interval < 30 and duedate matches -> push item to array
		//		+ if interval(days)%30 = 0, add finance to the due date closest to previous date + interval




		var _calcFirstDate = function(finance, interval, intervalCount) {
			var firstDate = null;
			log.info(finance.name, "start");
			//log.info('Debug', "finance start date", start.format('L'));

			var due = moment(finance.duedate);

			if(due.isBefore(start)) {
				while(due.isBefore(start)) {
					firstDate = due.add(interval, 1);
				}
			} else {

				while(due.isAfter(start)) {
					firstDate = due.subtract(interval, 1);
				}
			}
			log.info('Debug', "Done finding first date for", finance.name);
			return firstDate;
		};



		var _calcFinanceDates = function(startDate, dueDate, interval, intervalCount, disabledDate) {
			log.info('Debug', "Calculating timeline item dates");
			var financeDates = [];
			var disabledDate = disabledDate || null;

			for(startDate;startDate.isBefore(end);startDate.add(interval, intervalCount)) {
				log.info('_calcFinanceDates', "Date in iteration", startDate.format('L'));
				if(!!disabledDate) {
					if(startDate.isBefore(moment(disabledDate))) {
						financeDates.push(startDate.format('L'));

					}
				} else {
					//log.info('Debug', "Startdate after due date", startDate.isAfter(moment(dueDate)) || startDate.isSame(moment(dueDate)), moment(dueDate).format('L') + ' ' + startDate.format('L'));
					if(startDate.isAfter(moment(dueDate)) || startDate.isSame(moment(dueDate))) {
						//log.info('Debug', "Startdate after due date");
						financeDates.push(startDate.format('L'));
					}
				}
			}
			log.info('Debug', "Done finding timeline dates", financeDates);

			return financeDates;
		};



		// parse the interval string from the database into arguments that are
		// usable by moment.js
		// =================== +
		// first find the first date on the timeline the finance is applicable to
		// then find the interval dates, or the dates that the finance will appear on the timeline
		for(var f in data) {

			//log.info('Debug', "calculating intervals");
			data[f].interval_dates = [];



			switch(data[f].interval) {
				case 'day':

					var firstDate = _calcFirstDate(data[f], 'days', 1);

					//log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'days', 1, data[f].disabled);
					//log.info('Debug', "Finished timeline info for", data[f].name, data[f].interval_dates);

					break;
				case 'week':
					var firstDate = _calcFirstDate(data[f], 'weeks', 1);

					//log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'weeks', 1, data[f].disabled);
					//log.info('Debug', "Finished timeline info for", data[f].name, data[f].interval_dates)
					break;
				case 'biweekly':
					var firstDate = _calcFirstDate(data[f], 'weeks', 2);

					//log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'weeks', 2, data[f].disabled);
					//log.info('Debug', "Finished timeline info for", data[f].name, data[f].interval_dates)
					break;
				case 'month':
					var firstDate = _calcFirstDate(data[f], 'months', 1);

					//log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'months', 1, data[f].disabled);
					//log.info('Debug', "Finished timeline info for", data[f].name, data[f].interval_dates)

					break;
				case 'sixmonths':
					var firstDate = _calcFirstDate(data[f], 'months', 6);

					//log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'months', 6, data[f].disabled);
					//log.info('Debug', "Finished timeline info for", data[f].name, data[f].interval_dates)
					break;
				case 'year':
					var firstDate = _calcFirstDate(data[f], 'years', 1);

					//log.info('Debug', "calculating first date", firstDate);
					data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'years', 1, data[f].disabled);
					//log.info('Debug', "Finished timeline info for", data[f].name, data[f].interval_dates)
					break;
			}

		}


		// create timeline objects for 2 months - current date
        // this bootstrapped timeline will server to allow
        // adding finances to it
		//log.info('Debug', "today + 1", today.add('days', 1));
		for(start; moment(start).isBefore(tomorrow) ; start.add('days', 1)) {
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

			if (moment(start).format('L') === moment(new Date()).format('L')) {
				timelineItemModel.attrs.today = true;
			}

			timeline.push(timelineItemModel);
		}
		for(today; moment(today).isBefore(end) ; today.add('days', 1)) {
			//log.info('Debug', "current date in iteration", start.calendar());
			var timelineItemModel = {
				"attrs": {
					"date": today.format('L'),
					"finances_count": 0,
					"future": true
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
			////log.info('Debug', "looping timeline date objects", date);

			for(var f in data) {
				var calculatedDates = data[f].interval_dates;

				if (!!calculatedDates.length) {

					for(var d in calculatedDates) {


						if (date === calculatedDates[d]) {
							//log.info('Add to timeline obj', "date matches?", date===calculatedDates[d]);
							//log.info('Add to timeline obj', "date matches?", data[f].type);
							timeline[i].attrs.finances_count++;
							if(data[f].type === 0) timeline[i].finances.income.push(data[f]);
							if(data[f].type === 1) timeline[i].finances.expenses.push(data[f]);
						}
					}
				}

			}
		}

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
