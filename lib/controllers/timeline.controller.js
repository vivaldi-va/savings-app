/**
 * Created by vivaldi on 01/01/14.
 */

'use strict';

var log			= require('log4js').getLogger('timeline controller');
var q			= require('q');
var os			= require('os');
var mongoose	= require('mongoose');
var ok			= require('okay');
var user		= require('./users.controller');
var finances	= require('./finances.controller');
var Finance		= mongoose.model('Finance');
var load	= os.loadavg();



/**
 * Generate empty timeline objects for the number of days
 * between how far into the future and into the past is desired
 *
 * @param today
 * @param start
 * @param end
 * @param cb
 * @private
 */
function _generateTimelineItems(today, start, end, cb) {

	today = new Date(today.setDate(today.getDate() - 1));

	var timeline = {
		"attrs": {
			"finances_count": 0,
			"finance_sums": {
				"income": 0.0,
				"expense": 0.0
			},
			"range": {
				"start": start,
				"end": end
			}
		},
		"items": []
	};

	// create timeline objects for 2 months - current date
	// this bootstrapped timeline will server to allow
	// adding finances to it
	for(start; start < end; start = new Date(start.setDate(start.getDate() + 1))) {
		//log.debug(start);
		var timelineItemModel = {
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

		if (start.getDate() === today.getDate() &&
			start.getMonth() === today.getMonth() &&
			start.getYear() === today.getYear()) {

			//log.info("Today is", today, "apparently");
			timelineItemModel.attrs.today = true;
		} else if(start > today) {

			timelineItemModel.attrs.future = true;
		}

		timeline.items.push(timelineItemModel);
	}

	cb(null, timeline);
}



/**
 * Calculate the first date the finance will appear in the timeline,
 * based on how far back into history you wish to look.
 *
 * @param finance
 * @param start
 * @param interval
 * @param intervalCount
 * @returns {*}
 * @private
 */
function _findFirstTimelineDateForFinance(finance, start, interval, intervalCount, cb) {
	//log.info("find first timeline date for", finance.name);
	var firstDate	= null;
	var due			= finance.duedate;

	// if the due date is before the oldest date in the generated timeline
	// add the supplied time interval until the date is equal or after the end of the timeline

	if(interval === 'once') {
		//cb(null, due);
		firstDate = due;
	} else if(due < start) {
		while(due < start) {


			switch(interval) {
				case 'days':
					firstDate = new Date( due.setDate(due.getDate() + intervalCount));
					break;
				case 'weeks':
					firstDate = new Date( due.setDate(due.getDate() + (intervalCount * 7)));
					break;
				case 'months':
					firstDate = new Date( due.setMonth(due.getMonth() + intervalCount));
					break;
				case 'years':
					firstDate = new Date( due.setMonth(due.getYear() + intervalCount));
					break;
				default:
					break;
			}

		}
	} else {
		//opposite is true here.
		// go backwards in time until the date is equal or after the end of the timeline

		while(due > start) {
			switch(interval) {
				case 'days':
					firstDate = new Date( due.setDate(due.getDate() - intervalCount));
					break;
				case 'weeks':
					firstDate = new Date( due.setDate(due.getDate() - (intervalCount * 7)));
					break;
				case 'months':
					firstDate = new Date( due.setMonth(due.getMonth() - intervalCount));
					break;
				case 'years':
					firstDate = new Date( due.setYear(due.getYear() - intervalCount));
					break;
				default:
					break;
			}


		}
	}
//log.debug('found it: ', firstDate);
	cb(null, firstDate);
}


function _calcFinanceDates(finance, params, interval, intervalCount, cb) {
	//log.info("find all finance dates", [interval, intervalCount]);

	var startDate		= params.start;
	var endDate			= params.end;
	var nextDate		= null;
	var disabledDate	= finance.disabled_date || null;

	_findFirstTimelineDateForFinance(finance, startDate, interval, intervalCount, function(err, firstDate) {

		log.info('first timeline date', firstDate);

		if (interval === 'once') {
			cb(null, startDate);
		} else {

			cb(null, firstDate);

			while (firstDate < endDate) {
				if (!!disabledDate) {
					if (firstDate > disabledDate) {
						break;
					}
				}

				switch (interval) {
					case 'days':
						nextDate = new Date(firstDate.setDate(firstDate.getDate() + intervalCount));

						break;
					case 'weeks':
						nextDate = new Date(firstDate.setDate(firstDate.getDate() + (intervalCount * 7)));

						break;
					case 'months':
						nextDate = new Date(firstDate.setMonth(firstDate.getMonth() + intervalCount));

						break;
					case 'years':
						nextDate = new Date(firstDate.setYear(firstDate.getYear() + intervalCount));
						break;
					default:
						break;
				}


				if (!!disabledDate) {
					if (nextDate > disabledDate) {
						cb(null, false);
					}
				} else {
					cb(null, nextDate);
				}
			}
		}

	});



}


function _getInterval(finance, cb) {

	//log.info("getting interval");

	var interval		= null;
	var intervalCount	= 0;

	switch(finance.interval) {
		case 0:
			interval		= 'once';
			break;
		case 24:
			interval		= 'days';
			intervalCount	= 1;
			break;
		case 24*7:
			interval		= 'weeks';
			intervalCount	= 1;
			break;
		case 24*7*2:
			interval		= 'weeks';
			intervalCount	= 2;
			break;
		case 744:
			interval		= 'months';
			intervalCount	= 1;
			break;
		case 24*31*6:
			interval		= 'months';
			intervalCount	= 6;

			break;
		case 24*31*12:
			interval		= 'years';
			intervalCount	= 1;

			break;
	}



	cb(null, {
		"interval": interval,
		"interval_count": intervalCount
	});
}






function _getModified(target, timelineDate) {

	var amount = target.amount;

	if(target.modifications.length) {
		for(var i = 0; i < target.modifications.length; i++) {
			if(!!target.modifications[i].date) {
				//log.debug(target.modifications[i].date, timelineDate);
				if(target.modifications[i].date.getDate() === timelineDate.getDate() &&
					target.modifications[i].date.getMonth() === timelineDate.getMonth() &&
					target.modifications[i].date.getYear() === timelineDate.getYear()) {

					amount = target.modifications[i].amount;
				}
			}
		}
	}

	return amount;

}



function _addItemToTimeline(timeline, timelineItem, cb) {
	for(var i = 0; i<timeline.items.length; i++) {
		var date = timeline.items[i].attrs.date;

		if (date.getDate() === timelineItem.timeline_date.getDate() &&
			date.getMonth() === timelineItem.timeline_date.getMonth() &&
			date.getYear() === timelineItem.timeline_date.getYear()) {

			timeline.attrs.finances_count++;

			var currentMonth	= new Date().getMonth();
			var elemMoment		= timelineItem.timeline_date;
			var elemMonth		= elemMoment.getMonth();


			if(timelineItem.type === 0) {
				timeline.items[i].finances.income.push(timelineItem);
				if(elemMonth === currentMonth) {
					timeline.attrs.finance_sums.income += timelineItem.amount;
				}
			}

			if(timelineItem.type === 1) {

				timeline.items[i].finances.expenses.push(timelineItem);
				if(elemMonth === currentMonth) {
					timeline.attrs.finance_sums.expense += timelineItem.amount;
				}
			}

			cb(null, timeline);
		}

	}
}


exports.getTimeline = function(req, res, next) {
	var timeline;

	var past		=  2;
	var future		=  1;

	var today		= new Date();
	//var tomorrow	= new Date(new Date().setDate(new Date().getDate() + 1));
	var start		= new Date(new Date().setMonth(new Date().getMonth() - 2));
	var end			= new Date(new Date().setMonth(new Date().getMonth() + 1));

	if(req.params.hasOwnProperty('past')) {
		past = req.params.past;
	}

	if(req.params.hasOwnProperty('future')) {
		past = req.params.future;
	}


	/**
	 * - Generate all dates for timeline and their corresponding elements in an object
	 * - fetch the user's finances from the database
	 *
	 * For each finance:
	 * - get the first date it occurs on the timeline
	 * - calculate all the dates it appears from the first date
	 * - for each date, create a new object to act as the timeline object
	 *  + this object must also take into account any timeline modifications
	 * - add the object to the timeline where it belongs
	 */
	_generateTimelineItems(today, start, end, function(err, timeline) {
		log.debug("Generated empty timeline");
		finances.intFinances(req.signedCookies.saIdent, next)
			.then(function(data) {
				var decrypted;
				log.debug('Fetched %d finances from db', data.length);


				var stuff = [];


				for(var finance in data) {

					if(data.hasOwnProperty(finance)) {

						decrypted = finances.decryptFinance(data[finance]);

				//log.debug('decrypted', decrypted);

						decrypted.timeline_date = null;



						_getInterval(decrypted, function(err, interval) {
							log.debug("Got interval");
							_findFirstTimelineDateForFinance(decrypted, start, interval.interval, interval.interval_count, function(err, firstDate) {

								log.debug("Calculated first date for finance");

								_calcFinanceDates(firstDate, end, interval.interval, interval.interval_count, decrypted.disabled_date, function(err, timelineDate) {
									log.debug("Calculated timeline date for %s", decrypted.name);


									if(timelineDate) {

										//log.debug(timelineDate);

										var financeContext = decrypted;


										var timelineItem = {
											_id: financeContext._id,
											amount: parseFloat(_getModified(financeContext, timelineDate)),
											interval: financeContext.interval,
											name: financeContext.name,
											type: financeContext.type,
											user_id: financeContext.user_id,
											disabled_date: financeContext.disabled_date,
											disabled: financeContext.disabled,
											description: financeContext.description,
											timeline_date: timelineDate
										};

								//log.debug("amount type", typeof timelineItem.amount);
										stuff.push(timelineItem);
									}

								});
							});
						});
					}
				}

				for(var i in stuff) {
					if(stuff.hasOwnProperty(i)) {
						_addItemToTimeline(timeline, stuff[i], function(err, updatedTimeline) {
							timeline = updatedTimeline;
						});
					}
				}
				log.debug('done');

				res.send(200, timeline);
			});
	});
};


/**
 * Generate an object to represent all the dates that are
 * to be applicable in the timeline view
 *
 * req:
 *  - BODY (optional) start: Date to start calculating the timeline from
 *  - BODY (optional) end: Date in the future that the timeline should end
 *
 * @param req
 * @param res
 */
exports.getEmptyTimeline = function(req, res) {
	var past		=  2;
	var future		=  1;

	var today		= new Date();
	var start		= new Date(new Date().setMonth(new Date().getMonth() - 2));
	var end			= new Date(new Date().setMonth(new Date().getMonth() + 1));

	if(req.params.hasOwnProperty('past')) {
		past = req.params.past;
	}

	if(req.params.hasOwnProperty('future')) {
		past = req.params.future;
	}

	_generateTimelineItems(today, start, end, function(err, timeline) {
		if(err) {
			log.error("Error generating timeline", err);
			res.send(500, err);
		} else {
			res.send(200, timeline);
		}
	});
};

exports.getTimelineItem = function(finance, params, cb) {
	log.debug("Savings.Controllers.getTimelineItem()");
	log.debug(finance);

	var start		= new Date(new Date().setMonth(new Date().getMonth() - 2));
	var end			= new Date(new Date().setMonth(new Date().getMonth() + 1));

	params = params || {
		"start": start,
		"end": end
	};
	var decryptedFinance;


	if(!finance) {
		log.error("No finance supplied to generate timeline item");
		cb(new Error("No finance supplied"));
	} else if(!params.start) {
		log.error("No start date supplied to generate timeline item");
		cb(new Error("No start date"));
	} else if(!params.end) {
		log.error("No end date supplied to generate timeline item");
		cb(new Error("No end date"));
	} else {
		decryptedFinance = finances.decryptFinance(finance);
		_getInterval(decryptedFinance, function(err, interval) {

			_calcFinanceDates(finance, params, interval.interval, interval.interval_count, function(err, timelineDate) {
				if(timelineDate) {

					log.debug(timelineDate);

					var financeContext = decryptedFinance;


					var timelineItem = {
						_id: financeContext._id,
						amount: parseFloat(_getModified(financeContext, timelineDate)),
						interval: financeContext.interval,
						name: financeContext.name,
						type: financeContext.type,
						user_id: financeContext.user_id,
						disabled_date: financeContext.disabled_date,
						disabled: financeContext.disabled,
						description: financeContext.description,
						timeline_date: timelineDate
					};

					//log.debug("amount type", typeof timelineItem.amount);
					cb(null, timelineItem);
				}
			});
		});

	}
};


exports.modifyTimelineItem = function(req, res, next) {

	//TODO: input validation

	var modification = {
		"amount": req.body.amount,
		"date": req.body.date
	};

	//log.info("updating timeline item", modification.date);

	Finance.findOne({_id: req.body.id}, ok(next, function(doc) {
		doc.modifications.push(modification);

		doc.save(ok(next, function() {
			res.send(200);
		}));
	}));
};
