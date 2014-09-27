/**
 * Created by vivaldi on 27/09/2014.
 */

'use strict';

var jwt			= require('jsonwebtoken');
var sioJwt		= require('socketio-jwt');
var config		= require('./config');
var log		= require('log4js').getLogger('socket');

function _onConnect(socket, socketio) {
	require('../sockets/finances.socket').register(socket, socketio);
	require('../sockets/timeline.socket').register(socket, socketio);
}

module.exports = function(socketio) {
	socketio.use(sioJwt.authorize({
		secret: config.auth.jwt.secret,
		handshake: true
	}));

	socketio.on('connection', function(socket) {
		var room = jwt.decode(socket.handshake.query.token);
		log.debug('connected to socket.io', room);
		socket.join(room);

		_onConnect(socket, socketio);

		socket.on('heartbeat', function() {
			socket.emit('echo', new Date());
		});

	});
};