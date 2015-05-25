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
	FINANCE_UPDATED: 'finance::modified',
	TIMELINE_ITEM_UPDATE: null
};

module.exports = {
	initListener: function(eventName, cb) {
		console.log('init listener', actionMap[eventName]);
		SocketUtil.listen(actionMap[eventName], cb);
	},
	emit: function(eventName, data) {
		data = data || null;
		SocketUtil.emit(actionMap[eventName], data);
	}
};