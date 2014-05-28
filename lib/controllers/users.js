/**
 * Created by vivaldi on 23/02/14.
 */


var log			= require('npmlog');
var q			= require('q');
var moment		= require('moment');
var os			= require('os');
var mongoose	= require('mongoose');
var bcrypt		= require('bcryptjs');
var _uid		= false;
var User		= mongoose.model('User');

function _getUserInfo(id) {

	var dfd = q.defer();

	User.findOne({_id: id}, function(err, result) {
		if(err) dfd.reject(err);

		dfd.resolve(result);
	});

	return dfd.promise;
}


function _emailExists(email) {
	var dfd = q.defer();

	User.findOne({email: email}, function(err, result) {
		if(result) {
			dfd.resolve(result);
		} else {
			dfd.resolve(false);
		}
	});

	return dfd.promise;
}


exports.session = function(req, res) {

	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};

	// check for cookie

	if(!!req.signedCookies.saIdent) {

		_uid = req.signedCookies.saIdent;

		_getUserInfo(req.signedCookies.saIdent)
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
		res.send(410, "ERR_NO_SESSION");
		res.send(model);
	}

	// check for existing user with cookie email
};

exports.login = function(req, res) {
	log.info('Login', "login function");

	// Validate inputted data
	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};


	// Validate inputted data
	req.assert('email', "Email is missing").notEmpty();
	req.assert('email', "Invalid email").isEmail();

	req.assert('password', "Password is missing").notEmpty();
	req.assert('password', "Password is too short (min 6 characters)").len(6, 255);

	if(req.validationErrors()) {
		model.error = req.validationErrors();
		res.send(model);
	}

	// check user exists -> grab their info
	_emailExists(req.body.email)
		.then(function(data) {
			if(data) {
				log.info('Login', data);
				// rehash inputted password with stored salt -> compare with stored hash
				//log.info('DEBUG:', "does bcrypt compare sync work?", bcrypt.compareSync(req.body.password, data.passhash));
				bcrypt.compare(req.body.password, data.passhash, function(err, matches) {

					if(err) throw err;

					log.info('Login', "password matches?", matches);
					if(!matches) {
						//log.info('DEBUG:', "pass is bad", err);
						//model.error = "BAD_PASS";
						res.send(400, "ERR_BAD_PASS");
					} else {
						log.info('DEBUG', "pass is ok");

						_uid 			= data._id;

						// create cookie/cookies
						res.cookie('saIdent', data._id, { maxAge: 1000*60*60*24*180, signed: true });

						var ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

						data.meta.last_log_ip = ip;
						data.meta.last_log_date = new Date();

						data.save(function(err) {
							if(err) throw err;

							res.send(200, data);
						});
					}

				});

			} else {
				res.send(410, "ERR_NO_USER");
			}

		},
		function(reason) {
			model.error = reason;
			res.send(model);
		}
	);
};

exports.logout = function(req, res) {
	// clear cookies
	if(!!req.signedCookies.saIdent) {
		res.cookie('saIdent', false);
		log.info('DEBUG', "cookies", req.signedCookies);
		res.end();
	}

};

exports.register = function(req, res) {
	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};

	// Validate inputted data
	req.assert('email', "Email is missing").notEmpty();
	req.assert('email', "Invalid email").isEmail();

	req.assert('password', "Password is missing").notEmpty();
	req.assert('password', "Password is too short (min 6 characters)").len(6, 255);

	req.assert('username', "Username is missing").notEmpty();

	if(req.validationErrors()) {
		model.error = req.validationErrors();
		res.send(model);
	}

	// check no user with email exists
	_emailExists(req.body.email)
		.then(function(exists) {
			if(exists) {
				res.send(410, "ERR_USER_EXISTS");
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
				}, function(err, doc) {
					if(err) throw err;
					console.log("user created");
					res.send(201, doc);
				});
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