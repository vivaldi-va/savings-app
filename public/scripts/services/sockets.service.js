/**
 * Created by vivaldi on 11/09/2014.
 */

'use strict';

angular.module('Savings.Services')
	.factory('SocketService', function($log, $cookies, $q) {

		$log.info("SERVICE", "Socket Service");
		function _connect(cb) {
/*
			var dfd = $q.defer();


			$log.debug('sending socket.io handshake with token: %s', $cookies.saToken);
			var socket = io('http://localhost', { query: "token=" + $cookies.saToken });

			socket.on('ready', function() {
				$log.info('SOCKET', "connected to websocket and joined room probably");
				dfd.resolve();
			});

			return dfd.promise;*/

			$log.debug('sending socket.io handshake with token: %s', $cookies.saToken);
			var socket = io('http://localhost', { query: "token=" + $cookies.saToken });

			socket.on('ready', function() {
				$log.info('SOCKET', "connected to websocket and joined room probably");
				cb(null, true);
			});

		}

		return {
			'connect': _connect
		};
	});