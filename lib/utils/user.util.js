/**
 * Created by Zaccary on 23/05/2015.
 */

var User = require('../api/user/user.model');

module.exports = {
	getUserInfo: function getUserInfo(id, cb) {
		"use strict";
		User.findOne({_id: id}, function(err, result) {
			if(err) {
				cb(err);
			}

			if(!result) {
				cb(null, false);
			} else {
				cb(null, result);
			}
		});
	},


	emailExists: function emailExists(email, next, cb) {
		"use strict";
		User.findOne({email: email}, function(result) {
			if(result) {
				return cb(null, result);
			}

			return cb(null, false);
		});
	}
};