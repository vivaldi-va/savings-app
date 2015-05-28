
'use strict';

var jwt				= require('jsonwebtoken');
var FinanceModel	= require('mongoose').model('Finance');
var financeCtrl	= require('./finances.controller.js');
var timelineCtrl	= require('../timeline/timeline.controller.js');
var log			= require('log4js').getLogger('socket::finance');

log.debug("Savings.Server.Sockets.Finances");

exports.register = function(socket, io) {


	var room = jwt.decode(socket.handshake.query.token);

	var emitError = function(error) {
		socket.emit('err', error);
	};


	socket.on('finance::load', function (event) {

		//log.debug('got request for finances for room %s', room);

		//log.debug('Event ID', event);

		financeCtrl.getFinances(room, function (err, finance) {
			if(!finance.disabled &&
				!(finance.interval === 0 && finance.duedate <= new Date())) {
				socket.emit('finance::get', finance);
			}
		});

	});

	socket.on('finance::add', function(finance) {
		log.debug('finance::add', {
			user: room,
			finance: finance
		});
		financeCtrl.addFinance(room, finance, function(err, result) {
			if(err) {
				emitError(err);
				return;
			}

			io.to(room).emit('finance::get', result);
			timelineCtrl.getTimelineItem(result, null, function(err, item) {
				io.to(room).emit('timeline::item', item);
			});
		});
	});

	socket.on('finance::modify', function(msg) {

		log.debug('update finance', msg);
		financeCtrl.updateFinance(msg, function(err, result) {
			if(err) {
				emitError(err);
				return;
			}

			log.debug("Finance modified", result);

			io.to(room).emit('finance::modified', result);

			timelineCtrl.getTimelineItem(result, null, function(err, item) {
				if(err) {
					emitError(err);
					return;
				}

				io.to(room).emit('timeline::item', item);
			});
		});
	});


	socket.on('finance::disable', function(msg) {

		log.debug('disable finance', msg);
		financeCtrl.removeFinance(msg, function(err, result) {
			if(err) {
				log.error('error removing finance', msg);
				emitError(err);
				return;
			}

			log.debug('finance set as disabled', result);

			io.to(room).emit('finance::disabled', result);

			if(!msg.disabled_date) {
				return;
			}

			timelineCtrl.getTimelineItem(result, null, function(err, item) {
				if(err) {
					emitError(err);
					return;
				}

				io.to(room).emit('timeline::item', item);
			});
		});
	});




};


