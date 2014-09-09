/**
 * Created by vivaldi on 22/02/14.
 */

'use strict';

var jwt			= require('jsonwebtoken');
var mongoose	= require('mongoose');
var ok			= require('okay');
var log			= require('log4js').getLogger('routes');
var iolog		= require('log4js').getLogger('SOCKET');
var config		= require('./config/config.js');
var finances 	= require('./controllers/finances.controller.js');
var timeline 	= require('./controllers/timeline.controller.js');
var users 		= require('./controllers/users.controller.js');
var UserModel	= mongoose.model('User');

function _verify(req, res, next) {

	if(req.header('Authorization')) {

		jwt.verify(req.header('Authorization'), config.auth.jwt.secret, function(err, decoded) {
			if(err) {
				log.warn("unauthorized access attempt");
				//res.status = 401;
				res.send(401, 'Unauthorized');
			} else {
				log.debug('Checking if user exists');
				UserModel.findOne({_id: decoded}, function(err, doc) {
					if(err) {
						log.debug('Nope');
						res.send(401, 'Unauthorized');
					} else {
						log.debug('Yup');
						next();
					}
				});
			}
		});
	} else {
		res.send(401, 'ERR_UNAUTHORIZED');
	}

}

module.exports = function(app, io) {
	// Server API Routes
	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.get('/app', function(req, res) {
		res.render('index.html');
	});

	// Finance API routes
	app.get('/api/finances', _verify, finances.getFinances);
	app.post('/api/finances', _verify, finances.addFinance);
	app.put('/api/finances/:id', _verify, finances.updateFinance);
	app.delete('/api/finances/:id', _verify, finances.removeFinance);

	// Timeline API routes
	app.get('/api/timeline', _verify, timeline.getTimeline);
	app.put('/api/timeline/modify', _verify, timeline.modifyTimelineItem);

	// User API routes
	app.get('/api/user/session', users.session);
	app.post('/api/user/register', users.register);
	app.post('/api/user/login', users.login);
	app.get('/api/user/logout', users.logout);
	app.post('/api/user/update', _verify, users.changeDetails);

	app.post('/api/user/passreset', users.requestPassReset);
	app.get('/api/user/passreset/:token', users.resetPassAuth);
	app.put('/api/user/passreset/:token', users.resetPass);

	app.put('/api/user/verify/:token', users.verifyEmail);

	app.delete('/api/user/testuser', users.deleteTestUser);




	// sockets go here

	/*io.set('authorization', function(req, callback) {

		iolog.debug('handshake token', req.query);
		if(req.hasOwnProperty('query')) {

			jwt.verify(req.query.token, config.auth.jwt.secret, function (err, decoded) {
				if (err) {
					iolog.warn("unauthorized access attempt");
					//res.status = 401;
					return false;
				} else {
					iolog.debug('Checking if user exists');
					UserModel.findOne({_id: decoded}, function (err, doc) {
						if (err) {

							iolog.warn('unauthorized');
							return false;
						} else {

							iolog.warn('unauthorized');
							return callback(null, true);
						}
					});
				}
			});
		}
	});*/


	var sioJwt = require('socketio-jwt');
	/*io.set('authorization', sioJwt.authorize({
		secret: config.auth.jwt.secret,
		handshake: true
	}));*/

	io.use(sioJwt.authorize({
		secret: config.auth.jwt.secret,
		handshake: true
	}));



	var room = null;

	io.on('connection', function(socket) {
		iolog.debug('connected to socket.io', socket.handshake.query.token);
		room = jwt.decode(socket.handshake.query.token);
		socket.join(room);

		io.to(room).emit('ready');


		socket.on('finances', function() {

			iolog.debug('got request for finances');

			finances.getFinances(socket.handshake.query.token, function(err, finance) {
				io.to(room).emit('finance', finance);

			});

			/*var FinancesModel = mongoose.model('Finance');

			FinancesModel.find({disabled: false}, function(err, results) {
				if(err) {
					throw err;
				}

				if(results) {
					results.forEach(function(finance) {
						io.to(room).emit('finance', finance);
					});
				}
			});*/
		});

	});








	// test JWT

	app.get('/api/test/jwt', _verify, function(req, res, next) {
		var _uid = jwt.decode(req.header('Authorization'));
		UserModel.findOne({_id: _uid}, ok(next, function(user) {
			if(user) {
				res.send(200, user);
			} else {
				res.send(403, "ERR_BAD_TOKEN");
			}
		}));
	});
};