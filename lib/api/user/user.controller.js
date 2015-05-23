/**
 * Created by vivaldi on 23/02/14.
 */

'use strict';

var log		= require('log4js').getLogger('user controller');
var q			= require('q');
var moment	= require('moment');
var os			= require('os');
var mongoose	= require('mongoose');
var bcrypt		= require('bcryptjs');
var ok			= require('okay');
var mail		= require('nodemailer');
var jwt			= require('jsonwebtoken');
var _uid		= false;
var config		= require('../../config/env');

var userUtil	= require('../../utils/user.util');

var Verify = require('../../models/verifyAccount.model');
var User = require('../../api/user/user.model');
var Recover = require('../../models/accountRecover.model');



exports.verifyEmail = function(req, res, next) {
	Verify.findOne({token: req.params.token}, ok(next, function(verifyDoc) {
		if(!verifyDoc) {
			res.send(403, 'ERR_BAD_TOKEN');
		} else {

			User.findById(verifyDoc.user_id, ok(next, function(user) {
				if(user) {
					user.attrs.verified = true;
					user.save(ok(next, function() {
						log.debug('User %s verified', user.email);
					}));
				}
			}));

			res.send(200);
		}
	}));
};

exports.requestPassReset = function(req, res, next) {

	log.debug("Account recovery request");

	req.assert('email', "Email is missing").notEmpty();
	req.assert('email', "Invalid email").isEmail();

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
		return;
	}


	// make sure user exists
	User.findOne({email: req.body.email}, function(user) {

		if(user) {

			log.debug("Requested email address exists");

			// create token for link varification
			var token	= require('crypto').createHash('md5').update(new Date().getTime() + req.body.email).digest("hex");
			var ip		= req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

			log.debug("Created token: %s", token);

			// add item in database for account recovery
			Recover.create({
				"email": req.body.email,
				"token": token,
				"request_ip": ip
			}, function(doc) {
				log.debug("Saved recovery request");
				// all created, now send an email to the requester

				var transporter = mail.createTransport();
				var transporterOptions = {
					from: 'noreply@pennyjar.app',
					to: req.body.email,
					subject: 'Account recovery request',
					html: "Hello, \n\r" +
						"<p>looks like you have requested to reset your account password.</p>" +
						"<a href=\"" + "http://ec2-54-72-241-251.eu-west-1.compute.amazonaws.com/" + "/app/#/recover/" + token + "\">Follow this link to recover your account</a> \r\n" +
						"<br />" +
						"<p>Or paste this link into your browser: " +
						"<br />" +
						"http://ec2-54-72-241-251.eu-west-1.compute.amazonaws.com/" + "/app/#/recover/" + token + "</p>"
				};

				transporter.sendMail(transporterOptions, ok(next, function(info) {
					log.info("Password recovery sent to %s", req.body.email);
					log.info("Message info:", info);
				}));

				res.send(200);
			});
		}

	});


};

/**
 * When going to the reset-password page, authenticate the supplied token to
 * ensure it's valid and matches an existing user.
 *
 * @param req
 * @param res
 */
exports.resetPassAuth = function(req, res) {

	log.debug("Authorizing token");

	req.assert('token', "No token supplied").notEmpty();
	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
		return;
	}

	Recover.findOne({token: req.params.token}, function(result) {
		if(result) {
			log.debug("Token found and is still active");
			res.send(200);
			return;
		}

		log.debug("Token not found");
		res.send(403, "ERR_BAD_TOKEN");
	});

};

exports.resetPass = function(req, res, next) {


	req.assert('token', "No token supplied").notEmpty();
	req.assert('password', "Password is missing").notEmpty();
	req.assert('password', "Password is too short (min 6 characters)").len(6, 255);

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {

		log.debug("Generating new passhash");
		bcrypt.genSalt(10, ok(next, function(salt) {
			bcrypt.hash(req.body.password, salt, ok(next, function(passhash) {

				log.debug("Getting the email associated with token");
				Recover.findOne({token: req.params.token}, ok(next, function(passRecoverDoc) {

					if(passRecoverDoc) {

						log.debug("Getting relevant user");
						User.findOne({email: passRecoverDoc.email}, ok(next, function(user) {
							user.passhash = passhash;

							log.debug("Saving user's new passhash");
							user.save(ok(next, function() {


								log.debug("Removing old pass reset request");
								Recover.remove({_id: passRecoverDoc._id}, ok(next, function() {
									log.debug("used pass reset request removed");
								}));

								log.debug("Everything worked!");
								res.send(200);
							}));
						}));
					} else {
						res.send(403, "ERR_BAD_TOKEN");
					}
				}));

			}));
		}));

	}

};

exports.changeDetails = function(req, res, next) {

};

exports.deleteTestUser = function(req, res, next) {
	User.findOne({email: "email@email.com"}, function(err, result) {
		if(result) {
			User.remove({email: "email@email.com"}, ok(next, function() {
				res.send(204);
			}));
		}
	});
};

exports.ident = function() {
	return _uid;
};