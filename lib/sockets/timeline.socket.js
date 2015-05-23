/**
 * Created by vivaldi on 27/09/2014.
 */


'use strict';

var jwt				= require('jsonwebtoken');
var FinanceModel	= require('../finances/finances.model');
var financeCtrl	= require('../finances/finances.controller.js');
var timelineCtrl	= require('./timeline.controller.js');
var log			= require('log4js').getLogger('socket::timeline');

exports.register = function(socket, io) {

	var room = jwt.decode(socket.handshake.query.token);

	socket.on('timeline', function() {
		log.debug('getting timeline');
		var returnModel = {
			"error": null,
			"success": false,
			"data": null
		};


		var start	= new Date(new Date().setMonth(new Date().getMonth() - 2));
		var end	= new Date(new Date().setMonth(new Date().getMonth() + 1));

		var params = {
			"start": start,
			"end": end
		};

		financeCtrl.getFinances(room, function(err, finance) {
			if(err) {
				returnModel.error = err;
			}


			timelineCtrl.getTimelineItem(finance, params, function(err, item) {
				socket.emit('timeline-item', {data: item});
			});

			// TODO make this only fire once
			socket.emit('timeline-complete');
		});
	});

	socket.on('timeline-modify-item', function(msg) {
		var returnModel = {
			"error": null,
			"success": false,
			"data": null
		};

		timelineCtrl.modifyTimelineItem(msg.data, function(err, finance) {
			if(err) {
				returnModel.error = err;
				socket.emit('error', returnModel);
			} else {
				timelineCtrl.getTimelineItem(finance, null, function(err, item) {
					if(err) {
						returnModel.error = err;
						socket.emit('error', returnModel);
					} else {
						socket.broadcast.to(room).emit('timeline-item', {data: item});
					}
				});
			}
		});
	});

};