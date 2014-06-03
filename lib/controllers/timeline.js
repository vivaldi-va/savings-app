/**
 * Created by vivaldi on 01/01/14.
 */

var log			= require('npmlog');
var q			= require('q');
var moment		= require('moment');
var os			= require('os');

var user		= require('./users');
var finances	= require('./finances');

//var db 		= mysql.createPool(dbConf.db);
var db;
var load	= os.loadavg();
moment.lang('en-gb');



function _calcFirstDate(finance, start, interval, intervalCount) {
	var firstDate	= null;
	var due			= moment(finance.duedate);

	if(due.isBefore(start)) {
		while(due.isBefore(start)) {
			firstDate = due.add(interval, 1);
		}
	} else {

		while(due.isAfter(start)) {
			firstDate = due.subtract(interval, 1);
		}
	}
	return firstDate;
}



function _calcFinanceDates(startDate, end, dueDate, interval, intervalCount, disabledDate) {
	var financeDates	= [];
	disabledDate		= disabledDate || null;

	for(startDate; startDate.isBefore(end); startDate.add(interval, intervalCount)) {

		if(!!disabledDate) {
			if(startDate.isBefore(moment(disabledDate))) {
				financeDates.push(startDate.format('L'));

			}
		} else {

			if(startDate.isAfter(moment(dueDate)) || startDate.isSame(moment(dueDate))) {
				financeDates.push(startDate.format('L'));
			}
		}
	}
	return financeDates;
}


/**
 * parse the timeline data and parse it into a usable json string
 * for use in formatting the timeline
 *
 * @param data		- finances
 * @param past		- months into the past to generate data (defaults to 2)
 * @param future	- months into the future to generate data (defaults to 1)
 * @returns {{attrs: {finances_count: number, finance_sums: {income: number, expense: number}}, items: Array}}
 * @private
 */
function _createTimelineData(data, past, future) {
	past			= past || 2;
	future			= future || 1;

	var today		= moment(new Date());
	var tomorrow	= today.add('days', 1);
	var start		= moment().subtract('months', past);
	var end			= moment().add('months', future);
	var timelineItemModel;
	var timeline	= {
		"attrs": {
			"finances_count": 0,
			"finance_sums": {
				"income": 0.0,
				"expense": 0.0
			}
		},
		"items": []
	};





	// parse the interval string from the database into arguments that are
	// usable by moment.js
	// =================== +
	// first find the first date on the timeline the finance is applicable to
	// then find the interval dates, or the dates that the finance will appear on the timeline
	for(var f in data) {

		var firstDate;
		data[f].interval_dates = [];

		switch(data[f].interval) {
			case 0:
				firstDate = moment(data[f].duedate);
				data[f].interval_dates = [firstDate.format('L')];
				break;
			case 24:
				firstDate = _calcFirstDate(data[f], start, 'days', 1);
				data[f].interval_dates = _calcFinanceDates(firstDate, end, data[f].duedate, 'days', 1, data[f].disabled_date);
				break;
			case 24*7:
				firstDate = _calcFirstDate(data[f], start, 'weeks', 1);
				data[f].interval_dates = _calcFinanceDates(firstDate, end, data[f].duedate, 'weeks', 1, data[f].disabled_date);
				break;
			case 24*7*2:
				firstDate = _calcFirstDate(data[f], start, 'weeks', 2);
				data[f].interval_dates = _calcFinanceDates(firstDate, end, data[f].duedate, 'weeks', 2, data[f].disabled_date);
				break;
			case 744:
				firstDate = _calcFirstDate(data[f], start, 'months', 1);
				data[f].interval_dates = _calcFinanceDates(firstDate, end, data[f].duedate, 'months', 1, data[f].disabled_date);
				break;
			case 24*31*6:
				firstDate = _calcFirstDate(data[f], start, 'months', 6);

				data[f].interval_dates = _calcFinanceDates(firstDate, end, data[f].duedate, 'months', 6, data[f].disabled_date);
				break;
			case 24*31*12:
				firstDate = _calcFirstDate(data[f], start, 'years', 1);

				data[f].interval_dates = _calcFinanceDates(firstDate, end, data[f].duedate, 'years', 1, data[f].disabled_date);
				break;
		}

	}


	// create timeline objects for 2 months - current date
	// this bootstrapped timeline will server to allow
	// adding finances to it
	for(start; moment(start).isBefore(tomorrow) ; start.add('days', 1)) {
		timelineItemModel = {
			"attrs": {
				"date": start.format('L')
			},
			"finances": {
				"income": [],
				"expenses": []
			}
		};

		if (moment(start).format('L') === moment(new Date()).format('L')) {
			timelineItemModel.attrs.today = true;
		}

		timeline.items.push(timelineItemModel);
	}


	for(today; moment(today).isBefore(end) ; today.add('days', 1)) {
		timelineItemModel = {
			"attrs": {
				"date": today.format('L'),
				"future": true
			},
			"finances": {
				"income": [],
				"expenses": []
			}
		};

		timeline.items.push(timelineItemModel);
	}


	// loop through generated timeline objects
	// then loop through finances
	// if there's a corresponding date in generated interval dates
	// add it to the timeline object's relevant array

	for(var i = 0; i<timeline.items.length; i++) {
		var date = timeline.items[i].attrs.date;

		for(var f in data) {
			var calculatedDates = data[f].interval_dates;

			if (!!calculatedDates.length) {

				for(var d in calculatedDates) {

					if (date === calculatedDates[d]) {
						timeline.attrs.finances_count++;

						var finance			= data[f];
						var currentMonth	= moment().month();
						var elemMoment		= moment(calculatedDates[d], 'DD-MM-YYYY');
						var elemMonth		= elemMoment.month();

						if(finance.modifications.length) {
							for(var m = 0; m < finance.modifications.length; m++) {
								if(moment(finance.modifications[m].date).isSame(elemMoment)) {
									finance.armount = finance.modifications[m].amount;
								}
							}
						}

						if(data[f].type === 0) {
							timeline.items[i].finances.income.push(data[f]);
							if(elemMonth === currentMonth) {

								timeline.attrs.finance_sums.income += finance.amount;
							}

						}
						if(data[f].type === 1) {
							timeline.items[i].finances.expenses.push(data[f]);
							if(elemMonth === currentMonth) {
								timeline.attrs.finance_sums.expense += finance.amount;
							}
						}
					}
				}
			}

		}
	}

	return timeline;
}


exports.getTimeline = function(req, res, next) {
	var past;
	var future;

	if(req.params.hasOwnProperty('past')) {
		past = req.params.past;
	}

	if(req.params.hasOwnProperty('future')) {
		past = req.params.future;
	}



	finances.intFinances(req.signedCookies.saIdent, next)
		.then(function(success) {
			res.send(200, _createTimelineData(success));
		});
};
