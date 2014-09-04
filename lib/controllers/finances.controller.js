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
var crypto			= require('crypto');
var q				= require('q');
var ok				= require('okay');
var user			= require('./users.controller');
var mongoose		= require('mongoose');
var config			= require('../config/config.js');
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

function _getInterval(finance) {


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



	return {
		"interval": interval,
		"interval_count": intervalCount
	};
}

function _getTimeUntilDue(finance) {
	var today		= moment();
	var due			= moment(finance.duedate);
	var diff		= "Today";
	var interval	= _getInterval(finance);



	log.debug("interval", interval);

	while(due.isBefore(today, 'day')) {
		due.add(interval.interval, interval.interval_count);
	}

	log.debug("due", due.calendar());

	if(due.diff(today, 'days') > 0) {
		diff = due.fromNow();
		log.debug("Next due date for %s is %s", finance.name, diff);
	}

	return diff;

	//diff = Math.round(Math.abs(due - today) / (1000*60*60*24));

}


function _encryptFinance(finance, cb) {

	var algorithm			= 'aes256'; // or any other algorithm supported by OpenSSL
	var key					= config.auth.aes.secret;
	var nameCipher		= crypto.createCipher(algorithm, key);
	var amountCipher		= crypto.createCipher(algorithm, key);
	var descriptionCipher	= crypto.createCipher(algorithm, key);


	finance.name 			= nameCipher.update(finance.name, 'utf8', 'hex') + nameCipher.final('hex');
	finance.amount = amountCipher.update(finance.amount.toString(), 'utf8', 'hex') + amountCipher.final('hex');

	if(!!finance.description) {
		finance.description = descriptionCipher.update(finance.description, 'utf8', 'hex') + descriptionCipher.final('hex');
	}

	log.debug("Encrypted finance: ", finance);

	cb(null, finance);
}

function _decryptFinance(finance, cb) {
	log.debug("decryptFinance");
	var algorithm				= 'aes256'; // or any other algorithm supported by OpenSSL
	var key						= config.auth.aes.secret;
	var nameDecipher			= crypto.createDecipher(algorithm, key);
	var amountDecipher		= crypto.createDecipher(algorithm, key);
	var descriptionDecipher	= crypto.createDecipher(algorithm, key);

	log.debug("created deciphers");

	if(finance.name.length===32) {
		finance.name = nameDecipher.update(finance.name, 'hex', 'utf8') + nameDecipher.final('utf8');
	}

	log.debug("decoded name", finance.name);

	if(finance.amount.length === 32) {
		finance.amount = amountDecipher.update(finance.amount, 'hex', 'utf8') + amountDecipher.final('utf8');
	}

	log.debug("decoded amount", finance.amount);

	if(!!finance.description && finance.description.length === 32) {
		finance.description = descriptionDecipher.update(finance.description, 'hex', 'utf8') + descriptionDecipher.final('utf8');
	}
	log.debug("decoded desc", finance.description);

	cb(null, finance);
}


function _decryptFinanceSync(finance) {
	log.debug("decryptFinance");
	var algorithm				= 'aes256'; // or any other algorithm supported by OpenSSL
	var key						= config.auth.aes.secret;
	var nameDecipher			= crypto.createDecipher(algorithm, key);
	var amountDecipher		= crypto.createDecipher(algorithm, key);
	var descriptionDecipher	= crypto.createDecipher(algorithm, key);

	log.debug("created deciphers");


	log.debug('name length in chars', finance.name.length);
	if(finance.name.length >= 32 && finance.name.length % 2 === 0) {
		finance.name = nameDecipher.update(finance.name, 'hex', 'utf8') + nameDecipher.final('utf8');
	}

	log.debug("decoded name", finance.name);

	if(finance.amount.length === 32) {
		finance.amount = parseFloat(amountDecipher.update(finance.amount, 'hex', 'utf8') + amountDecipher.final('utf8'));
	}

	log.debug("decoded amount", finance.amount, typeof finance.amount);

	if(!!finance.description && finance.description.length === 32) {
		finance.description = descriptionDecipher.update(finance.description, 'hex', 'utf8') + descriptionDecipher.final('utf8');
	}
	log.debug("decoded desc", finance.description);

	return finance
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


			for (var i = 0; i < docs.length; i++) {
				var doc = docs[i].toObject();
				if (doc.interval === 0 && doc.duedate <= new Date()) {
					//result.splice(i, 1);
					continue;
				}

				var finance = _decryptFinanceSync(doc);

				if(typeof finance.amount === 'string') {
					finance.amount = parseFloat(finance.amount);
				}

				log.debug("Should have decrypted finance now", finance);
				//var finance=doc;


				//log.debug("Decrypted finance: ", finance);



				finance.time_until_next = _getTimeUntilDue(finance);

				log.debug("Doc with timeuntil", _getTimeUntilDue(finance));

				if (finance.type === 0) {
					data.income.push(finance);
					data.attrs.income.count++;
					data.attrs.income.total_per_month += _getTotalPerMonth(finance.interval, parseFloat(finance.amount));
				}
				if (finance.type === 1) {
					data.expenses.push(finance);
					data.attrs.expenses.count++;
					data.attrs.expenses.total_per_month += _getTotalPerMonth(finance.interval, parseFloat(finance.amount));
				}
			}

			res.send(200, data);
		} else {
			res.send(204);
		}
	}));
};

exports.encryptFinance = function(finance, cb) {
	_encryptFinance(finance, function(encrypted) {
		cb(null, encrypted);
	});
};

exports.decryptFinance = function(finance) {
	return _decryptFinanceSync(finance);
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
	req.assert('duedate', "date is missing").notEmpty();

	if (!!req.body.duedate) {
		//var duedate = req.body.date.replace(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, "$3-$2-$1");
		duedate = req.body.duedate;
	}


	// validate description if one is given to ensure it's length isn't greater than 140
	if (!!req.body.description) {
		req.assert('description', "description is too long").len(0, 140);
	}


	if (req.validationErrors()) {
		log.warn("ERROR", "Here be errors ", req.validationErrors());
		//model.error = req.validationErrors();
		res.send(400, req.validationErrors());
	} else {
		var finance = {
			user_id: userId,
			name: req.body.name,
			amount: req.body.amount,
			duedate: duedate,
			interval: req.body.interval,
			type: req.body.type,
			description: req.body.description || null
		};


 		_encryptFinance(finance, function(err, encryptedFinance) {
			Finance.create({
				user_id: userId,
				name: encryptedFinance.name,
				amount: encryptedFinance.amount,
				duedate: encryptedFinance.duedate,
				interval: encryptedFinance.interval,
				type: encryptedFinance.type,
				description: encryptedFinance.description
			}, ok(next, function(doc) {
				res.send(201, doc);
			}));
		});

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