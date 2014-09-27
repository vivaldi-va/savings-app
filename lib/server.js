/**
 * Created by vivaldi on 23/12/13.
 */
'use strict';
var cluster 	= require('cluster');
var log4js		= require('log4js');
//log4js.configure('./config/log4js.json');
log4js.configure('./lib/config/log4js.json');

var log		= log4js.getLogger('app');
var dbLog		= log4js.getLogger('db');
var fs			= require('fs');
var path		= require('path');
var express 	= require('express');
var mongoose	= require('mongoose');
var q 			= require('q');
var ok			= require('okay');
var config		= require('./config/config');
//var dbConf		= require('./lib/config/conf.json');


//io.set('transports', ['polling', 'websocket']);


var db = mongoose.connect("mongodb://localhost/savings", ok(function() {
	log.info("Connected to database");
}));

mongoose.connection.on('connected', function () {
	dbLog.info('Mongoose connected');
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
	dbLog.error('MONGODB', 'Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
	dbLog.info('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		dbLog.info('Mongoose default connection disconnected through app termination');
		process.exit(0);
	});
});

var modelsPath = path.join(__dirname, './models');

// Load and require all the mongoose schemas
fs.readdirSync(modelsPath).forEach(function (file) {
	if (/(.*)\.(js$|coffee$)/.test(file)) {
		require(modelsPath + '/' + file);
	}
});


var app 		= express();
var server		= require('http').Server(app);
var io			= require('socket.io').listen(server);

require('./config/express')(app);
require('./routes')(app);
require('./config/socketio')(io);

server.listen(config.port, function() {
	log.info("Listening on port", config.port);
});

exports = module.exports = app;
