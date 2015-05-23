/**
 * Created by Zaccary on 23/05/2015.
 */

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mail = require('nodemailer');
var Joi = require('joi');
var log = require('log4js').getLogger('auth controller');

var config = require('../../config/env');
var userUtil = require('../../utils/user.util');
var User = require('../user/user.model');
var userController = require('../user/user.controller');

var Verify = require('../../models/verifyAccount.model');


function _verificationRequest(userId, email, cb) {
	"use strict";
	var token = require('crypto').createHash('md5').update(new Date().getTime() + email).digest("hex");

	log.debug("Setting up user verification with token: %s", token);
	Verify.create({
		"user_id": userId,
		"email": email,
		"token": token
	}, function(err, verifyDoc) {

		if(err) {
			cb(err, null);
			return;
		}

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
				return;
			}
			log.info("Email verification message sent to %s", email);
			log.info("Message info:", info);
			cb(null, info);
		});
	});

}

exports.getLoginForm = function(req, res) {
	"use strict";
	res.render('login.jade');
};

exports.session = function(req, res) {
	"use strict";

	// check for cookie
	if(!req.signedCookies.saIdent) {
		res.redirect('/login');
		return;
	}

	userUtil.getUserInfo(req.signedCookies.saIdent, function(err, user) {

		if(err) {
			log.error(err);
		}

		if(!user) {
			log.warn('no user found');
			//res.status(401).send("ERR_NO_SESSION");
			res.redirect('/login');
			return;
		}

		//var success = success[0];
		var ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

		user.meta.last_log_ip		= ip;
		user.meta.last_log_date	= new Date();

		user.save();
		res.status(200).send(user);
	});


};

exports.login = function(req, res, next) {
	"use strict";
	log.info("login function");
	var _uid;
	var token;
	var ip;

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
		return;
	}

	// check user exists -> grab their info
	userUtil.emailExists(req.body.email, function(err, data) {

		if(!data) {
			res.send(401, "ERR_NO_USER");
			return;
		}

		log.info("User found");

		// rehash inputted password with stored salt -> compare with stored hash

		bcrypt.compare(req.body.password, data.passhash, function(err, matches) {
			log.info("password matches?", matches);
			if(!matches) {
				log.debug('DEBUG:', "pass is bad");
				res.status(401).send("ERR_BAD_PASS");
				return;
			}

			log.info("pass is ok");

			_uid = data._id;

			token = jwt.sign(_uid, config.auth.jwt.secret);

			// create cookie/cookies
			res.cookie('saIdent', data._id, { maxAge: 1000*60*60*24*180, signed: true });
			res.cookie('saToken', token, { maxAge: 1000*60*60*24*180 });

			ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

			data.meta.last_log_ip = ip;
			data.meta.last_log_date = new Date();


			data.save(function() {
				data.toObject();
				data.token = token;
				log.debug("IP and log in date saved", data);
				res.send(200, {
					"token": token,
					"_id": data._id
				});
			});

		});
	});
};

exports.logout = function(req, res) {
	// clear cookies
	if(!!req.signedCookies.saIdent) {
		//res.cookie('saIdent', null);
		res.clearCookie('saIdent');
		res.clearCookie('saToken');
		//res.cookie('saToken', null);
		log.info("cookies", req.signedCookies);
		res.end();
	}

};

exports.create = function(req, res) {
	"use strict";
	// Validate inputted data

	var schema = Joi.object().keys({
		username: Joi.string().alphanum().required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required()
	});

	Joi.validate(req.body, schema, {abortEarly: false}, function(err, validated) {
		if(err) {
			res.send(400, err);
			return;
		}

		// check no user with email exists
		userUtil.emailExists(validated.email, function(err, exists) {
			var ip;

			if(exists) {
				res.send(401, "ERR_USER_EXISTS");
				return;
			}

			bcrypt.genSalt(10, function(err, salt) {
				bcrypt.hash(validated.password, salt, function(err, passhash) {
					ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
					User.create({
						email: validated.email,
						username: validated.username,
						passhash: passhash,
						meta: {
							created_ip: ip,
							last_log_ip: ip
						}

					}, function(err, doc) {
						log.info("user created");

						if(err) {
							res.status(500).send();
							return;
						}


						_verificationRequest(doc._id, req.body.email, function(err, info) {
							if(err) {
								log.error("Error sending verification email", err);
							}
						});

						res.send(201, doc);

					});
				});
			});

		});
	});



};

