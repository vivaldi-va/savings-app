/**
 * Created by vivaldi on 08/03/2015.
 */

'use strict';
var SocketUtil = require('./SocketUtil');
var actionMap = {
	FINANCE_LOAD: 'finance::load',
	FINANCE_GET: 'finance::get',
	FINANCE_ADD: 'finance::add',
	FINANCE_REMOVE: 'finance::disable',
	FINANCE_UPDATE: 'finance::modify',
	TIMELINE_ITEM_UPDATE: null
};

module.exports = {
	initListener: function(eventName, cb) {
		console.log('init listener', actionMap[eventName]);
		SocketUtil.listen(actionMap[eventName], cb);
	},
	emit: function(eventName, data, cb) {

		if(typeof data === 'function') {
			cb = data;
		}

		SocketUtil.emit(actionMap[eventName], cb);
	}
};