/**
 * Created by vivaldi on 01/01/14.
 */

var log			= require('npmlog');
var q			= require('q');
var moment		= require('moment');
var os			= require('os');
var mongoose	= require('mongoose');
var ok			= require('okay');
var user		= require('./users');
var finances	= require('./finances');
var Finance		= mongoose.model('Finance');

//var db 		= mysql.createPool(dbConf.db);
var db;
var load	= os.loadavg();
moment.lang('en-gb');

function _copyObject(obj) {
	var newObj = {};

	for(var i in obj) {
		newObj[i] = obj[i];
	}
	return newObj;
}

function _calcFirstDate(finance, start, interval, intervalCount) {
	var firstDate	= null;
	var due			= finance.duedate;

	if(due < start) {
		while(due < start) {

			switch(interval) {
				case 'days':
					firstDate = new Date( due.setDate(due.getDate() + intervalCount));
					break;
				case 'weeks':
					firstDate = new Date( due.setDate(due.getDate() + (intervalCount * 7)));
					break;
				case 'months':
					firstDate = new Date( due.setMonth(due.getDate() + intervalCount));
					break;
				case 'years':
					firstDate = new Date( due.setMonth(due.getYear() + intervalCount));
					break;
				default:
					break;
			}
		}
	} else {

		while(due > start) {
			switch(interval) {
				case 'days':
					firstDate = new Date( due.setDate(due.getDate() - intervalCount));
					break;
				case 'weeks':
					firstDate = new Date( due.setDate(due.getDate() - (intervalCount * 7)));
					break;
				case 'months':
					firstDate = new Date( due.setMonth(due.getDate() - intervalCount));
					break;
				case 'years':
					firstDate = new Date( due.setMonth(due.getYear() - intervalCount));
					break;
				default:
					break;
			}
		}
	}
	return firstDate;
}



function _calcFinanceDates(startDate, end, dueDate, interval, intervalCount, disabledDate) {
	var financeDates	= [];
	disabledDate		= disabledDate || null;


	switch(interval) {
		case 'days':
			while(startDate < end) {
				if(!!disabledDate) {
					if(startDate > disabledDate) {
						break;
					}
				}
				financeDates.push(new Date( startDate.setDate(startDate.getDate() + intervalCount)));
			}
			break;
		case 'weeks':
			while(startDate < end) {
				if(!!disabledDate) {
					if(startDate > disabledDate) {
						break;
					}
				}
				financeDates.push(new Date( startDate.setDate(startDate.getDate() + (intervalCount * 7))));
			}
			break;
		case 'months':
			while(startDate < end) {
				if(!!disabledDate) {
					if(startDate > disabledDate) {
						break;
					}
				}
				financeDates.push(new Date( startDate.setMonth(startDate.getMonth() + intervalCount)));
			}
			break;
		case 'years':
			while(startDate < end) {
				if(!!disabledDate) {
					if(startDate > disabledDate) {
						break;
					}
				}
				financeDates.push(new Date( startDate.setYear(startDate.getYear() + intervalCount)));
			}
			break;
		default:
			break;
	}
	return financeDates;
}


function _getModified(target, timelineDate) {
	if(target.modifications.length) {
		for(var i = 0; i < target.modifications.length; i++) {
			if(!!target.modifications[i].date) {
				//console.log(target.modifications[i].date, timelineDate);
				if(target.modifications[i].date.getDate() === timelineDate.getDate() &&
					target.modifications[i].date.getMonth() === timelineDate.getMonth() &&
					target.modifications[i].date.getYear() === timelineDate.getYear()) {

					target.amount = target.modifications[i].amount;
					target.is_modified = true;

				}
			}
		}
	}

	return target;
}


function _updateModified(timeline) {
	console.log('update modified');
	var context;
	for(var i in timeline.items) {
		var itemDate = timeline.items[i].attrs.date;
		context = timeline.items[i].finances;

		for(var f in context.income) {
			context.income[f] = _getModified(context.income[f], itemDate);
		}

		for(var f in context.expenses) {
			console.log('before', context.expenses[f].amount);
			context.expenses[f] = _getModified(context.expenses[f], itemDate);
			console.log('modified', context.expenses[f].amount);
		}

	}

	return timeline;
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

	var today		= new Date();
	var tomorrow	= new Date(new Date().setDate(new Date().getDate() + 1));
	var start		= new Date(new Date().setMonth(new Date().getMonth() - 2));
	var end			= new Date(new Date().setMonth(new Date().getMonth() + 1));


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
				//firstDate = data[f].duedate;
				data[f].interval_dates = [data[f].duedate];
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
	for(start; start < end; start = new Date(start.setDate(start.getDate() + 1))) {
		//console.log(start);
		timelineItemModel = {
			"attrs": {
				"date": start,
				"today": false,
				"future": false
			},
			"finances": {
				"income": [],
				"expenses": []
			}
		};

		if (start.getDate() == today.getDate() && start.getMonth() == today.getMonth() && start.getYear() == today.getYear()) {
			timelineItemModel.attrs.today = true;
		}

		if(start > today) {
			timelineItemModel.attrs.future = true;
		}

		timeline.items.push(timelineItemModel);
	}


	// loop through generated timeline objects
	// then loop through finances
	// if there's a corresponding date in generated interval dates
	// add it to the timeline object's relevant array

	for(var i = 0; i<timeline.items.length; i++) {
		var date = timeline.items[i].attrs.date;
		var elem;
		for(var f in data) {

			var calculatedDates = data[f].interval_dates;

			if (!!calculatedDates.length && !data[f].disabled) {

				for(var d in calculatedDates) {

					if (date.getDate() === calculatedDates[d].getDate() &&
						date.getMonth() === calculatedDates[d].getMonth() &&
						date.getYear() === calculatedDates[d].getYear()) {
						timeline.attrs.finances_count++;

						var currentMonth	= today.getMonth();
						var elemMoment		= calculatedDates[d];
						var elemMonth		= elemMoment.getMonth();
						elem				= _copyObject(data[f]);


						if(elem.type === 0) {
							timeline.items[i].finances.income.unshift(_getModified(elem, elemMoment));
							if(elemMonth === currentMonth) {

								timeline.attrs.finance_sums.income += elem.amount;
							}
						}

						if(elem.type === 1) {

							timeline.items[i].finances.expenses.unshift(_getModified(elem, elemMoment));
							if(elemMonth === currentMonth) {
								timeline.attrs.finance_sums.expense += elem.amount;
							}
						}
						if(!!elem.is_modified) {
							//console.log('MODDD', finance.amount, elemMoment);
							console.log('MOD', timeline.items[i]);
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

exports.modifyTimelineItem = function(req, res, next) {

	// TODO: input validation

	var modification = {
		"amount": req.body.amount,
		"date": req.body.date
	};

	console.log(modification.date);

	Finance.findOne({_id: req.body.id}, ok(next, function(doc) {
		doc.modifications.push(modification);

		doc.save(ok(next, function() {
			res.send(200);
		}));
	}));
};
