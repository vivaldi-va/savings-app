/**
 * Created by Zaccary on 23/05/2015.
 */


var request = require('superagent');

module.exports = {
	login: function(email, password, cb) {
		"use strict";

		if(!email) {
			return cb("Email not entered");
		}

		if(!password) {
			return cb("Password not entered");
		}

		request
			.post('/login')
			.send({
				email: email,
				password: password
			})
			.end(function(err, result) {
				console.log(result);
			});
	}
};