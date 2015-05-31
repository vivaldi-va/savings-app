/**
 * Created by Zaccary on 25/05/2015.
 */

var request = require('superagent');
var Cookie = require('react-cookie');
var SocketUtil = require('./SocketUtil');
var actionMap = {
	TIMELINE_ITEM: 'timeline::item',
	TIMELINE_LOAD: 'timeline::load',
	TIMELINE_LOAD_UPDATE: 'timeline::load::modified',
	TIMELINE_COMPLETE: 'timeline::complete'
};

module.exports = {
	initListener: function(eventName, cb) {
		"use strict";
		console.log('init listener', actionMap[eventName]);
		SocketUtil.listen(actionMap[eventName], cb);
	},
	emit: function(eventName, data) {
		"use strict";
		data = data || null;
		SocketUtil.emit(actionMap[eventName], data);
	},
	getEmptyTimeline: function(cb) {
		"use strict";
		var token = Cookie.load('saToken');
		request
			.get('/api/timeline')
			.set('Authorization', token)
			.end(function(err, result) {
				if(err) {
					console.error(err);
					return cb(err);
				}

				cb(null, result.body);
			});
	}
};