/**
 * Created by Zaccary on 23/05/2015.
 */


var log = require('log4js').getLogger('verify');
var jwt = require('jsonwebtoken');

var UserModel = null;
var config = require('../config/config');

module.exports = function verify(req, res, next) {
	"use strict";
	if(req.header('Authorization')) {

		jwt.verify(req.header('Authorization'), config.auth.jwt.secret, function(err, decoded) {
			if(err) {
				log.warn("AUTH::FAIL", {ip: req.connection.remoteAddress});
				//res.status = 401;
				res.send(401, 'Unauthorized');
			} else {
				log.debug('Checking if user exists');
				UserModel.findOne({_id: decoded}, function(err, doc) {
					if(err) {
						log.debug('Nope');
						res.send(401, 'Unauthorized');
					} else {
						log.debug('Yup');
						next();
					}
				});
			}
		});
	} else {
		res.send(401, 'ERR_UNAUTHORIZED');
	}
};