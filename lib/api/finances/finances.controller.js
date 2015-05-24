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
var user			= require('./../user/user.controller.js');
var jwt				= require('jsonwebtoken');
var Joi				= require('joi');
var mongoose		= require('mongoose');
var config			= require('../../config/env');
var Finance			= require('./finances.model');

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


	if(finance.interval === 0 && finance.duedate < new Date()) {
		diff = "Already passed";
	} else {

		//log.debug("interval", interval);

		while(due.isBefore(today, 'day')) {
			due.add(interval.interval, interval.interval_count);
		}
		//log.debug("due", due.calendar());

		if(due.diff(today, 'days') > 0) {
			diff = due.fromNow();
			//log.debug("Next due date for %s is %s", finance.name, diff);
		}
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
//log.debug("Encrypted finance: ", finance);

	cb(null, finance);
}

function _decryptFinance(finance, cb) {//log.debug("decryptFinance");
	var algorithm				= 'aes256'; // or any other algorithm supported by OpenSSL
	var key						= config.auth.aes.secret;
	var nameDecipher			= crypto.createDecipher(algorithm, key);
	var amountDecipher		= crypto.createDecipher(algorithm, key);
	var descriptionDecipher	= crypto.createDecipher(algorithm, key);
//log.debug("created deciphers");

//log.debug('name length in chars', finance.name.length);
	if(finance.name.length >= 32 && finance.name.length % 2 === 0) {
		finance.name = nameDecipher.update(finance.name, 'hex', 'utf8') + nameDecipher.final('utf8');
	}
//log.debug("decoded name", finance.name);

	if(finance.amount.length === 32) {
		finance.amount = parseFloat(amountDecipher.update(finance.amount, 'hex', 'utf8') + amountDecipher.final('utf8'));
	}
//log.debug("decoded amount", finance.amount, typeof finance.amount);

	if(!!finance.description && finance.description.length === 32) {
		finance.description = descriptionDecipher.update(finance.description, 'hex', 'utf8') + descriptionDecipher.final('utf8');
	}//log.debug("decoded desc", finance.description);
	cb(null, finance);
}


function _decryptFinanceSync(finance) {//log.debug("decryptFinance");
	var algorithm				= 'aes256'; // or any other algorithm supported by OpenSSL
	var key						= config.auth.aes.secret;
	var nameDecipher			= crypto.createDecipher(algorithm, key);
	var amountDecipher			= crypto.createDecipher(algorithm, key);
	var descriptionDecipher		= crypto.createDecipher(algorithm, key);

	if(finance.name.length >= 32 && finance.name.length % 2 === 0) {
		finance.name = nameDecipher.update(finance.name, 'hex', 'utf8') + nameDecipher.final('utf8');
	}

	if(finance.amount.length === 32) {
		finance.amount = parseFloat(amountDecipher.update(finance.amount, 'hex', 'utf8') + amountDecipher.final('utf8'));
	}


	if(!!finance.description && finance.description.length === 32) {
		finance.description = descriptionDecipher.update(finance.description, 'hex', 'utf8') + descriptionDecipher.final('utf8');
	}//log.debug("decoded desc", finance.description);

	return finance;
}

exports.getFinances = function (token, cb) {

	log.info("getting finances for token %s", token);
	var userId	= token;

	Finance.find({user_id: userId}, function(err, docs) {

		if(err) {
			log.error(err);
			cb(err);
		}


		for (var i = 0; i < docs.length; i++) {
			var doc = docs[i].toObject();

			_decryptFinance(doc, function(err, finance) {

				log.info(finance);

				if(typeof finance.amount === 'string') {
					finance.amount = parseFloat(finance.amount);
				}

				finance.time_until_next = _getTimeUntilDue(finance);


				cb(null, finance);
			});
		}
	});
};

exports.encryptFinance = function(finance, cb) {
	_encryptFinance(finance, function(encrypted) {
		cb(null, encrypted);
	});
};

exports.decryptFinance = function(finance, cb) {
	return _decryptFinanceSync(finance);
};

exports.intFinances = function(userId, next) {
	var dfd = q.defer();
	Finance.find({user_id: userId}, ok(next, function(docs) {
		dfd.resolve(docs);
	}));
	return dfd.promise;
};

exports.addFinance = function (token, finance, cb) {
	log.info("posting a finance");

	var userId = token;

	var schema = Joi.object().keys({
		name: Joi.string().min(1).max(40).required(),
		amount: Joi.number().required(),
		duedate: Joi.date().required(),
		interval: Joi.number().integer().required(),
		type: Joi.number().integer().min(0).max(1).required(),
		description: Joi.string().min(0).max(150).allow('').allow(null),
		active: Joi.boolean()

	});

	Joi.validate(finance, schema, function (err, value) {
		if(err) {
			log.warn("Finance is of invalid format", err);
			cb(err);
		} else {
			log.debug("Finance is valid");

			// Convert currency to proper float decimal format.
			if (finance.amount) {
				finance.amount = finance.amount.replace(',', '.');
			}

			// encrypt the finance before saving it to the DB
			_encryptFinance(finance, function(err, encryptedFinance) {
				Finance.create({
					user_id: userId,
					name: encryptedFinance.name,
					amount: encryptedFinance.amount,
					duedate: encryptedFinance.duedate,
					interval: encryptedFinance.interval,
					type: encryptedFinance.type,
					description: encryptedFinance.description
				}, function(err, doc) {

					if(err) {
						log.error("Error saving finance!", err);
						cb(err);
					} else {
						log.debug("Created and encrypted finance", finance);
						_decryptFinance(doc, function(err, decryptedFinance) {
							cb(null, decryptedFinance);
						});
					}

				});
			});

		}
	});

};

exports.updateFinance = function (finance, cb) {
	log.info("PUT request for finance id " + finance._id + " received");

	var schema = Joi.object().keys({
		_id: Joi.any().required(),
		name: Joi.string().min(1).max(40).required(),
		amount: Joi.number().required(),
		duedate: Joi.date().required(),
		interval: Joi.number().integer().required(),
		type: Joi.number().integer().min(0).max(1).required(),
		description: Joi.string().min(0).max(150).allow(''),
		active: Joi.boolean()

	});


	Joi.validate(finance, schema, {allowUnknown: true}, function (err, validated) {
		if(err) {
			cb(err);
		} else {

			_encryptFinance(validated, function(err, encryptedFinance) {
				Finance.findOne({_id: validated._id}, function(err, doc) {

					if(err) {
						cb(err);
					} else {

						doc.name		= encryptedFinance.name;
						doc.amount		= encryptedFinance.amount;
						doc.duedate		= encryptedFinance.duedate;
						doc.description = encryptedFinance.description;
						doc.interval	= encryptedFinance.interval;

						doc.save(function(err) {
							if(err) {
								cb(err);
							} else {
								_decryptFinance(finance, function(err, decryptedFinance) {
									if(err) {
										cb(err);
									} else {
										cb(null, decryptedFinance);
									}
									//cb(null, true);
								});
							}
						});
					}
				});
			});

		}
	});



};

exports.removeFinance = function (finance, cb) {
	log.info("DELETE request for finance id " + finance._id + " received");
	Finance.findOne({_id: finance._id}, function(err, doc) {
		doc.disabled = true;
		doc.disabled_date = new Date();
		doc.save(function(err) {
			if(err) {
				cb(err);
			}
			cb(null, true);
		});
	});

};