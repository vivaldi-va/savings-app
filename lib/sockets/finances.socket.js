
'use strict';

var jwt				= require('jsonwebtoken');
var FinanceModel	= require('mongoose').model('Finance');
var financeCtrl	= require('../controllers/finances.controller');
var timelineCtrl	= require('../controllers/timeline.controller');
var log			= require('log4js').getLogger('socket::finance');

log.debug("Savings.Server.Sockets.Finances");

exports.register = function(socket, io) {


	var room = jwt.decode(socket.handshake.query.token);


	socket.on('finances', function (event) {

		//log.debug('got request for finances for room %s', room);

		//log.debug('Event ID', event);

		financeCtrl.getFinances(room, function (err, finance) {
			if(!finance.disabled &&
				!(finance.interval === 0 && finance.duedate <= new Date())) {
				socket.emit('finance', finance);
			}
		});

	});

	socket.on('finance-add', function(msg) {
		log.debug('finance-add', {
			user: room,
			finance: msg.data
		});
		financeCtrl.addFinance(room, msg.data, function(err, result) {

			var returnModel = {
				"error": null,
				"success": false,
				"data": null
			};

			if(err) {
				returnModel.error = err;
			} else {
				returnModel.success	= true;
				returnModel.data	= result;
				io.to(room).emit('finance', result);
				timelineCtrl.getTimelineItem(result, null, function(err, item) {
					//log.debug("add finance, receive item");
					io.to(room).emit('timeline-item', {data: item});
				});
			}

			//socket.emit('finance-added', returnModel);
		});
	});

	socket.on('finance-modify', function(msg) {

		var returnModel = {
			"error": null,
			"success": false,
			"data": null
		};

		financeCtrl.updateFinance(msg.data, function(err, result) {
			if(err) {
				returnModel.error = err;
			} else {
				returnModel.success = true;
				returnModel.data = result;
			}

			log.debug("Finance modified", result);
			socket.broadcast.to(room).emit('finance-modified', returnModel);
			timelineCtrl.getTimelineItem(result, null, function(err, item) {
				//log.debug("add finance, receive item");
				io.to(room).emit('timeline-item', {data: item});
			});
		});
	});


	socket.on('finance-disable', function(msg) {
		var returnModel = {
			"error": null,
			"success": false,
			"data": null
		};

		financeCtrl.removeFinance(msg.data, function(err, result) {
			if(err) {
				returnModel.error = err;
			} else {
				returnModel.data = {_id: msg.data._id};
				returnModel.success = true;
			}

			io.to(room).emit('finance-disabled', returnModel);
		});
	});




};

