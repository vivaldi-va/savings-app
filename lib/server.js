/**
 * Created by vivaldi on 23/12/13.
 */
'use strict';
var cluster 	= require('cluster');
var log4js		= require('log4js');
//log4js.configure('./config/log4js.json');
log4js.configure('./lib/config/log4js.json');

var log			= log4js.getLogger('app');
var dbLog		= log4js.getLogger('db');


if (cluster.isMaster) {
	log.info("setting up master thread");
	// Count the machine's CPUs

	var cpuCount = require('os').cpus().length;


	// Create a worker for each CPU
	for (var i = 0; i < cpuCount; i += 1) {
		cluster.fork();
		log.info("Forking worker " + (i+1));
	}

// Code to run if we're in a worker process
} else {
	log.info("Setting up worker");
	var fs			= require('fs');
	var path		= require('path');
	var express 	= require('express');
	var mongoose	= require('mongoose');
	var q 			= require('q');
	var ok			= require('okay');
	var config		= require('./config/config');
	//var dbConf		= require('./lib/config/conf.json');
	var app 		= express();
	var server		= require('http').Server(app);
	var io			= require('socket.io').listen(server);


	io.set('transports', ['polling', 'websocket']);
	//var db			= mongoose.connect("mongodb://" + dbConf.db.user + ":" + dbConf.db.password + "@" + dbConf.db.host);
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

	var modelsPath	= path.join(__dirname, './models');

	// Load and require all the mongoose schemas
	fs.readdirSync(modelsPath).forEach(function (file) {
		if (/(.*)\.(js$|coffee$)/.test(file)) {
			require(modelsPath + '/' + file);
		}
	});

	require('./config/express')(app);
	require('./routes')(app, io);


	server.listen(config.port, function() {
		log.info("Listening on port", config.port);
	});

	exports = module.exports = app;
}

// Listen for dying workers
cluster.on('exit', function (worker) {

	// Replace the dead worker,
	// we're not sentimental
	log.warn('Cluster', 'Worker ' + worker.id + ' has died', "Goodnight, sweet prince.");
	cluster.fork();
});