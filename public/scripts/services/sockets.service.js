/**
 * Created by vivaldi on 11/09/2014.
 */

'use strict';

angular.module('Savings.Services')
	.factory('SocketService', function($log, $cookies, $rootScope) {

		var socket;
		$rootScope.transport = false;

		function _connect(cb) {
			$log.debug('Savings.Services.SocketService.connect()');


			$log.debug('sending socket.io handshake with token: %s', $cookies.saToken);
			socket = io('http://localhost', { query: "token=" + $cookies.saToken });

			socket.on('connect', function() {
				$log.info('SOCKET', "connected to websocket and joined room probably");
				$rootScope.transport = socket;
				cb(null, true);
			});

		}

		function _getSocket() {
			return socket;
		}

		return {
			'getSocket': _getSocket,
			'connect': _connect
		};
	});