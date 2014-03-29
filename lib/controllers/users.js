/**
 * Created by vivaldi on 23/02/14.
 */


var log		= require('npmlog');
var q		= require('q');
var moment	= require('moment');
var os		= require('os');
var mysql	= require('mysql');
var bcrypt	= require('bcryptjs');
var dbConf	= require('../conf.json');
var db 		= mysql.createConnection(dbConf.db);
var _uid	= false;

function _getUserInfo(id) {

	var dfd = q.defer();
	var sql	= "";
	log.info('DEBUG:', "getting user info");

	if(typeof id === 'number') {
		sql = 'SELECT id, email, username, passhash, salt, verified FROM users WHERE id=' + id;
	} else {
		sql = 'SELECT id, email, username, passhash, salt, verified FROM users WHERE email="' + id + '"';
	}

	db.connect();
	db.query(sql,
		function(err, result) {
			if(err) {
				log.info('ERR:', "Getting user info failed", err);
				dfd.reject(err);
			}

			//log.info('DEBUG:', "Get user info result", result);

			if(!result || !result.length) {
				log.info('NOTE:', "No results found for user ", id);
				dfd.reject('NO_RESULTS');
			}

			dfd.resolve(result);
		}
	);

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

		_getUserInfo(parseInt(req.signedCookies.saIdent))
			.then(
				function(success) {

					var ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

					db.query('UPDATE users SET last_log_date = CURRENT_TIMESTAMP, last_log_ip = "' + ip + '" WHERE id = ' + _uid,
						function(err, result) {
							if(err) throw err;

							if(!result || result.length === 0) {
								model.error = "NO_USER";
								log.warn('ERR', "Could not find user to update info. UID: " + _uid);
								db.end();
								res.json(model);
							}

							log.info('DEBUG:', "updated login date and IP");
						});

						model.success 	= true;
						model.data 		= {
							"email": success.email,
							"username": success.username
						};

						db.end();
						res.send(model);

				},
				function(reason) {
					if(reason === "NO_RESULTS") {
						model.error = "NO_RESULTS";
					} else {
						log.error('ERR', "Getting user info failed, server error", reason);
						model.error = "SERVER_ERROR";
					}
					db.end();
					res.send(model);
				});
	} else {
		model.message = "NO_SESSION";
		res.send(model);
	}

	// check for existing user with cookie email
};

exports.login = function(req, res) {
	var user = {
		"email": null,
		"username": null
	};

	// Validate inputted data
	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};


	// Validate inputted data
	req.checkBody('email', "Email is missing").notEmpty();
	req.assert('email', "Invalid email").isEmail();

	req.checkBody('password', "Password is missing").notEmpty();
	req.assert('password', "Password is too short (min 6 characters)").len(6, 255);

	if(req.validationErrors()) {
		model.error = req.validationErrors();
		res.send(model);
	}

	// check user exists -> grab their info
	_getUserInfo(req.body.email)
		.then(function(data) {
			data = data[0];
			// rehash inputted password with stored salt -> compare with stored hash
			//log.info('DEBUG:', "does bcrypt compare sync work?", bcrypt.compareSync(req.body.password, data.passhash));
			bcrypt.compare(req.body.password, data.passhash, function(err) {


				if(err) {
					log.info('DEBUG:', "pass is bad", err);
					model.error = "BAD_PASS";
					res.send(model);
				}



				log.info('DEBUG', "pass is ok");

				user.email 		= data.email;
				user.username 	= data.username;
				_uid 			= data.id;

				// create cookie/cookies
				res.cookie('saIdent', data.id, { maxAge: 1000*60*60*24*180, signed: true });

				var ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

				db.query('UPDATE users SET last_log_date = CURRENT_TIMESTAMP, last_log_ip = "' + ip + '" WHERE id = ' + data.id,
					function(err, result) {
						if(err) throw err;

						if(!result || result.length === 0) {
							model.error = "NO_USER";
							log.warn('ERR', "Could not find user to update info. UID: " + _uid);
							res.json(model);
						}

						db.end();
					});

				model.success 	= true;
				model.data 		= {"user": user};

				// done.
				res.send(model);
			});

		},
		function(reason) {
			model.error = reason;
			res.send(model);
		}
	);
};

exports.logout = function(req, res) {
	// clear cookies
};

exports.register = function(req, res) {
	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};

	log.info('DEBUG', "User register info stuffs", req.body);

	// Validate inputted data
	req.checkBody('email', "Email is missing").notEmpty();
	req.assert('email', "Invalid email").isEmail();

	req.checkBody('password', "Password is missing").notEmpty();
	req.assert('password', "Password is too short (min 6 characters)").len(6, 255);

	req.checkBody('username', "Username is missing").notEmpty();

	if(req.validationErrors()) {
		model.error = req.validationErrors();
		res.send(model);
	}

	// check no user with email exists
	_getUserInfo(req.body.email)
		.then(
			function(exists) {
				log.info('DEBUG:', "email exists", exists);
				model.error = 'EMAIL_EXISTS';
				res.send(model);
			},
			function(none) {
				var salt 		= bcrypt.genSaltSync(10);
				var passhash 	= bcrypt.hashSync(req.body.password, salt);
				var ip 			= req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
				var sql 		=
					'INSERT INTO users (id, email, username, passhash, salt, date_created, created_ip, verified, invited_by, last_log_date, last_log_ip)' +
				'VALUES (NULL, "'+req.body.email+'", "'+req.body.username+'", "'+passhash+'", "'+salt+'", CURRENT_TIMESTAMP, "'+ip+'", 0, NULL, CURRENT_TIMESTAMP, "'+ip+'")';


				log.info('DEBUG:', "insert SQL", sql);
				db.query(sql, function(err) {
						if(err) {
							log.warn('ERR', "Adding user failed", err);
							model.error = err;
							res.send(model);
						}
						log.info('DEBUG:', "Adding user succeeded probably");

						model.success = true;
						db.end();
						res.send(model);
					});


			});
};


exports.resetPass = function(req, res) {

};

exports.changeDetails = function(req, res) {

};

exports.ident = function() {
	return _uid;
};