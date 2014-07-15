/**
 * Created by vivaldi on 22/02/14.
 */

/**
 * Created by vivaldi on 01/01/14.
 */

'use strict';

var log				= require('log4js').getLogger('finances controller');
var dateFormat		= require('dateformat');
var moment			= require('moment');
var q				= require('q');
var ok				= require('okay');
var user			= require('./users');
var mongoose		= require('mongoose');
var Finance			= mongoose.model('Finance');

function _getTotalPerMonth(interval, amount) {

	var daysThisMonth = moment().daysInMonth();
	var multiplyBy = null;
	switch (interval) {
		case 24:
			multiplyBy = daysThisMonth;

			break;
		case 24*7:
			multiplyBy = 4;

			break;
		case 24*7*2:
			multiplyBy = 2;
			break;
		case 24*31:
			multiplyBy = 1;
			break;
		case 24*31*6:

			break;
		case 365:

			break;
	}
	//log.info('_getTotalPerMonth', "mult numbe", multiplyBy, "calc'd amount", amount * multiplyBy);
	return amount * multiplyBy;
}


exports.getFinances = function (req, res, next) {

	var userId	= req.signedCookies.saIdent;

	Finance.find({user_id: userId, disabled: false}, ok(next, function(docs) {
		if(docs.length > 0) {
			var data = {
				"income": [],
				"expenses": [],
				"attrs": {
					"income": {
						"count": 0,
						"total_per_month": 0
					},
					"expenses": {
						"count": 0,
						"total_per_month": 0
					}

				}
			};


			for (var i = 0; i<docs.length; i++) {
				var doc = docs[i];

				if(doc.interval === 0 && doc.duedate <= new Date()) {
					//result.splice(i, 1);
					continue;
				}


				if (doc.type === 0) {
					data.income.push(doc);
					data.attrs.income.count++;
					data.attrs.income.total_per_month += _getTotalPerMonth(doc.interval, parseFloat(doc.amount));
				}
				if (doc.type === 1) {
					data.expenses.push(doc);
					data.attrs.expenses.count++;
					data.attrs.expenses.total_per_month += _getTotalPerMonth(doc.interval, parseFloat(doc.amount));
				}

			}
			res.send(200, data);
		} else {
			res.send(204);
		}
	}));
};

exports.intFinances = function(userId, next) {
	var dfd = q.defer();
	Finance.find({user_id: userId}, ok(next, function(docs) {
		dfd.resolve(docs);
	}));
	return dfd.promise;
};

exports.addFinance = function (req, res, next) {
	log.info("posting a finance");

	var duedate;
	var userId = req.signedCookies.saIdent;

	// === | input validation | ===

	// Make sure name is not missing and isn't too long (max 50 chars)
	req.assert('name', "Name is missing").notEmpty();
	// min-length set to 0 to avoid having multiple errors if name is empty
	req.assert('name', "Name is too long").len(0, 50);

	// Validate amount is not missing, and is a proper format (using . or , as decimal)
	req.assert('amount', "Amount is missing").notEmpty();
	req.assert('amount', "Amount needs to be a currency value").is(/\d+([,.]\d+)?/);

	// Convert currency to proper float decimal format.
	if (req.body.amount) {
		req.body.amount = req.body.amount.replace(',', '.');
	}


	// Validate date is not missing and it's format is correct ('dd/mm/yyyy')
	req.assert('date', "date is missing").notEmpty();
	//req.assert('date', "invalid date, correct format is: dd/mm/yy").is(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
	//req.assert('date', "invalid date, correct format is: dd/mm/yy").isDate();
	if (!!req.body.date) {
		//var duedate = req.body.date.replace(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, "$3-$2-$1");
		duedate = req.body.date;
	}

	// check interval
	//req.checkBody('interval', "no interval selected").notNull();

	// validate description if one is given to ensure it's length isn't greater than 140
	if (!!req.body.description) {
		req.assert('description', "description is too long").len(0, 140);
	}


	if (req.validationErrors()) {
		log.warn("ERROR", "Here be errors ", req.validationErrors());
		//model.error = req.validationErrors();
		res.send(400, req.validationErrors());
	} else {

		Finance.create({
			user_id: userId,
			name: req.body.name,
			amount: req.body.amount,
			duedate: duedate,
			interval: req.body.interval,
			type: req.body.type,
			description: req.body.description || null
		}, ok(next, function(doc) {
			res.send(201, doc);
		}));

	}
};

exports.updateFinance = function (req, res, next) {
	log.info("PUT request for finance id " + req.params.id + " received");

	Finance.findOne({_id: req.params.id}, ok(next, function(doc) {

		doc.name		= req.body.name;
		doc.amount		= req.body.amount;
		doc.duedate		= req.body.duedate;
		doc.description = req.body.description;
		doc.interval	= req.body.interval;

		doc.save(ok(next, function() {
			res.send(200);
		}));
	}));
};

exports.removeFinance = function (req, res, next) {
	log.info("DELETE request for finance id " + req.params.id + " received");
	Finance.findOne({_id: req.params.id}, ok(next, function(doc) {
		doc.disabled = true;
		doc.disabled_date = new Date();
		doc.save(ok(next, function() {
			res.send(204);
		}));
	}));

};