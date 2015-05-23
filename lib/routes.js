/**
 * Created by vivaldi on 22/02/14.
 */

'use strict';

var log			= require('log4js').getLogger('routes');

var Auth		= require('./api/auth');
var Finances	= require('./api/finances');
var Timeline	= require('./api/timeline');
var User		= require('./api/user');

var verify = require('./utils/verify.util');

module.exports = function(app) {
	// Server API Routes
	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.get('/app', function(req, res) {
		res.render('index.html');
	});

	app.use('/api/auth', Auth);
	app.use('/api/finances', verify, Finances);
	app.use('/api/timeline', verify, Timeline);
	app.use('/api/user', verify, User);


	// Finance API routes


	// Timeline API routes

	// User API routes







	// test JWT

/*	app.get('/api/test/jwt', _verify, function(req, res, next) {
		var _uid = jwt.decode(req.header('Authorization'));
		UserModel.findOne({_id: _uid}, ok(next, function(user) {
			if(user) {
				res.send(200, user);
			} else {
				res.send(403, "ERR_BAD_TOKEN");
			}
		}));
	});*/
};