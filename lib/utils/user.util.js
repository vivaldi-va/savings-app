/**
 * Created by Zaccary on 23/05/2015.
 */

var mongoose = require('mongoose');
var UserModel = require('../api/user/user.model');

module.exports = {
	getUserInfo: function getUserInfo(id, cb) {
		"use strict";
		UserModel.findOne({_id: id}, function(err, result) {
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


	emailExists: function emailExists(email, cb) {
		"use strict";
		if(!cb || typeof cb !== 'function') {
			throw new Error("must provide callback");
		}
		UserModel.findOne({email: email}, function(err, result) {

			if(err) {
				return cb(err);
			}

			if(result) {
				return cb(null, result);
			}

			return cb(null, null);
		});
	}
};