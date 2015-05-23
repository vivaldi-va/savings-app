/**
 * Created by Zaccary on 23/05/2015.
 */


var request = require('superagent');

module.exports = {
	checkSession: function(cb) {
		"use strict";
		cb = cb || function(){};
		request
			.get('/api/auth/session')
			.end(function(err, result) {
				if(err) {
					return cb(err);
				}

				cb(null, result.body);
			});
	},
	login: function(email, password, cb) {
		"use strict";

		if(!email) {
			return cb("Email not entered");
		}

		if(!password) {
			return cb("Password not entered");
		}

		request
			.post('/api/auth/login')
			.send({
				email: email,
				password: password
			})
			.end(function(err, result) {
				console.log(result);
			});
	},
	create: function(username, email, password, cb) {
		"use strict";
		if(!username) {
			return cb("Username not entered");
		}

		if(!email) {
			return cb("Email not entered");
		}

		if(!password) {
			return cb("Password not entered");
		}

		request
			.post('/api/auth/register')
			.send({
				username: username,
				email: email,
				password: password
			})
			.end(function(err, result) {
				console.log(result);
			});
	}
};