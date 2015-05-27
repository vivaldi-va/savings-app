/**
 * Created by vivaldi on 01/01/14.
 */

'use strict';

var log		= require('log4js').getLogger('timeline controller');
var q			= require('q');
var os			= require('os');
var mongoose	= require('mongoose');
var Joi			= require('joi');
var user		= require('../user/user.controller.js');
var finances	= require('../finances/finances.controller.js');
var Finance	= require('../finances/finances.model');
var load		= os.loadavg();



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
			"timeline_balance": {
				"day": 0,
				"week": 0,
				"month": 0,
				"six_month": 0,
				"year": 0
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
 * @param cb
 * @private
 */
function _findFirstTimelineDateForFinance(finance, start, interval, intervalCount, cb) {
	log.info("find first timeline date for", finance.name);
	var firstDate	= null;
	var due			= new Date(finance.duedate);

	// if the due date is before the oldest date in the generated timeline
	// add the supplied time interval until the date is equal or after the end of the timeline


	if(!!finance.disabled_date && finance.disabled_date < start) {
		cb(null, null);
	}
	else if(due < start) {
		//log.debug(finance.name, "Due date is before the start of the timeline");


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
		firstDate = due;
	}
	log.debug('found it: ', firstDate);
	cb(null, firstDate);
}


function _calcFinanceDates(finance, params, interval, intervalCount, cb) {
	//log.info("find all finance dates", [interval, intervalCount]);

	var startDate		= params.start;
	var endDate			= params.end;
	var nextDate		= null;
	var disabledDate	= finance.disabled_date || null;

	_findFirstTimelineDateForFinance(finance, startDate, interval, intervalCount, function(err, firstDate) {

		if(!!firstDate) {
			//log.info('first timeline date', firstDate);
			if (interval === 'once') {
				//log.debug("Got a date for", finance.name, ":", firstDate);
				return cb(null, firstDate);
			}

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
						return cb(null, false);
					}
				}

				cb(null, nextDate);
			}
		}

	});



}


function _getInterval(finance, cb) {

	log.info("Savings.Timeline.getInterval()", finance);

	var interval		= null;
	var intervalCount	= 0;

	switch(Number(finance.interval)) {
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
		case 24*31:
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

	if(target.modifications && target.modifications.length) {
		for(var i = 0; i < target.modifications.length; i++) {
			if(target.modifications.hasOwnProperty(i)) {

				if(target.modifications[i].hasOwnProperty('date')) {
					var targetDate = new Date(target.modifications[i].date);
					//log.debug(target.modifications[i].date, timelineDate);
					if(targetDate.getDate() === timelineDate.getDate() &&
						targetDate.getMonth() === timelineDate.getMonth() &&
						targetDate.getYear() === timelineDate.getYear()) {

						amount = target.modifications[i].amount;
					}
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
	var end		= new Date(new Date().setMonth(new Date().getMonth() + 1));

	if(req.params.hasOwnProperty('past')) {
		past = req.params.past;
	}

	if(req.params.hasOwnProperty('future')) {
		past = req.params.future;
	}

	_generateTimelineItems(today, start, end, function(err, timeline) {
		if(err) {
			//log.error("Error generating timeline", err);
			res.status(500).send(err);
			return;
		}

		res.status(200).send(timeline);
	});
};

exports.getTimelineItem = function(finance, params, cb) {
	log.debug("Savings.Controllers.getTimelineItem()", finance);
	//log.debug(finance);

	var start		= new Date(new Date().setMonth(new Date().getMonth() - 2));
	var end		= new Date(new Date().setMonth(new Date().getMonth() + 1));

	params = params || {
		"start": start,
		"end": end
	};


	if(!finance) {
		log.error("No finance supplied to generate timeline item");
		return cb(new Error("No finance supplied"));
	}

	if(!params.start) {
		log.error("No start date supplied to generate timeline item");
		return cb(new Error("No start date"));
	}

	if(!params.end) {
		log.error("No end date supplied to generate timeline item");
		return cb(new Error("No end date"));
	}

	finances.decryptFinance(finance, function(err, decryptedFinance) {
		_getInterval(decryptedFinance, function(err, interval) {

			_calcFinanceDates(finance, params, interval.interval, interval.interval_count, function(err, timelineDate) {


				if(timelineDate) {

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
						timeline_date: timelineDate,
						finance_id: finance._id
					};

					//log.debug("amount type", typeof timelineItem.amount);
					cb(null, timelineItem);
				}
			});
		});
	});

};


exports.modifyTimelineItem = function(data, cb) {

	//TODO: input validation

	log.debug("Savings.Timeline.modifyTimelineItem()");

	var schema = Joi.object().keys({
		id: Joi.any().required(),
		amount: Joi.number().integer().required(),
		date: Joi.date().required()
	});

	Joi.validate(data, schema, function(err, value) {

		if(err) {
			log.error("Timeline item modification data failed validation", err);
			return cb(new Error("ERROR::INVALID_VALS"));
		}

		var modification = {
			"amount": data.amount,
			"date": new Date(data.date)
		};

		//log.info("updating timeline item", modification.date);

		Finance.findOne({_id: data.id}, function(err, doc) {

			var modifiedAtDate = false;
			// if there are already modifications
			if(doc.modifications.length) {
				// check modifications to see if there is already one for this finance at this date
				for(var i = 0; i<doc.modifications.length; i++) {
					if(doc.modifications[i].date.getDate() === modification.date.getDate() &&
						doc.modifications[i].date.getMonth() === modification.date.getMonth() &&
						doc.modifications[i].date.getYear() === modification.date.getYear()) {


						log.debug("Already a modification at this date, saving over previous one");
						modifiedAtDate = true;
						doc.modifications[i] = modification;
						break;
					}
				}
			}

			if(!modifiedAtDate) {
				log.debug("No previous modification, adding a new one");
				doc.modifications.push(modification);
			}


			Finance.update({_id: data.id}, {modifications: doc.modifications}, function(err, numAffected) {
				if(err) {
					log.error("Updating finance with modifications failed", err);
					return cb(err);
				}

				log.debug("Modified finance, returning it to be used to repopulate timeline", "num affected: %d", numAffected);
				cb(null, finances.decryptFinance(doc));
			});
		});
	});
};
