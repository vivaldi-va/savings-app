/**
 * Created by vivaldi on 08/03/2015.
 */

'use strict';
var sio = require('socket.io-client');

var actionMap = {
	FINANCE_GET: 'finance',
	FINANCE_ADD: 'finance-add',
	FINANCE_REMOVE: 'finance-disable',
	FINANCE_UPDATE: 'finance-modify',
	TIMELINE_ITEM_UPDATE: null
};

module.exports = {
	initListener: function(eventName, cb) {
		//sio.on(eventName, cb);
	},
	emit: function(actionType, data) {

		//sio.emit(actionMap[actionType], !!data ? data : {});
	}
}