/**
 * Created by vivaldi on 11/09/2014.
 */

'use strict';

angular.module('Savings.Services')
	.factory('SocketService', function($log, $cookies, $rootScope, $interval, $timeout) {

		var socket;
		var _emitterQueue 	= [];
		var _pingNum		= 0;
		$rootScope.transport = false;

		$rootScope.$watch('transport', function(newTransport, oldTransport) {

			$log.debug("SOCKET", "Old transport:", oldTransport, "New transport", newTransport);

			if(newTransport.connected) {
				//_connect(function(){});
				$log.debug('SOCKET', "Transport is connected");

				_heartBeat();
				socket.on('echo', function(time) {
					// Only log pings every 10th echo to avoid spamorama
					if(_pingNum % 10 === 0) {
						var d = new Date();
						time = new Date(time);
						$log.debug('PING', Math.abs(time.getTime() - d.getTime()) + 'ms');
					}

					_pingNum++;
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
						_connect();
					}

					// emit a heartbeat to ensure connection to server
					// also invokes sending all queued events every second,
					// if there are any
					if($rootScope.transport.connected) {
						socket.emit('heartbeat');
						_sendQueuedEvent();

					}
				}, 1000);
			}
		}


		/**
		 * Send all events from the event queue, if there are any
		 * @private
		 */
		function _sendQueuedEvent() {

			if(_emitterQueue.length > 0) {
				$log.debug('SOCKET', "Savings.Services.SocketService.sendQueuedEvent()");
				var event = _emitterQueue.shift();

				socket.emit(event.event, event.msg);
				_sendQueuedEvent();
			}
		}

		function _connect(cb) {

			cb = cb || null;
			$log.debug('Savings.Services.SocketService.connect()');


			$log.debug('sending socket.io handshake with token: %s', $cookies.saToken);
			socket = io('http://localhost', { query: "token=" + $cookies.saToken });

			socket.on('connect', function() {

				$log.debug(socket);
				$log.info('SOCKET', "connected to websocket and joined room probably");
				$rootScope.transport = socket;
				$rootScope.$apply();
				cb(null, true);
			});
		}

		function _getSocket() {
			return socket;
		}

		/**
		 * Adds an event to the event queue,
		 * this is required to ensure that events survive failures in connection.
		 * Once connection is reestablished, all queued events will be send sequentially
		 * on the next tick.
		 *
		 * @param event
		 * @param msg
		 * @private
		 */
		function _send(event, msg) {
			$log.debug('Savings.Services.SocketService.send()');
			var obj = {
				"event": event,
				"msg": msg
			};

			$log.debug(obj);
			msg = msg || null;
			_emitterQueue.push(obj);
		}

		return {
			'getSocket': _getSocket,
			'connect': _connect,
			'send': _send
		};
	});