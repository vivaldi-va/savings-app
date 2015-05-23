/**
 * Created by Zaccary on 23/05/2015.
 */


var mongoose = require('mongoose');
var config = require('./env');
var log = require('log4js').getLogger('mongoose');

module.exports = function() {
	"use strict";

	mongoose.connect(config.mongo.uri, function(err) {
		if(err) {
			throw err;
		}
	});

	mongoose.connection.on('connected', function() {
		log.info('Mongoose connected');
	});
};