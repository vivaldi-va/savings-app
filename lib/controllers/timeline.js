/**
 * Created by vivaldi on 01/01/14.
 */

var log		= require('npmlog');
var q		= require('q');
var moment	= require('moment');
var os		= require('os');
var mysql	= require('mysql');
var dbConf	= require('../conf.json');
var user	= require('./users');
var load	= os.loadavg();
moment.lang('en-gb');


/**
 * Get finance data from database and return it using
 * deferred promises
 *
 * TODO: integrate user accounts
 *
 * @returns {promise} database result
 * @private
 */
function _getFinances(userId) {
	var dfd = q.defer();
	var db 		= mysql.createConnection(dbConf.db);
	db.connect();
	db.query('SELECT `id`, `name`, `amount`, `duedate`, `type`, `interval`, `description`, `created`, `disabled` FROM finances WHERE userid = '+userId,
		function(err, result) {
			if(err) {
				db.end();
				dfd.reject(err);
			}

			if(!result) {
				db.end();
				dfd.reject("no finances found");
			} else {
				//log.info('QUERY', "getting finances successful");

				db.end();
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
		//log.info(finance.name, "start");
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
		//log.info('Debug', "Done finding first date for", finance.name);
		return firstDate;
	};



	var _calcFinanceDates = function(startDate, dueDate, interval, intervalCount, disabledDate) {
		//log.info('Debug', "Calculating timeline item dates");
		var financeDates = [];
		var disabledDate = disabledDate || null;

		for(startDate;startDate.isBefore(end);startDate.add(interval, intervalCount)) {
			//log.info('_calcFinanceDates', "Date in iteration", startDate.format('L'));
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
		//log.info('Debug', "Done finding timeline dates", financeDates);

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
				data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'days', 1, data[f].disabled);
				break;
			case 'week':
				var firstDate = _calcFirstDate(data[f], 'weeks', 1);
				data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'weeks', 1, data[f].disabled);
				break;
			case 'biweekly':
				var firstDate = _calcFirstDate(data[f], 'weeks', 2);
				data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'weeks', 2, data[f].disabled);
				break;
			case 'month':
				var firstDate = _calcFirstDate(data[f], 'months', 1);
				data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'months', 1, data[f].disabled);

				break;
			case 'sixmonths':
				var firstDate = _calcFirstDate(data[f], 'months', 6);

				data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'months', 6, data[f].disabled);
				break;
			case 'year':
				var firstDate = _calcFirstDate(data[f], 'years', 1);

				data[f].interval_dates = _calcFinanceDates(firstDate, data[f].duedate, 'years', 1, data[f].disabled);
				break;
		}

	}


	// create timeline objects for 2 months - current date
	// this bootstrapped timeline will server to allow
	// adding finances to it
	//log.info('Debug', "today + 1", today.add('days', 1));
	for(start; moment(start).isBefore(tomorrow) ; start.add('days', 1)) {
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



exports.getTimeline = function(req, res) {
	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};
	var past;
	var future;

	if(req.params.hasOwnProperty('past')) {
		past = req.params.past;
	}

	if(req.params.hasOwnProperty('future')) {
		past = req.params.future;
	}



	_getFinances(req.signedCookies.saIdent).then(
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
};
