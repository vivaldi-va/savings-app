/**
 * Created by vivaldi on 11/09/2014.
 */

'use strict';

angular.module('Savings.Services')
	.factory('SocketService', function($log, $cookies, $rootScope, $interval) {

		var socket;
		$rootScope.transport = false;

		$rootScope.$watch('transport', function(newTransport, oldTransport) {

			$log.debug("SOCKET", "Old transport:", oldTransport, "New transport", newTransport);

			if(newTransport.connected) {
				//_connect(function(){});
				$log.debug('SOCKET', "Transport is connected");

				_heartBeat();
				socket.on('echo', function(time) {
					var d = new Date();
					time = new Date(time);
					$log.debug('PING', Math.abs(time.getTime() - d.getTime()) + 'ms');
				});
			}

			if(newTransport.connecting) {
				$log.debug('SOCKET', "Transport is trying to reconnect");
			}

			if(newTransport.disconnected) {
				$log.warn('SOCKET', "Transport disconnected");
			}
		});



		function _heartBeat() {
			if($rootScope.transport.connected) {
				$interval(function(){

					//$log.debug("SOCKET", "Transport status: %s", !!$rootScope.transport.connected ? 'Connected' : 'Disconnected');

					if($rootScope.transport.disconnected) {
						_connect(function() {
							$log.warn('SOCKET', "Socket disconnected, reconnecting");
						});
					}

					if(!$rootScope.transport) {
						$log.warn('SOCKET', "Socket disappeared, reconnecting");
						_connect(function() {
						});
					}

					if($rootScope.transport.connected) {
						socket.emit('heartbeat');
					}
				}, 10000);
			}
		}



		function _connect(cb) {

			$log.debug('Savings.Services.SocketService.connect()');


			$log.debug('sending socket.io handshake with token: %s', $cookies.saToken);
			socket = io('ws://localhost', { query: "token=" + $cookies.saToken });

			socket.on('connect', function() {
				$log.info('SOCKET', "connected to websocket and joined room probably");
				$rootScope.transport = socket;
				$rootScope.$apply();
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