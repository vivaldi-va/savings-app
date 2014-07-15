/**
 * Created by vivaldi on 23/02/14.
 */


var log			= require('log4js').getLogger('user controller');
var q			= require('q');
var moment		= require('moment');
var os			= require('os');
var mongoose	= require('mongoose');
var bcrypt		= require('bcryptjs');
var ok			= require('okay');
var _uid		= false;
var User		= mongoose.model('User');

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
	req.assert('password', "Password is too short (min 6 characters)").len(6, 255);

	if(req.validationErrors()) {
		res.send(400, req.validationErrors());
	} else {
		// check user exists -> grab their info
		_emailExists(req.body.email, next)
			.then(function(data) {
				if(data) {
					log.info("User found");
					// rehash inputted password with stored salt -> compare with stored hash
					//log.info('DEBUG:', "does bcrypt compare sync work?", bcrypt.compareSync(req.body.password, data.passhash));
					bcrypt.compare(req.body.password, data.passhash, ok(next, function(matches) {
						log.info("password matches?", matches);
						if(!matches) {
							//log.info('DEBUG:', "pass is bad", err);
							//model.error = "BAD_PASS";
							res.send(400, "ERR_BAD_PASS");
						} else {
							log.info("pass is ok");

							_uid = data._id;

							// create cookie/cookies
							res.cookie('saIdent', data._id, { maxAge: 1000*60*60*24*180, signed: true });

							var ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

							data.meta.last_log_ip = ip;
							data.meta.last_log_date = new Date();

							data.save(ok(next, function() {
								res.send(200, data);
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
			if(exists) {
				res.send(401, "ERR_USER_EXISTS");
			} else {
				var salt 		= bcrypt.genSaltSync(10);
				var passhash 	= bcrypt.hashSync(req.body.password, salt);
				var ip 			= req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

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
					res.send(201, doc);
				}));
			}
		});

};


exports.resetPass = function(req, res) {

};

exports.changeDetails = function(req, res) {

};

exports.ident = function() {
	return _uid;
};