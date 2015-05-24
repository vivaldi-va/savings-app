/**
 * Created by vivaldi on 08/03/2015.
 */




module.exports = {
	socket: null,
	authSocket: function(token) {
		"use strict";
		this.socket = io({ query: "token=" + token });
		//console.log(this.socket);
	},
	listen: function(event, cb) {
		"use strict";
		console.log('listen for %s', event);
		this.socket.on(event, cb);
	},
	emit: function(event, data) {
		"use strict";
		console.log('emit %s', event);
		this.socket.emit(event, data);
	}
};