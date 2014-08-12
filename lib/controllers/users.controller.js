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
var config		= require('../config/config.js');
var User		= mongoose.model('User');
var Recover	= mongoose.model('Recover');
var Verify		= mongoose.model('Verify');

function _getUserInfo(id, next) {

	var dfd = q.defer();

	User.findOne({_id: id}, ok(next, function(result) {
		dfd.resolve(result);
	}));

	return dfd.promise;
}


function _emailExists(email, next) {
	var dfd = q.defer();

	User.findOne({email: email}, ok(next, function(result) {
		if(result) {
			dfd.resolve(result);
		} else {
			dfd.resolve(false);
		}
	}));

	return dfd.promise;
}


function _verificationRequest(userId, email, cb) {
	var token = require('crypto').createHash('md5').update(new Date().getTime() + email).digest("hex");

	log.debug("Setting up user verification with token: %s", token);
	Verify.create({
		"user_id": userId,
		"email": email,
		"token": token
	}, function(err, verifyDoc) {

		if(err) {
			cb(err, null);
		} else {

			var transporter;
			var transporterOptions;

			transporter	= mail.createTransport();

			transporterOptions = {
				from: 'noreply@pennyjar.app',
				to: email,
				subject: 'Verify your email address',
				html: "<p>Hello, <br />" +
					"Thanks for creating an account on PennyJar. You should verify your account, to allow for account recovery.</p>" +
					"<a href=\"" + "http://ec2-54-72-241-251.eu-west-1.compute.amazonaws.com/" + "/app/#/verify/" + token + "\">Follow this link to verify your email address.</a>" +
					"<br />" +
					"<p>Or paste this link into your browser: " +
					"<br />" +
					"http://ec2-54-72-241-251.eu-west-1.compute.amazonaws.com/" + "/app/#/verify/" + token + "</p>"
			};

			transporter.sendMail(transporterOptions, function(err, info) {

				if(err) {
					cb(err, null);
				} else {
					log.info("Email verification message sent to %s", email);
					log.info("Message info:", info);
					cb(null, info);
				}
			});

		}
	});

}


exports.session = function(req, res, next) {
	// check for cookie
	if(!!req.signedCookies.saIdent) {
		_uid = req.signedCookies.saIdent;

		_getUserInfo(req.signedCookies.saIdent, next)
			.then(
				function(user) {
					//var success = success[0];
					var ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

					user.meta.last_log_ip = ip;
					user.meta.last_log_date = new Date();

					user.save();
					res.send(200, user);
				});
	} else {
		res.send(401, "ERR_NO_SESSION");
	}

	// check for existing user with cookie email
};

exports.login = function(req, res, next) {
	log.info("login function");


	// Validate inputted data
	req.assert('email', "Email is missing").notEmpty();
	req.assert('email', "Invalid email").isEmail();

	req.assert('password', "Password is missing").notEmpty();

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {
		// check user exists -> grab their info
		_emailExists(req.body.email, next)
			.then(function(data) {
				if(data) {

					log.info("User found");

					// rehash inputted password with stored salt -> compare with stored hash

					bcrypt.compare(req.body.password, data.passhash, ok(next, function(matches) {
						log.info("password matches?", matches);
						if(!matches) {
							log.debug('DEBUG:', "pass is bad");

							res.send(401, "ERR_BAD_PASS");
						} else {
							log.info("pass is ok");

							_uid = data._id;

							var token = jwt.sign(_uid, config.auth.jwt.secret);

							// create cookie/cookies
							res.cookie('saIdent', data._id, { maxAge: 1000*60*60*24*180, signed: true });
							res.cookie('saToken', token, { maxAge: 1000*60*60*24*180 });

							var ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

							data.meta.last_log_ip = ip;
							data.meta.last_log_date = new Date();

							res.send(200, data);

							data.save(ok(next, function() {
								log.debug("IP and log in date saved");
							}));
						}

					}));

				} else {
					res.send(401, "ERR_NO_USER");
				}
			});
	}
};

exports.logout = function(req, res) {
	// clear cookies
	if(!!req.signedCookies.saIdent) {
		res.cookie('saIdent', false);
		res.cookie('saToken', false);
		log.info("cookies", req.signedCookies);
		res.end();
	}

};

exports.register = function(req, res, next) {
	// Validate inputted data
	req.assert('email', "Email is missing").notEmpty();
	req.assert('email', "Invalid email").isEmail();

	req.assert('password', "Password is missing").notEmpty();
	req.assert('password', "Password is too short (min 6 characters)").len(6, 255);

	req.assert('username', "Username is missing").notEmpty();

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	}

	// check no user with email exists
	_emailExists(req.body.email, next)
		.then(function(exists) {
			var ip;
			var passhash;
			var salt;

			if(exists) {
				res.send(401, "ERR_USER_EXISTS");
			} else {

				salt		= bcrypt.genSaltSync(10);
				passhash	= bcrypt.hashSync(req.body.password, salt);
				ip			= req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

				User.create({
					email: req.body.email,
					username: req.body.username,
					passhash: passhash,
					meta: {
						created_ip: ip,
						last_log_ip: ip
					}

				}, ok(next, function(doc) {
					log.info("user created");


					_verificationRequest(doc._id, req.body.email, function(err, info) {
						if(err) {
							log.error("Error sending verification email", err);
						}
					});

					res.send(201, doc);

				}));
			}
		});

};


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
	} else {


		// make sure user exists
		User.findOne({email: req.body.email}, ok(next, function(user) {

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
				}, ok(next, function(doc) {
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
				}));
			}

		}));


	}
};

/**
 * When going to the reset-password page, authenticate the supplied token to
 * ensure it's valid and matches an existing user.
 *
 * @param req
 * @param res
 * @param next
 */
exports.resetPassAuth = function(req, res, next) {

	log.debug("Authorizing token");

	req.assert('token', "No token supplied").notEmpty();
	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {

		Recover.findOne({token: req.params.token}, ok(next, function(result) {
			if(result) {
				log.debug("Token found and is still active");
				res.send(200);
			} else {

				log.debug("Token not found");
				res.send(403, "ERR_BAD_TOKEN");
			}
		}));
	}
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

exports.changeDetails = function(req, res) {

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