/**
 * Created by vivaldi on 23/12/13.
 */
'use strict';
var cluster 	= require('cluster');
var log			= require('npmlog');

log.enableColor();


if (cluster.isMaster) {
	log.info('Cluster', "setting up master thread");
	// Count the machine's CPUs
	var cpuCount = require('os').cpus().length;

	// Create a worker for each CPU
	for (var i = 0; i < cpuCount; i += 1) {
		cluster.fork();
		log.info('Cluster', "Forking worker " + (i+1));
	}

// Code to run if we're in a worker process
} else {
	log.info('Cluster', "Setting up worker");
	var express 	= require('express');
	var mysql 		= require('mysql');
	var q 			= require('q');
	var dbConf		= require('./lib/config/conf.json');
	var app 		= express();
	var pool		= mysql.createPool(dbConf.db);


	require('./lib/config/express')(app);
	require('./lib/routes')(app);
	require('./lib/config/dbConnection')(pool);


	var port = process.env.PORT || 3000;
	app.listen(port, function() {
		log.info('SERVER', "Listening on port", port);
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
