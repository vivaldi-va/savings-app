/**
 * Created by vivaldi on 23/12/13.
 */

'use strict';
var express = require('express');
var log4js		= require('log4js');
log4js.configure('./lib/config/log4js.json');

var log		= log4js.getLogger('app');
var config		= require('./config/env');


var app 		= exports.app = express();

var server		= require('http').createServer(app);
var io			= require('socket.io')(server);

require('./config/express.config')(app);
require('./config/mongoose.config')();
require('./config/socket.config')(io);
require('./routes')(app);

server.listen(config.port, function() {
	log.info("Listening on port", config.port);
	log.info("Server version: " + config._v);
});

exports = module.exports = app;
